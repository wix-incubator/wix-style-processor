import _ from 'lodash';
import Color from 'color';

const declarationRegex = /(.*?):(.*?);/g;
const innerQuotesRegex = /^"([^"]+)"/;
const transformRegex = /^(\w*)\((.*)\)$/;
const singleTransformRegex = /^(\w*)\(([^()]+)\)$/;
const processParamsRegex = /,(?![^(]*\))/g;

function replacer({css, colors, fonts, numbers, isRtl}) {

    const customVarContainers = {
        color: colors,
        font: fonts,
        number: numbers
    };

    const transformations = {
        color,
        number,
        font,
        opacity,
        join
    }

    return replace();

    function replace() {
        let replacedCss = css.replace(declarationRegex, (decl, key, val) => {
            try {
                return replaceDeclaration(decl, key, val)
            } catch (err) {
                console.error('failed replacing declaration', err);
                return decl;
            }
        });

        return replacedCss;
    }

    function replaceDeclaration(decl, key, val) {
        let replacedVal = val.trim();
        let replacedKey = key.trimRight();
        let innerMatch = replacedVal.match(innerQuotesRegex);

        replacedVal = replaceRtlStrings(replacedVal);
        replacedKey = replaceRtlStrings(replacedKey);

        if (innerMatch) {
            replacedVal = replaceInnerQuotes(replacedVal, innerMatch[1]);
        }

        return `${replacedKey}: ${replacedVal};`;
    }

    function replaceInnerQuotes(val, innerVal) {
        let evaled = recursiveEval(innerVal);
        return val.replace(innerQuotesRegex, evaled);
    }

    function replaceRtlStrings(str) {
        let replaced = str.replace(/STARTSIGN/g, isRtl ? '' : '-')
                          .replace(/ENDSIGN/g, isRtl ? '-' : '')
                          .replace(/START/g, isRtl ? 'right' : 'left')
                          .replace(/END/g, isRtl ? 'left' : 'right')
                          .replace(/DIR/g, isRtl ? 'rtl' : 'ltr');
        return replaced;
    }

    function recursiveEval(value) {
        const hasTransform = value.match(transformRegex);
        const transformation = hasTransform && hasTransform[1];
        const params = hasTransform && hasTransform[2];

        if (hasTransform) {
            const isSingleMatch = singleTransformRegex.test(value);

            if (isSingleMatch) {
                return singleEval(transformation, params);
            }

            let evaledParams = evalParameterList(params);
            return singleEval(transformation, evaledParams);
        } else {
            return singleEval(value);
        }
    }

    function evalParameterList(value) {
        let params = processParams(value);
        let evaledParams = _.map(params, p => {
            let p2 = recursiveEval(p);
            return p2;
        });
        let stringifiedEvaledParams = evaledParams.join(',');
        return stringifiedEvaledParams;
    }

    function singleEval(selectedTransformation, rawParams) {
        let params = rawParams && processParams(rawParams);
        let transformation = transformations[selectedTransformation];
        let result = transformation && transformation(params);

        if (!result && arguments.length === 1) {
            result = arguments[0];
        }

        return result;
    }

    function getCustomVar(value) {
        return _.startsWith(value, '--') && value.substr(2, value.length - 2);
    }

    function evalCustomVar(transform, customVar) {
        let customVarVal = customVarContainers[transform][getCustomVar(customVar)];
        if (customVarVal) {
            let evaled = recursiveEval(customVarVal);
            return evaled;
        }
    }

    function processParams(params) {
        let match;
        let indices = [], args = [];

        while ((match = processParamsRegex.exec(params)) !== null) {
            indices.push(match.index);
        }

        let pos = 0;
        for (let i = 0; i < indices.length + 1; i++) {
            let idx = indices[i] || params.length;
            let arg = params.substr(pos, idx - pos );
            args.push(arg.trim());
            pos = idx + 1;
        }

        return args;
    }

    function color(params) {
        let value = params[0];

        let colorCustomVar = evalCustomVar('color', value);

        if (colorCustomVar)
            return colorCustomVar;

        let predefined = colors[value];

        if (predefined)
            return predefined;

        try {
            return new Color(value).rgbString();
        } catch (e) {
            return 'undefined';
        }
    }

    function opacity(params) {
        let colorVal = color(params);
        let alpha = params[1];
        return (new Color(colorVal)).clearer(1 - alpha).rgbString();
    }

    function join(params) {
        let joinParams = _.map(params, (v, i) => i % 2 === 0 ? color([v]) : v);

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

    function number(params) {
        return evalCustomVar('number', params[0]);
    }

    function font(params) {
        return evalCustomVar('font', params[0]);
    }
}

export default replacer;
