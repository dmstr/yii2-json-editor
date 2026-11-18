<?php
/**
 * @link http://www.diemeisterei.de/
 * @copyright Copyright (c) 2026 diemeisterei GmbH, Stuttgart
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace dmstr\jsoneditor;

use yii\web\AssetBundle;
use yii\web\JqueryAsset;

/**
 * Plain select2 assets for the flysystem editor, without kartik's widget package
 */
class Select2Asset extends AssetBundle
{
    public $sourcePath = '@vendor/select2/select2/dist';

    public $depends = [
        JqueryAsset::class,
    ];

    public function init()
    {
        // same file choice as kartik's Select2Asset, so pages with both load select2 only once;
        // only as fallback, so js/css stay configurable via assetManager bundles
        $min = YII_DEBUG ? '' : '.min';
        if (empty($this->js)) {
            $this->js = ["js/select2.full{$min}.js"];
        }
        if (empty($this->css)) {
            $this->css = ["css/select2{$min}.css"];
        }
        parent::init();
    }
}
