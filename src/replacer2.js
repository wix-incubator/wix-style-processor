import _ from 'lodash';
import Color from 'color';
import {Parser, Stringifier} from 'shady-css-parser';

let innerQuotesRegex = /^"([^"]+)"/;
let singleTransformRegex = /^(\w*)\((.*)\)$/;
let singleMatchRegex = /^(\w*)\(([^()]+)\)$/;

function replacer({css, colors, fonts, numbers, isRtl}) {

    const customVarContainers = {
        color: colors,
        font: fonts,
        number: numbers
    };

    return traverse();

    function traverse() {
        var parser = new Parser();
        var ast = parser.parse(css);

        walkDecls(ast, decl => {
            try {
                let match = decl.value.match(innerQuotesRegex);

                if (match) {
                    let evaled = recursiveEval(match[1]);
                    let replaced = decl.value.replace(innerQuotesRegex, evaled);
                    decl.setValue(replaced);
                }
            } catch (err) {
                console.error(err)
            }
        });

        var stringifier = new Stringifier();
        let newCss = stringifier.stringify(ast);
        return newCss;
    }


    function recursiveEval(value) {
        const match = value.match(singleTransformRegex);
        const transformation = match && match[1];
        const params = match && match[2];

        if (match) {
            const isSingleMatch = singleMatchRegex.test(value);

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

    function singleEval(transformation, rawParams) {
        let params = rawParams && processParams(rawParams);
        let result;

        switch (transformation) {
            case 'color':
                result = color(params);
                break;
            case 'opacity':
                result = opacity(params);
                break;
            case 'join':
                result = join(params);
                break;
            case 'number':
                result = number(params);
                break;
            case 'font':
                result = font(params);
                break;
            default:
                if (transformation && !rawParams) {
                    result = transformation;
                }
                break;
        }

        // console.log("trans", transformation, "params", params, "result", result);
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
        let commaRegex = /,(?![^(]*\))/g;
        let match;
        let indices = [], args = [];

        while ((match = commaRegex.exec(params)) !== null) {
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


//****************************

function walkDecls(ast, cb) {
    if (ast.type === 'declaration') {
        return cb({
            name: ast.name,
            value: ast.value.text,
            setValue: newVal => ast.value.text = newVal
        });
    }

    ast.rules && _.each(ast.rules, r => walkDecls(r, cb));
    ast.rulelist && walkDecls(ast.rulelist, cb);
}

export default replacer;
