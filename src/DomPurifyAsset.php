<?php
// file generated with AI assistance: Claude Code - 2026-08-07 08:06:38 UTC
/**
 * @link http://www.diemeisterei.de/
 * @copyright Copyright (c) 2018 diemeisterei GmbH, Stuttgart
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace dmstr\jsoneditor;

use yii\web\AssetBundle;

/**
 * Provides DOMPurify as the global `window.DOMPurify`.
 *
 * json-editor sanitizes every string value through its own `purify()` method.
 * That method uses `window.DOMPurify` when available and otherwise falls back
 * to `cleanText()`, which pipes the value through `element.textContent` and
 * therefore strips *all* markup. Without this bundle every WYSIWYG field
 * (CKEditor, Jodit, Sceditor) silently loses its HTML on load and save.
 *
 * Must be loaded before JsonEditorAsset, see {@see JsonEditorAsset::$depends}.
 *
 * @link https://github.com/cure53/DOMPurify
 */
class DomPurifyAsset extends AssetBundle
{
    /**
     * @var string
     */
    public $sourcePath = '@npm/dompurify/dist';

    /**
     * @var array the UMD build, which assigns `window.DOMPurify`
     */
    public $js = [
        'purify.min.js',
    ];
}