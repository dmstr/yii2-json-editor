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
use yii\web\JqueryAsset;

class SceditorAsset extends AssetBundle
{
    public $sourcePath =  __DIR__ . '/assets/sceditor/minified';

    public $js = [
        'sceditor.min.js',
        'formats/xhtml.js',
    ];

    public $css = [
        'themes/default.min.css',
    ];

    public $depends = [
        JqueryAsset::class
    ];
}
