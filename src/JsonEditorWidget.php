<?php
/**
 * @link http://www.diemeisterei.de/
 * @copyright Copyright (c) 2018 diemeisterei GmbH, Stuttgart
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace dmstr\jsoneditor;

use yii\base\InvalidConfigException;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\widgets\InputWidget as BaseWidget;

/**
 * Yii2 wrapper widget for json-editor/json-editor.
 * @author Marc Mautz <marc@diemeisterei.de>
 * @link https://github.com/dmstr/yii2-json-editor
 * @link https://github.com/json-editor/json-editor
 * @license https://github.com/json-editor/json-editor/blob/master/LICENSE
 */
class JsonEditorWidget extends BaseWidget
{
    /**
     * @var array the HTML attributes for the input tag.
     * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $options = [];

    /**
     * An array that contains the schema to build the form from.
     * Required. Json::encode will be used.
     * @var array
     */
    public $schema = null;

    /**
     * Id of input that will contain the resulting JSON object.
     * Defaults to null, in which case a hidden input will be rendered.
     * @var string|null
     */
    public $inputId = null;

    /**
     * @var array the HTML attributes for the widget container tag.
     * The "tag" element specifies the tag name of the container element and defaults to "div".
     * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $containerOptions = [];

    /**
     * Options to be passed to the client. (Schema and starting value are ignored.)
     * List of valid options can be found here:
     * https://github.com/jdorn/json-editor/blob/master/README.md
     * @var array
     */
    public $clientOptions = [];

    /**
     * Language key for json-editor translations
     * @var string|null
     */
    public $language = null;

    /**
     * if true JsonEditorPluginsAsset will be registered
     *
     * @var bool
     */
    public $registerPluginAsset = false;

    /**
     * If true, a hidden input will be rendered to contain the results
     * @var boolean
     */
    private $_renderInput = true;

    /**
     * Initializes the widget
     * @inheritdoc
     * @throws InvalidConfigException
     */
    public function init()
    {
        if ($this->name === null && !$this->hasModel() && $this->selector === null) {
            throw new InvalidConfigException("Either 'name', or 'model' and 'attribute' properties must be specified.");
        }

        if (null === $this->schema) {
            throw new InvalidConfigException("You must specify 'schema' property.");
        }

        if ($this->hasModel() && !isset($this->options['id'])) {
            $this->options['id'] = Html::getInputId($this->model, $this->attribute);
        }

        if ($this->hasModel()) {
            $this->name  = empty($this->options['name']) ? Html::getInputName($this->model, $this->attribute) : $this->options['name'];
            $this->value = Html::getAttributeValue($this->model, $this->attribute);
        }

        if (!isset($this->containerOptions['id'])) {
            $this->containerOptions['id'] = ($this->hasModel() ? Html::getInputId($this->model, $this->attribute) : $this->getId()) . '-container';
        }

        if ($this->inputId === null) {
            $this->inputId = $this->options['id'];
        } else {
            $this->_renderInput = false;
        }

        if ($this->language === null) {
            $this->language = \Yii::$app->language;
        }

        parent::init();
        if ($this->registerPluginAsset) {
            JsonEditorPluginsAsset::register($this->getView());
        }
        JsonEditorAsset::register($this->getView());
    }

    /**
     * Renders the widget
     * @inheritdoc
     */
    public function run()
    {
        // Prepare data
        $view = $this->getView();

        // Render input for results
        if ($this->_renderInput) {
            if ($this->hasModel()) {
                echo Html::activeHiddenInput($this->model, $this->attribute, $this->options);
            } else {
                echo Html::hiddenInput($this->name, $this->value, $this->options);
            }
        }

        // Render editor container
        $containerOptions = $this->containerOptions;
        $tag              = ArrayHelper::remove($containerOptions, 'tag', 'div');
        echo Html::tag($tag, '', $containerOptions);

        // Prepare client options
        $clientOptions           = $this->clientOptions;
        $clientOptions['schema'] = $this->schema;

        try {
            $parsedValue = Json::decode($this->value);
        } catch (\Exception $e) {
            $parsedValue = null;
            \Yii::error($e->getMessage(), __METHOD__);
        }

        if (!empty($parsedValue)) {
            $clientOptions['startval'] = $parsedValue;
        }

        $clientOptions = Json::encode($clientOptions);

        // Prepare element IDs
        $widgetId    = $this->id;
        $inputId     = $this->inputId;
        $containerId = $this->containerOptions['id'];

        // Add the "JSONEditor" instance to the global window object, otherwise the instance is only available in "ready()" function scope
        $widgetJs = "window.{$widgetId} = new JSONEditor(document.getElementById('{$containerId}'), {$clientOptions});\n";
        // Add the "JSONEditor" instance to the global window.jsonEditors array.
        $widgetJs .= "if (!window.jsonEditors) { window.jsonEditors = []; } window.jsonEditors.push(window.{$widgetId});";

        $readyFunction = '';
        $readyFunction .= "{$widgetId}.on('change', function() { document.getElementById('{$inputId}').value = JSON.stringify({$widgetId}.getValue()); });\n";

        $widgetJs .= "{$widgetId}.on('ready', function() {\n{$readyFunction}\n});";

        // Register js code
        $view->registerJs($widgetJs, $view::POS_READY);
        $this->registerAdditionalLanguages();

        parent::run();
    }

    /**
     * Returns JsonSchema meta-schema
     *
     * @return mixed|null
     */
    public static function metaSchema()
    {
        $metaSchema = file_get_contents(\Yii::getAlias(__DIR__.'/meta_schema.json'));
        return Json::decode($metaSchema);
    }

    /**
     * Register additional languages via app language
     */
    public function registerAdditionalLanguages()
    {
        $view = $this->getView();
        $view->registerJs("
JSONEditor.defaults.languages['" . $this->language . "'] = {
    button_add_row_title: '" . \Yii::t('json-editor', 'Add {{0}}', [], $this->language) . "',
    button_collapse: '" . \Yii::t('json-editor', 'Collapse', [], $this->language) . "',
    button_copy_row_title_short: '" . \Yii::t('json-editor', 'Copy', [], $this->language) . "',
    button_delete_all: '" . \Yii::t('json-editor', 'All', [], $this->language) . "',
    button_delete_all_title: '" . \Yii::t('json-editor', 'Delete All', [], $this->language) . "',
    button_delete_last: '" . \Yii::t('json-editor', 'Last {{0}}', [], $this->language) . "',
    button_delete_last_title: '" . \Yii::t('json-editor', 'Delete Last {{0}}', [], $this->language) . "',
    button_delete_node_warning: '" . \Yii::t('json-editor', 'Are you sure you want to remove this node?', [], $this->language) . "',
    button_delete_row_title: '" . \Yii::t('json-editor', 'Delete {{0}}', [], $this->language) . "',
    button_delete_row_title_short: '" . \Yii::t('json-editor', 'Delete', [], $this->language) . "',
    button_expand: '" . \Yii::t('json-editor', 'Expand', [], $this->language) . "',
    button_move_down_title: '" . \Yii::t('json-editor', 'Move down', [], $this->language) . "',
    button_move_up_title: '" . \Yii::t('json-editor', 'Move up', [], $this->language) . "',
    button_object_properties: '" . \Yii::t('json-editor', 'Object Properties', [], $this->language) . "',
    choices_placeholder_text: '" . \Yii::t('json-editor', 'Start typing to add value', [], $this->language) . "',
    default_array_item_title: '" . \Yii::t('json-editor', 'item', [], $this->language) . "',
    error_additionalItems: '" . \Yii::t('json-editor', 'No additional items allowed in this array', [], $this->language) . "',
    error_additional_properties: '" . \Yii::t('json-editor', 'No additional properties allowed, but property {{0}} is set', [], $this->language) . "',
    error_anyOf: '" . \Yii::t('json-editor', 'Value must validate against at least one of the provided schemas', [], $this->language) . "',
    error_date: '" . \Yii::t('json-editor', 'Date must be in the format {{0}}', [], $this->language) . "',
    error_datetime_local: '" . \Yii::t('json-editor', 'Datetime must be in the format {{0}}', [], $this->language) . "',
    error_dependency: '" . \Yii::t('json-editor', 'Must have property {{0}}', [], $this->language) . "',
    error_disallow: '" . \Yii::t('json-editor', 'Value must not be of type {{0}}', [], $this->language) . "',
    error_disallow_union: '" . \Yii::t('json-editor', 'Value must not be one of the provided disallowed types', [], $this->language) . "',
    error_enum: '" . \Yii::t('json-editor', 'Value must be one of the enumerated values', [], $this->language) . "',
    error_hostname: '" . \Yii::t('json-editor', 'The hostname has the wrong format', [], $this->language) . "',
    error_invalid_epoch: '" . \Yii::t('json-editor', 'Date must be greater than 1 January 1970', [], $this->language) . "',
    error_ipv4: '" . \Yii::t('json-editor', 'Value must be a valid IPv4 address in the form of 4 numbers between 0 and 255, separated by dots', [], $this->language) . "',
    error_ipv6: '" . \Yii::t('json-editor', 'Value must be a valid IPv6 address', [], $this->language) . "',
    error_maxItems: '" . \Yii::t('json-editor', 'Value must have at most {{0}} items', [], $this->language) . "',
    error_maxLength: '" . \Yii::t('json-editor', 'Value must be at most {{0}} characters long', [], $this->language) . "',
    error_maxProperties: '" . \Yii::t('json-editor', 'Object must have at most {{0}} properties', [], $this->language) . "',
    error_maximum_excl: '" . \Yii::t('json-editor', 'Value must be less than {{0}}', [], $this->language) . "',
    error_maximum_incl: '" . \Yii::t('json-editor', 'Value must be at most {{0}}', [], $this->language) . "',
    error_minItems: '" . \Yii::t('json-editor', 'Value must have at least {{0}} items', [], $this->language) . "',
    error_minLength: '" . \Yii::t('json-editor', 'Value must be at least {{0}} characters long', [], $this->language) . "',
    error_minProperties: '" . \Yii::t('json-editor', 'Object must have at least {{0}} properties', [], $this->language) . "',
    error_minimum_excl: '" . \Yii::t('json-editor', 'Value must be greater than {{0}}', [], $this->language) . "',
    error_minimum_incl: '" . \Yii::t('json-editor', 'Value must be at least {{0}}', [], $this->language) . "',
    error_multipleOf: '" . \Yii::t('json-editor', 'Value must be a multiple of {{0}}', [], $this->language) . "',
    error_not: '" . \Yii::t('json-editor', 'Value must not validate against the provided schema', [], $this->language) . "',
    error_notempty: '" . \Yii::t('json-editor', 'Value required', [], $this->language) . "',
    error_notset: '" . \Yii::t('json-editor', 'Property must be set', [], $this->language) . "',
    error_oneOf: '" . \Yii::t('json-editor', 'Value must validate against exactly one of the provided schemas. It currently validates against {{0}} of the schemas.', [], $this->language) . "',
    error_pattern: '" . \Yii::t('json-editor', 'Value must match the pattern {{0}}', [], $this->language) . "',
    error_required: '" . \Yii::t('json-editor', 'Object is missing the required property \"{{0}}\"', [], $this->language) . "',
    error_time: '" . \Yii::t('json-editor', 'Time must be in the format {{0}}', [], $this->language) . "',
    error_type: '" . \Yii::t('json-editor', 'Value must be of type {{0}}', [], $this->language) . "',
    error_type_union: '" . \Yii::t('json-editor', 'Value must be one of the provided types', [], $this->language) . "',
    error_uniqueItems: '" . \Yii::t('json-editor', 'Array must have unique items', [], $this->language) . "',
    flatpickr_clear_button: '" . \Yii::t('json-editor', 'Clear', [], $this->language) . "',
    flatpickr_toggle_button: '" . \Yii::t('json-editor', 'Toggle', [], $this->language) . "'
};
JSONEditor.defaults.language = '" . $this->language . "';",
            \yii\web\View::POS_READY,
            'json-editor'
        );
    }
}

?>
