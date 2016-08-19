import _ from 'lodash';
import Color from 'color';
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
        return new Color(value).rgbString();
    } catch (e) {
        return 'undefined';
    }
}

function opacity(params, siteVars, evalCustomVar) {
    let colorVal = color(params, siteVars, evalCustomVar);
    let alpha = params[1];
    return (new Color(colorVal)).clearer(1 - alpha).rgbString();
}

function join(params, siteVars, evalCustomVar) {
    let joinParams = _.map(params, (v, i) => i % 2 === 0 ?
                           color([v], siteVars, evalCustomVar) : v);

    let ret = _.reduce(joinParams, (acc, color) => {
        const c = new Color(color);
        acc.red(acc.red()     + c.red()   * c.alpha());
        acc.green(acc.green() + c.green() * c.alpha());
        acc.blue(acc.blue()   + c.blue()  * c.alpha());
        acc.alpha(acc.alpha() + c.alpha());
        return acc;
    }, new Color('rgba(0,0,0,0)'));

    return ret.rgbString();
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
        val = siteVars.fontUtils.toFontCssValue(val);

    return val
}

export default {
    color, number, font, opacity, join
};
