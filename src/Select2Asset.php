<?php
// file generated with AI assistance: Claude Code - [2026-11-16 13:30:00 UTC]
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
        // same file choice as kartik's Select2Asset, so pages with both load select2 only once
        $min = YII_DEBUG ? '' : '.min';
        $this->js = ["js/select2.full{$min}.js"];
        $this->css = ["css/select2{$min}.css"];
        parent::init();
    }
}
