# yii2-json-editor

Yii2 wrapper for "[json-editor/json-editor](https://github.com/json-editor/json-editor)" (fork of "[jdorn/json-editor](https://github.com/jdorn/json-editor)").

## Configuration

If you want to use additional tested plugins, such as *CKEditor*, *selectize* or *filefly* you can include the following lines in your view

```
JsonEditorPluginsAsset::register($this);
```

See the `suggest` section of [`composer.json`](https://github.com/dmstr/yii2-json-editor/blob/master/composer.json) for information about recommended composer packages.

## Changelog

### 1.3

- updated `json-editor` to `^2.3.5` (affects custom editor `extends` usage, [see commit](https://github.com/dmstr/yii2-json-editor/commit/731dd3dce28887fabd536f5c5ba37218ba243c73))

### 1.2

See `git log`

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

## Plugin Bundles

This packages contains optional asset bundles for specialized plugings that can be rgistered when activated in the
configuration array.

- CKEditorAsset (active per default for backward compatibility reasons)
- JoditAsset
- SceditorAsset
- SimpleMDEAsset

```php
$form->field($model, 'example_field')->widget(JsonEditorWidget::className(), [
    'schema' => $example_schema,
    'registerCKEditorAsset' => true, // CKEditorAsset will be registered (default true)
    'registerJoditAsset' => true, // JoditAsset will be registered (default false)
    'registerSceditorAsset' => true, // SceditorAsset will be registered (default false)
    'registerSimpleMDEAsset' => true, // SimpleMDEAsset will be registered (default false)
    'clientOptions' => [
        'theme' => 'bootstrap3',
    ]
]);
```