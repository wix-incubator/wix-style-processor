import _ from 'lodash';
import postcss from 'postcss';
import Color from 'color';

function parse(css, {colors, fonts, numbers, isRtl}) {

    css.walkDecls(decl => {
        decl.value = recursiveEval(decl.value);
    });

    function recursiveEval(value) {
        const match = value.match(/(\w*)\((.*)\)$/);

        if (match) {
            const isSingleMatch = /^(\w*)\(([^()]+)\)$/.test(value);

            if (isSingleMatch) {
                return singleEval(match[1], match[2]);
            }

            return singleEval(match[1], recursiveEval(match[2]));
        } else if (value.indexOf(',') !== -1) {
            return evalParameterList(value);
        } else {
            return value;
        }
    }

    function evalParameterList(value) {
        let params = processParams(value);
        let evaledParams = _.map(params, p => recursiveEval(p));
        let stringifiedEvaledParams = evaledParams.join(',');
        return stringifiedEvaledParams;
    }

    function singleEval(transformation, rawParams) {
        let params = processParams(rawParams);
        let result;

        switch (transformation) {
            case 'get':
                result = color(params[0]);
                break;
            case 'var':
                break;
            case 'opacity':
                result = opacity(color(params[0]), params[1]);
                break;
            case 'join':

                break;
            case 'number':

                break;
            case 'font':

                break;
        }

        // console.log("trans", transformation, "params", params, "result", result);
        return result;
    }

    function processParams(params) {
        if (_.startsWith(params, 'rgb') || params.indexOf(',') === -1) {
            return [params.trim()];
        } else {
            let splitted = _.map(params.split(","), p => p.trim());
            return splitted;
        }
    }

    function color(value) {
        let predefined = colors[value];

        if (predefined)
            return predefined;

        try {
            return new Color(value).rgbString();
        } catch (e) {
            return 'undefined';
        }
    }

    function opacity(color, alpha) {
        return (new Color(color)).clearer(1 - alpha).rgbString();
    }

    function join(params) {
        let ret = _.reduce(params, (acc, color) => {
            const c = new Color(fromDefaultString(color));
            acc.red(acc.red()     + c.red()   * c.alpha());
            acc.green(acc.green() + c.green() * c.alpha());
            acc.blue(acc.blue()   + c.blue()  * c.alpha());
            acc.alpha(acc.alpha() + c.alpha());
            return acc;
        }, new Color('rgba(0,0,0,0)'));

        return ret.rgbString();
    }
}


//****************************

const plugin = postcss.plugin('wss-parser', opts => css => parse(css, opts));
export default plugin;
