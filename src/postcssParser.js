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
                console.log('single match for', value)
                return singleEval(match[1], match[2]);
            }

            console.log('m1', match[1], 'm2', match[2])
            return singleEval(match[1], recursiveEval(match[2]));
        } else {
            console.log('v', value)
            return value;
        }
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
                let baseColor = color(params[0]);
                let alpha = params[1];
                result = opacity(baseColor, alpha);
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

    function join(color1, color1Percent, color2, color2Percent) {

    }
}


//****************************

const plugin = postcss.plugin('wss-parser', opts => css => parse(css, opts));
export default plugin;
