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
    /**
     * @var string
     */
    public $sourcePath = '@npm/json-editor--json-editor/dist';

    /**
     * @inheritdoc
     */
    public function registerAssetFiles($view)
    {
        $this->js[] = 'jsoneditor.js';
        parent::registerAssetFiles($view);
    }
}