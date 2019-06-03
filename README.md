# yii2-json-editor

Yii2 wrapper for "[json-editor/json-editor](https://github.com/json-editor/json-editor)" (fork of "[jdorn/json-editor](https://github.com/jdorn/json-editor)").

## Configuration

If you want to use additional tested plugins, such as *CKEditor*, *selectize* or *filefly* you can include the following lines in your view

```
JsonEditorPluginsAsset::register($this);
```

## Usage

```php
$example_schema = [
    'title' => 'Example JSON form',
    'type' => 'object',
    'properties' => [
        'name' => [
            'title' => 'Full Name',
            'type' => 'string',
            'minLength' => 5
        ],
        'date' => [
            'title' => 'Date',
            'type' => 'string',
            'format' => 'date',
        ],
    ],
];
```

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
