<?php
/**
 * @link http://www.diemeisterei.de/
 * @copyright Copyright (c) 2018 diemeisterei GmbH, Stuttgart
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace dmstr\jsoneditor;

use yii\web\AssetBundle;

class JsonEditorAsset extends AssetBundle
{
    /**
     * @var string
     */
    public $sourcePath = '@npm/json-editor--json-editor/dist';

    /**
     * DOMPurify must be present as `window.DOMPurify` before json-editor runs,
     * otherwise json-editor's internal `purify()` degrades to `cleanText()`
     * and strips all HTML from every string value.
     *
     * @var array
     */
    public $depends = [
        DomPurifyAsset::class,
    ];

    /**
     * @inheritdoc
     */
    public function registerAssetFiles($view)
    {
        $this->js[] = 'jsoneditor.js';
        parent::registerAssetFiles($view);
    }
}