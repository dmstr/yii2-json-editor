# yii2-json-editor

Yii2 wrapper for "[json-editor/json-editor](https://github.com/json-editor/json-editor)" (is a fork of "[jdorn/json-editor](https://github.com/jdorn/json-editor)").

## Example

```php
$form->field($model, 'example_field')->widget(JsonEditorWidget::className(), [
    'schema' => $example_schema,
    'clientOptions' => [
        'theme' => 'bootstrap3',
        'disable_collapse' => true,
        'disable_edit_json' => true,
        'disable_properties' => true,
        'no_additional_properties' => true,
    ],
]);
```
