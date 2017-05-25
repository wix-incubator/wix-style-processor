import {map} from 'lodash';
import * as Color from 'color';
import fontUtils from './wixStylesFontUtils';

function color(params, siteVars, evalCustomVar) {
    let value = params[0];
    let colorCustomVar = evalCustomVar('color', value);

    if (colorCustomVar)
        return colorCustomVar;

    let predefined = siteVars.colors[value];

    if (predefined)
        return predefined;

    try {
        return new Color(value).rgb().string();
    } catch (e) {
        return 'undefined';
    }
}

function opacity(params, siteVars, evalCustomVar) {
    let colorVal = color(params, siteVars, evalCustomVar);
    let alpha = params[1];
    return (new Color(colorVal)).fade(1 - alpha).rgb().string();
}

function darken(params, siteVars, evalCustomVar) {
    let colorVal = color(params, siteVars, evalCustomVar);
    let darkenValue = params[1];
    return (new Color(colorVal)).darken(darkenValue).rgb().string();
}

function join(params, siteVars, evalCustomVar) {
    let joinParams = map(params, (v, i) => i % 2 === 0 ?
        color([v], siteVars, evalCustomVar) : v);

    let color1 = new Color(joinParams[0]);
    let color2 = new Color(joinParams[2]);

    const r = ((color1.red() / 255 + color2.red() / 255) * 255);
    const g = ((color1.green() / 255 + color2.green() / 255) * 255);
    const b = ((color1.blue() / 255 + color2.blue() / 255) * 255);
    const a = ((color1.alpha() + color2.alpha()) / 2);

    return new Color({r, g, b}).alpha(a).rgb().string();
}

function number(params, siteVars, evalCustomVar) {
    let val = evalCustomVar('number', params[0]);

    if (!val)
        val = siteVars.numbers[params[0]];

    return val;
}

function font(params, siteVars, evalCustomVar) {
    let val = evalCustomVar('font', params[0]);

    if (!val)
        val = siteVars.fonts[params[0]];

    if (typeof(val) === 'object')
        val = fontUtils.toFontCssValue(val);

    return val;
}

function string(params, siteVars, evalCustomVar) {
    if (params[0].indexOf('--') === -1) {
        return params[0];
    }

    let result = evalCustomVar('string', params[0]);
    return result.value || result;
}

export default {
    color, number, font, opacity, join, darken, string
};
