<?php

namespace dmstr\jsoneditor\validators;

use Yii;
use yii\validators\Validator;
use dmstr\jsoneditor\helpers\JsonEditorValidatorHelper;

class JsonEditorValidator extends Validator
{
    public $schema;
    public $validationAction = null;
    public $filters = [];

    public function clientValidateAttribute($model, $attribute, $view)
    {
        if (empty($this->validationAction)) {
            return '';
        }

        $csrfToken = Yii::$app->request->getCsrfToken();
        $widgetRefName = $model->formName() . $attribute;
        $schema = json_encode($this->schema);

        return <<<JS
            const def = $.Deferred();
            const editor = window['$widgetRefName'].editor
            const json = editor.getValue()
            const jsonSchema = JSON.parse('{$schema}')
            
            fetch('{$this->validationAction}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': '{$csrfToken}'
                },
                body: JSON.stringify({
                    json: json,
                    jsonSchema: jsonSchema
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'error') {
                    const root = editor.root.formname
        
                    const mappedErrors = data.errors.map((error) => {
                        error.path = error.path.replace(/^\//, root + '.').replace(/\//g, '.');
        
                        if (error.path === root + '.') {
                            error.path = root
                        }
                        
                        messages.push(error.message);
        
                        return error
                    });
        
                    for (let key in editor.editors) {
                        const childEditor = editor.editors[key]
        
                        if (childEditor) {
                            childEditor.is_dirty = true
                            childEditor.showValidationErrors(mappedErrors)
                        }
                    }
                }
                def.resolve();
            })
            .catch((error) => {
                console.error('Error:', error);
                def.resolve();
            });
            
            deferred.push(def);
       JS;
    }

    public function validateAttribute($model, $attribute)
    {
        $jsonValidatorHelper = new JsonEditorValidatorHelper();
        $value = json_decode($model->$attribute, true);
        $jsonValidatorErrors = $jsonValidatorHelper->validateJson($value, $this->schema, $this->filters);

        if (!empty($jsonValidatorErrors)) {
            if (!empty($this->message)) {
                $this->addError($model, $attribute, $this->message);
            } else {
                $message = '';

                foreach ($jsonValidatorErrors as $error) {
                    $message .= $error['message'] . ', ';
                }

                if (!empty($message)) {
                    $this->addError($model, $attribute, $message);
                }
            }
        }
    }
}
