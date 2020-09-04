<?php
/**
 * @link http://www.diemeisterei.de/
 * @copyright Copyright (c) 2020 diemeisterei GmbH, Stuttgart
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace dmstr\jsoneditor;

use kartik\select2\Select2;
use yii\base\Model;
use yii\helpers\Html;
use yii\helpers\Url;
use yii\widgets\InputWidget;

/**
 * --- PUBLIC PROPERTIES ---
 *
 * @property array $select2Options
 * @property array $jsonEditorOptions
 *
 * @property string $jsonEditorAttribute
 *
 * @property string|array $ajaxUrl
 * @property string $urlPkAttribute
 * @property string $schemaAttribute
 *
 * @property string $confirmMessage
 *
 * --- INHERITED PROPERTIES ---
 *
 * @property Model $model
 * @property string $attribute
 *
*/
class JsonEditorSchemaWidget extends InputWidget
{

    public $select2Options = [];
    public $jsonEditorOptions = [];

    public $jsonEditorAttribute;

    public $ajaxUrl = [];
    public $urlPkAttribute = 'id';
    public $schemaAttribute;

    public $confirmMessage;

    public function run()
    {
        if ($this->hasModel()) {
            $this->select2Options['model'] = $this->model;
            $this->select2Options['attribute'] = $this->attribute;
        } else {
            $this->select2Options['name'] = $this->name;
        }

        $this->registerAssets();
        return Select2::widget($this->select2Options);
    }

    private function registerAssets()
    {
        $ajaxUrl = Url::to($this->ajaxUrl);
        $jsonEditorContainerId = Html::getInputId($this->model, $this->jsonEditorAttribute) . '-container';
        $select2Id = Html::getInputId($this->model, $this->attribute);
        $jsonEditorOptions = json_encode($this->jsonEditorOptions);

        $this->view->registerJs(<<<JS
$("#{$select2Id}").on("select2:select", function () {
    var value = $(this).val();
    var url = "{$ajaxUrl}?{$this->urlPkAttribute}=" + value;
    $.get(url, function (data) {
        var schema = JSON.parse(data.{$this->schemaAttribute})
        if (schema && confirm("{$this->confirmMessage}")) {
            var index;
            for(var i = 0; i < jsonEditors.length; i++) { 
                   if (jsonEditors[i].element.id === "{$jsonEditorContainerId}") {
                       jsonEditors[i].destroy();
                       index = i
                   }
            }
            
            var jsonEditorOptions = {$jsonEditorOptions};
            jsonEditorOptions.schema = schema;
            
            jsonEditors[index].destroy();
            jsonEditors[index] = new JSONEditor(document.getElementById("{$jsonEditorContainerId}"), jsonEditorOptions)
        }
    })
});
JS
);
    }
}