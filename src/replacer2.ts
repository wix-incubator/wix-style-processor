import * as Color from 'color';
import fontUtils from './wixStylesFontUtils';

const funcsRegexStr = '(' + ['color', 'opacity', 'darken', 'string', 'join', 'number', 'font', 'increment', 'incrementer', 'withoutOpacity'].join('|') + ')\\((.*)\\)';
const paramsRegex = /,(?![^(]*\))/g;
const funcsRegex = new RegExp(funcsRegexStr);
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

let values;
let key1;

export function replacer2({
                              declaration,
                              colors,
                              fonts,
                              numbers,
                              strings,
                              vars
                          }, plugins) {
    let [key, value] = declaration.split(':');
    values = arguments[0];
    key1 = key;
    //if (key.indexOf('--') === 0)
    if (plugins.declarationTransformers.length > 0) {
        plugins.declarationTransformers.forEach(plugin => {
            declaration = concatKeyValue(plugin(declaration.split(':')[0].trim(), declaration.split(':')[1].trim()));
        });

        function concatKeyValue(keyValue) {
            return keyValue.key + ':' + keyValue.value;
        }

        console.log(declaration);
        return declaration;
    }
    if (isSupportedFunction(value)) {
        const newValue = executeFunction(value);
        // if (typeof newValue === 'object') {
        //     newValue = JSON.parse(newValue);
        // }
        return key + ': ' + newValue;
    }
}

const plugins = {
    join: (...args) => {

        console.log(args);
        let color1 = new Color(args[0]);
        let color2 = new Color(args[2]);

        //todo: use strength
        //let color1strength = args[1];
        //let color2strength = args[3];

        const r = ((color1.red() / 255 + color2.red() / 255) * 255);
        const g = ((color1.green() / 255 + color2.green() / 255) * 255);
        const b = ((color1.blue() / 255 + color2.blue() / 255) * 255);
        const a = ((color1.alpha() + color2.alpha()) / 2);

        return new Color({r, g, b}).alpha(a).rgb().string();
    },
    color: (colorValue) => {
        if (values.colors[colorValue]) {
            return values.vars[colorValue] || values.colors[colorValue];
        }
        try {
            if (hexColorRegex.test(colorValue)) {
                return colorValue;
            }
            return new Color(colorValue).rgb().string();
        } catch (e) {
            throw 'unparsable color ' + colorValue;
        }
    },
    font: (font) => {
        let fontValue;
        if (typeof font === 'object') {
            fontValue = font;
        } else if (values.fonts[font]) {
            fontValue = values.fonts[font];
        }
        else {
            return font;
        }
        let fontCssValue = fontUtils.toFontCssValue(fontValue);
        if (fontCssValue[fontCssValue.length - 1] === ';') {
            fontCssValue = fontCssValue.split(';')[0];
        } else {
            //todo: else never reached
        }
        return fontCssValue;

    },
    opacity: (color, opacity) => {
        return (new Color(color)).fade(1 - opacity).rgb().string();
    },
    string: (value) => {
        return values.vars[value] || value;
    }
};

function getValue(value) {
    if (value.indexOf('--') === 0) {
        let varValue = values.vars[value];
        if (isSupportedFunction(varValue)) {
            var varValueAfterExcution = executeFunction(varValue);
            return varValueAfterExcution;
        }

        if (values.vars[value]) {
            return values.vars[value];
        } else {
            //no var declared, maybe is has value in style params (from settings)
            let varNameInSettings = value.substring(2, value.length);
            if (values.strings[varNameInSettings] && values.strings[varNameInSettings].value) {
                return values.strings[varNameInSettings].value;
            } else if (values.colors[varNameInSettings]) {
                return values.colors[varNameInSettings];
            } else if (values.fonts[varNameInSettings]) {
                return values.fonts[varNameInSettings];
            }
        }
    }

    //not a var
    return value;
}

function executeFunction(value) {
    let groups;
    if (groups = funcsRegex.exec(value)) {
        return plugins[groups[1]](...groups[2].split(paramsRegex).map(executeFunction));
    } else {
        return getValue(value);
    }
}

function isSupportedFunction(value) {
    return funcsRegex.test(value);
}
