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

class Select2Asset extends AssetBundle
{
    /**
     * @var string
     */
    public $sourcePath = '@npm/select2/dist';

    /**
     * @var array
     */
    public $css = [
        'css/select2.css',
    ];

    /**
     * @var array
     */
    public $js = [
        'js/select2.full.js',
    ];

    /**
     * @var array
     */
    public $depends = [
        'yii\bootstrap\BootstrapAsset',
        'yii\web\JqueryAsset',
    ];
}
