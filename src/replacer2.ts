import * as Color from 'color';
import fontUtils from './wixStylesFontUtils';
import {concatKeyValue, getFunctionSignature, isCssVar, isJsonLike, isSupportedFunction, parseJson} from './utils';

const paramsRegex = /,(?![^(]*(?:\)|}))/g;
const customSyntaxRegex = /"\w+\([^"]*\)"/g;
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

let values;

export function replacer2({
    declaration,
    colors,
    fonts,
    numbers,
    strings,
    vars
}, plugins) {
    let [key, ...value] = declaration.split(':');
    key = key.trim();
    value = value.join(':').trim();

    values = arguments[0];

    if (plugins.declarationTransformers.length > 0) {
        plugins.declarationTransformers.forEach(plugin => {
            declaration = concatKeyValue(plugin(key, value));
        });

        [key, ...value] = declaration.split(':');
        key = key.trim();
        value = value.join(':').trim();
    }

    let newValue = value.replace(customSyntaxRegex, (part) => {
        if (isSupportedFunction(part)) {
            return executeFunction(part);
        }
        return part;
    });

    return key + ': ' + newValue;
}

const plugins = {
    join: (color1, strength1, color2, strength2) => {

        color1 = new Color(color1);
        color2 = new Color(color2);

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
        } else if (isJsonLike(font)) {
            const {theme, ...overrides} = parseJson(font);
            fontValue = Object.assign({}, values.fonts[theme], overrides);
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
    withoutOpacity: (color) => {
        return (new Color(color)).alpha(1).rgb().string();
    },
    string: (value) => {
        return values.vars[value] || value;
    },
    darken: (colorVal, darkenValue) => {
        return (new Color(colorVal)).darken(darkenValue).rgb().string();
    },
    number: (value) => {
        return +value;
    }
};

function executeFunction(value) {
    let functionSignature;
    if (functionSignature = getFunctionSignature(value)) {
        return plugins[functionSignature.funcName](...functionSignature.args.split(paramsRegex).map(executeFunction));
    } else {
        return getVarOrPrimitiveValue(value);
    }
}


function getVarOrPrimitiveValue(value) {
    if (isCssVar(value)) {
        if (getVarValueFromSettingsOrDefault(value)) {
            value = getVarValueFromSettingsOrDefault(value);
        }
        if (isSupportedFunction(value)) {
            value = executeFunction(value);
        }
    }

    return value;
}

function getVarValueFromSettingsOrDefault(varName) {
    let varValue = values.vars[varName];
    //no var declared, maybe is has value in style params (from settings)
    let varNameInSettings = varName.substring(2, varName.length);
    if (values.strings[varNameInSettings] && values.strings[varNameInSettings].value) {
        return values.strings[varNameInSettings].value;
    } else if (values.colors[varNameInSettings]) {
        return values.colors[varNameInSettings];
    } else if (values.fonts[varNameInSettings]) {
        return values.fonts[varNameInSettings];
    } else if (values.numbers[varNameInSettings]) {
        return values.numbers[varNameInSettings];
    }
    //not a var
    return varValue;
}
