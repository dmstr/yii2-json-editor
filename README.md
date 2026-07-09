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

## File picker editors

Three string editors render a file picker instead of a plain text input. They
all store a single file path as the field value and are selected via the
schema `format`:

| `format`         | Backend                                      | Widget    | Auth (default)   |
|------------------|----------------------------------------------|-----------|------------------|
| `filefly`        | FileFly (`/filefly/api`)                     | selectize | session/cookie   |
| `flysystem`      | generic filesystem API (`/filemanager/api`)  | select2   | session/none     |
| `flysystem-rest` | `eluhr/yii2-flysystem-rest-api`             | selectize | session/cookie   |

### `flysystem-rest` (drop-in replacement for `filefly`)

`flysystem-rest` mirrors the `filefly` editor (selectize UI, image thumbnail
preview, array row handling) but targets the
[`eluhr/yii2-flysystem-rest-api`](https://git.hrzg.de/e.luhr/yii2-flysystem-rest-api)
module.

By default it works exactly like `filefly`: **session/cookie auth on the same
origin, no client configuration.** The read endpoints it uses (`search` and
`stream`) are `GET` and accept the logged-in backend session when the API
module runs with `enableSessionAuth`. The browser sends the auth cookie
automatically, so nothing has to be passed through the widget — consumers only
set the schema `format`. The default base URL is `/filemanager/api`.

Migrating an existing `filefly` field is just a format change:

```php
'file' => [
    'type' => 'string',
    'format' => 'flysystem-rest',
    // optional per-field overrides:
    // 'apiBaseUrl' => '/filemanager/api',
    // 'storageId'  => 'my-storage',
],
```

That is all that is required for the common (same-origin backend) case.

#### Advanced: overriding defaults / stateless JWT auth

For a different mount point, a storage filter, or **stateless JWT auth** (e.g.
a cross-origin or programmatic setup), the widget can inject a global
`window.FLYSYSTEMRESTCONFIG` via the optional `flysystemRestConfig` option:

```php
$form->field($model, 'example_field')->widget(JsonEditorWidget::class, [
    'schema' => $example_schema,
    'registerPluginAsset' => true,
    'flysystemRestConfig' => [
        'apiBaseUrl'      => \yii\helpers\Url::to(['/filemanager/api'], true),
        'jwt'             => $jwt,   // only for JWT auth mode; omit for session
        'storageId'       => null,
        'imageExtensions' => ['jpg', 'jpeg', 'gif', 'svg', 'png', 'bmp'],
    ],
]);
```

When `jwt` is set, the editor sends `Authorization: Bearer <jwt>` on the
`search` request; otherwise it relies on the session cookie. The `stream`
endpoint (thumbnail previews) always uses plain image `src` URLs.

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