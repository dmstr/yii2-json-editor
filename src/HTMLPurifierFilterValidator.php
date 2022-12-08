<?php


namespace dmstr\jsoneditor;


use yii\helpers\HtmlPurifier;
use yii\helpers\Json;
use yii\validators\FilterValidator;

class HTMLPurifierFilterValidator extends FilterValidator
{
    public function init () {
        $this->filter = function ($value) {
            $array = is_array($value) ? $value : Json::decode($value);

            array_walk_recursive($array, function (&$value) {
                if (is_string($value)) {
                    $value = HtmlPurifier::process($value);
                }
            });

            return is_array($value) ? $array : Json::encode($array);
        };

        parent::init();
    }
}
