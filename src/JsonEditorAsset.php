<?php
/**
 * @link http://www.diemeisterei.de/
 * @copyright Copyright (c) 2018 diemeisterei GmbH, Stuttgart
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace dmstr\JsonEditor;

use yii\web\AssetBundle;

class JsonEditorAsset extends AssetBundle
{
    public $sourcePath = '@npm/json-editor/dist';

    public function registerAssetFiles($view)
    {
        if (YII_ENV_DEV) {
            $this->js[] = 'jsoneditor.js';
        } else {
            $this->js[] = 'jsoneditor.min.js';
        }
        parent::registerAssetFiles($view);
    }
}