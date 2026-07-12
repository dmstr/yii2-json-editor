# yii2-json-editor

Yii2 wrapper for "[json-editor/json-editor](https://github.com/json-editor/json-editor)" (fork of "[jdorn/json-editor](https://github.com/jdorn/json-editor)").

## Configuration

If you want to use additional tested plugins, such as *CKEditor*, *selectize* or *filefly* you can include the following lines in your view

```
JsonEditorPluginsAsset::register($this);
```

See the `suggest` section of [`composer.json`](https://github.com/dmstr/yii2-json-editor/blob/master/composer.json) for information about recommended composer packages.



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

## Validation

Add `JsonEditorValidationAction` to your controller. In the example a new class extending the base class
is used to feature the use of filters (custom validator).

```php
<?php

namespace project\modules\frontend\actions;

use project\modules\frontend\helper\AmountSumFilter;
use project\modules\frontend\helper\PrimeFilter;
use dmstr\jsoneditor\actions\JsonEditorValidationAction;

class MyJsonEditorValidationAction extends JsonEditorValidationAction
{
    public static function getFilters()
    {
        return [
            PrimeFilter::class,
            AmountSumFilter::class
        ];
    }
}
```

Filters are used to extend the validator. This is are filter class examples:

A filter that checks that the sum of all `amount` properties of an object array is equal to 100

```php
<?php

namespace project\modules\frontend\helper;

use Opis\JsonSchema\Errors\CustomError;

class AmountSumFilter
{
    public function getType()
    {
        return 'array';
    }

    public function getName()
    {
        return 'amountSum';
    }

    public function getCallable()
    {
        return function ($value, array $args) {
            if (!is_array($value)) {
                return null;
            }

            $expected = 100;
            $actualSum = 0;

            foreach ($value as $item) {
                if (is_object($item) && property_exists($item, 'amount') && is_numeric($item->amount)) {
                    $actualSum += $item->amount;
                }
            }

            if ($actualSum === $expected) {
                return true;
            }

            throw new CustomError("The sum of the 'amount' properties must equal {expected}, but found {actualSum}", [
                "actualSum" => $actualSum,
                "expected" => $expected
            ]);
        };
    }
}
```

A filter to check if a number is a prime number

```php
<?php

namespace project\modules\frontend\helper;

use Opis\JsonSchema\Errors\CustomError;

class PrimeFilter
{
    public function getType()
    {
        return 'number';
    }

    public function getName()
    {
        return 'prime';
    }

    public function getCallable()
    {
        return function (float $value, array $args) {
            if ($value < 2) {
                throw new CustomError("This value is not a prime number: {value}", ["value" => $value]);
            }

            if ($value == 2) {
                throw new CustomError("This value is not a prime number: {value}", ["value" => $value]);
            }

            if ($value % 2 == 0) {
                throw new CustomError("This value is not a prime number: {value}", ["value" => $value]);
            }

            $max = floor(sqrt($value));

            for ($i = 3; $i <= $max; $i += 2) {
                if ($value % $i == 0) {
                    throw new CustomError("This value is not a prime number: {value}", ["value" => $value]);
                }
            }

            return true;
        };
    }
}

```

Add `MyJsonEditorValidationAction` to a controller

```php
public function actions()
{
    $actions = parent::actions();
    $actions[MyJsonEditorValidationAction::getActionName()] = [
        'class' => MyJsonEditorValidationAction::class
    ];
    return $actions;
}
```

Now that the action is added we can activate the `JsonEditorWidget` feature that retrieves and
shows backend validation errors by setting the property `validationAction`. A satic helper 
method is used for the value but can be changed extending the `JsonEditorValidationAction` class.

In the example `show_errors` is set to `never` because we want to display only the
errors produced in the backen. This Improves consistency.

The active fiels option `tag` is set to `false` to remove the generated container around the `JsonEditorWidget`.
This is needed to prevent a know issue that adds the css class ".has-error" to the container making all
fields red.

```php
<?= $form->field($model, 'json', [
    'options' => [
        'tag' => false
    ]
])->widget(JsonEditorWidget::class, [
    'schema' => $model->getJsonSchema(),
    'validationAction' => MyJsonEditorValidationAction::getValidationAction(),
    'clientOptions' => [
    'disable_collapse' => true,
    'disable_properties' => true,
    'disable_edit_json' => true,
    'theme' => 'bootstrap3',
    'show_errors' => 'never'
],
])->label(false) ?>
```

To ensure that the validation is performend on the backend too the `JsonEditorValidator` can be used in the rules.
It takes some parameter that can be accessed trhough the `JsonEditorValidationAction` class helper static methods.
When `validationAction` is set the validator will performe client side validation too. This work together with
the `JsonEditorWidget` to display errors in differen user input scenarions (submit, change, ready, etc).

```php
<?php

namespace project\modules\frontend\models;

use dmstr\jsoneditor\validators\JsonEditorValidator;
use project\modules\frontend\actions\MyJsonEditorValidationAction;
use Yii;
use yii\base\Model;

class TestModel extends Model
{
    public $json;
    public $another_json;
    public $test;

    public function rules()
    {
        return [
            [
                'test',
                'required'
            ],
            [
                'json',
                JsonEditorValidator::class,
                'schema' => $this->getJsonSchema(),
                'validationAction' => MyJsonEditorValidationAction::getValidationAction(),
                'filters' => MyJsonEditorValidationAction::getFilters()
            ],
            [
                'another_json',
                JsonEditorValidator::class,
                'schema' => $this->getAnotherJsonSchema(),
                'validationAction' => MyJsonEditorValidationAction::getValidationAction(),
                'filters' => MyJsonEditorValidationAction::getFilters()
            ]
        ];
    }

    public function getJsonSchema()
    {
        return json_decode('{
          "title": "A JSON Editor",
          "type": "object",
          "properties": {
            "custom_filter": {
              "type": "number",
              "format": "number",
              "$filters": {
                "$func": "prime"
              }
            },
            "id": {
              "type": "string",
              "description": "Example: ABC-123",
              "pattern": "[A-Z]{3}-[0-9]{3,5}"
            },
            "name": {
                "type": "string",
                "minLength": 3,
                "maxLength": 20
            },
            "age": {
              "format": "number",
              "type": "integer",
              "minimum": 18,
              "maximum": 99
            },
            "email": {
              "type": "string",
              "format": "email"
            },
            "orders": {
              "title": "Orders",
              "format": "table",
              "type": "array",
              "uniqueItems": true,
              "minItems": 2,
              "$filters": {
                "$func": "amountSum"
              },
              "items": {
                "type": "object",
                "properties": {
                  "amount": {
                    "type": "number",
                    "format": "number",
                    "minimum": 10
                  },
                  "currency": {
                    "type": "string",
                    "enum": ["USD", "EUR", "GBP"]
                  }
                }
              }
            }
          }
        }', true);
    }

    public function getAnotherJsonSchema()
    {
        return [
            'title' => 'Another JSON Editor',
            'type' => 'object',
            'required' => [
                'name',
                'age',
                'date',
                'favorite_color',
                'gender',
                'location',
                'pets'
            ],
            'properties' => [
                'name' => [
                    'type' => 'string',
                    'description' => 'First and Last name',
                    'minLength' => 4,
                    '$error' => [
                        'minLength' => Yii::t('schema', 'JUP, MINDESTEN 4 BUCHSTABEN PLEASE')
                    ],
                ],
                'age' => [
                    'format' => 'number',
                    'type' => 'integer',
                    'minimum' => 18,
                    'maximum' => 99
                ],
                'favorite_color' => [
                    'type' => 'string',
                    'format' => 'color',
                    'title' => 'favorite color'
                ],
                'gender' => [
                    'type' => 'string',
                    'enum' => [
                        'male',
                        'female',
                        'other'
                    ]
                ],
                'date' => [
                    'type' => 'string',
                    'format' => 'date',
                    'options' => [
                        'flatpickr' => []
                    ]
                ],
                'location' => [
                    'type' => 'object',
                    'title' => 'Location',
                    'properties' => [
                        'city' => [
                            'type' => 'string'
                        ],
                        'state' => [
                            'type' => 'string'
                        ],
                        'citystate' => [
                            'type' => 'string',
                            'description' => 'This is generated automatically from the previous two fields',
                            'template' => '{{city}}, {{state}}',
                            'watch' => [
                                'city' => 'location.city',
                                'state' => 'location.state'
                            ]
                        ]
                    ]
                ],
                'pets' => [
                    'type' => 'array',
                    'format' => 'table',
                    'title' => 'Pets',
                    'uniqueItems' => true,
                    'items' => [
                        'type' => 'object',
                        'title' => 'Pet',
                        'properties' => [
                            'type' => [
                                'type' => 'string',
                                'enum' => [
                                    'cat',
                                    'dog',
                                    'bird',
                                    'reptile',
                                    'other'
                                ]
                            ],
                            'name' => [
                                'type' => 'string'
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }
}
```

- The keyword `$error` is used to add custom error messages. https://github.com/opis/json-schema/issues/80#issuecomment-832098482
- The keyword `$filters` is used to add custom validators https://opis.io/json-schema/2.x/php-filter.html

WARNING:
- Using `$filters` in schemas without creating/registering the relative filter class will result in a fatal error
- Using active field `'tag' => false` when `'enableAjaxValidation' => true`  will not display the backend error message produced by the `JsonEditorValidator`