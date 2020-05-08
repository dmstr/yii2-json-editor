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
use dosamigos\selectize\SelectizeAsset;
use yii\web\JqueryAsset;
use dosamigos\ckeditor\CKEditorAsset;

class JsonEditorPluginsAsset extends AssetBundle
{
    public $sourcePath = '@dmstr/jsoneditor/assets/';

    public $js = [
        'editors/filefly.js',
        'editors/ckeditor.js',
        'editors/ckplugins/divarea.js',
    ];

    public $depends = [
        SelectizeAsset::class,
        CKEditorAsset::class,
        JqueryAsset::class
    ];

}
