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
        // if set use CKEditor configurations from settings module else use default configuration.
        $json = \Yii::$app->settings->get('ckeditor.config', 'widgets');
        $ckeditorConfiguration = isset($json->scalar) ? $json->scalar : "{}";
        $script = "window.CKCONFIG = {$ckeditorConfiguration};";
        \Yii::$app->view->registerJs($script, \yii\web\View::POS_HEAD);


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

        parent::init();
        JsonEditorAsset::register($this->getView());
        JsonEditorPluginsAsset::register($this->getView());
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
            throw new \Exception($e->getMessage());
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

        parent::run();
    }
}

?>
