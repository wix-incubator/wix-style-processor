import _ from 'lodash';
import Color from 'color';
import {Parser, Stringifier} from 'shady-css-parser';

function replacer({css, colors, fonts, numbers, isRtl}) {

    return traverse();

    function traverse() {
        var parser = new Parser();
        var ast = parser.parse(css);

        walkDecls(ast, decl => {
            let match = decl.value.match(/^"([^"]+)"/);
            if (match)
                decl.setValue(recursiveEval(match[1]));
        });

        var stringifier = new Stringifier();
        let newCss = stringifier.stringify(ast);
        return newCss;
    }


    function recursiveEval(value) {
        const match = value.match(/(\w*)\((.*)\)$/);

        if (match) {
            const isSingleMatch = /^(\w*)\(([^()]+)\)$/.test(value);

            if (isSingleMatch && !getCustomVar(match[2])) {
                return singleEval(match[1], match[2]);
            }

            return singleEval(match[1], recursiveEval(match[2]));
        } else if (value.indexOf(',') !== -1) {
            return evalParameterList(value);
        } else {
            return singleEval(value);
        }
    }

    function evalParameterList(value) {
        let params = processParams(value);
        let evaledParams = _.map(params, p => recursiveEval(p));
        let stringifiedEvaledParams = evaledParams.join(',');
        return stringifiedEvaledParams;
    }

    function singleEval(transformation, rawParams) {
        let params = rawParams && processParams(rawParams);
        let result;

        switch (transformation) {
            case 'color':
                result = color(params[0]);
                break;
            case 'opacity':
                result = opacity(color(params[0]), params[1]);
                break;
            case 'join':
                result = join(params);
                break;
            case 'number':

                break;
            case 'font':

                break;
            default:
                if (transformation && !rawParams) {
                    let customVar = getCustomVar(transformation);
                    if (customVar){
                        result = evalCustomVar(customVar);
                    }
                    else
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

    function evalCustomVar(customVar) {
        let customVarVal = colors[customVar];
        let evaled = recursiveEval(customVarVal);
        return evaled;
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
            const c = new Color(color);
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
