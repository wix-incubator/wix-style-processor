import each = require('lodash/each');
import map = require('lodash/map');
import reduce = require('lodash/reduce');
import startsWith = require('lodash/startsWith');
import endsWith = require('lodash/endsWith');
import Color = require('color');

let WixColorUtils = {
    getFullColorStyles({colorStyles, siteColors}: {siteColors: [{reference, value}], colorStyles: Object}) {
        let returnValue: any = {};
        // Fix color styles due to '.' to '-' conversion
        let fixedColorStyles: any = {};

        for (let key in colorStyles) {
            fixedColorStyles[key.replace(/\./g, '-')] = colorStyles[key].value;
        }

        // Helper functions
        // Basic definitions
        returnValue['white'] = '#FFFFFF';
        returnValue['black'] = '#000000';
        // Basic template colors
        each(siteColors,
            ({reference, value}) => {
                returnValue[reference] = value;
            });

        returnValue = Object.assign(returnValue, fixedColorStyles);
        // Fix for a bug in a very specific template
        returnValue['background'] = (fixedColorStyles.background || {}).value || (returnValue['color-1'] === '#FFFFFF') && (returnValue['color-2'] === '#F4EFE1') ? returnValue['color-2'] : returnValue['color-1'];
        return returnValue;
    },

    calcValueFromString({str, values}) {
        const functions = {
            'color': (key) => {
                if (startsWith(key, '"') && endsWith(key, '"')) {
                    key = key.substr(1, key.length - 2);
                }

                key = key.replace(/\./g, '-');

                if (startsWith(key, '--')) {
                    key = key.substr(2, key.length - 2);
                }

                // Variables are defined in the css as color-xxx, but in the styles as xxx (for backwards compatibility).
                // So, we need to make sure to check for both
                const value = (() => {
                    if (values[key]) return values[key];
                    if (startsWith(key, 'color-')) return values[key.substr(6)]; // support 'bbb' and 'color-bbb' for same variable
                })();

                if (value) return value;

                try {
                    // Try to parse the string as a color, return if successful.
                    return new Color(key).rgb().string();
                } catch (e) {
                    throw 'unparsed';
                }
            },
            'opacity': (params) => {
                const match = params.match(/^(.*),(.*)$/);
                const value = fromDefaultString(match[1]);
                const alpha = parseFloat(match[2]);
                return (new Color(value)).fade(1 - alpha).rgb().string();
            },
            'join': (params) => {

                if (startsWith(params, '[') && endsWith(params, ']')) {
                    params = params.substr(1, params.length - 2);
                }

                var tokenRegex = /\(([^(]*?)\)/;
                let m = null;

                while (m = params.match(tokenRegex)) {
                    const token = `_<_${m[1]}_>_`.replace(/,/g, '_|_');
                    params = params.replace(tokenRegex, token);
                }
                const arr = map(params.split(','), p => (<any>p).replace(/_<_/g, '(').replace(/_>_/g, ')').replace(/_\|_/g, ',').trim());

                let ret = reduce(arr, (acc, color) => {
                    const c = new Color(fromDefaultString(color));
                    acc.red(acc.red() + c.red() * c.alpha());
                    acc.green(acc.green() + c.green() * c.alpha());
                    acc.blue(acc.blue() + c.blue() * c.alpha());
                    acc.alpha(acc.alpha() + c.alpha());
                    return acc;
                }, new Color('rgba(0,0,0,0)'));

                return ret.rgb().string();
            }
        };

        function fromDefaultString(str) {
            const match = str.match(/(\w*)\((.*)\)$/);
            if (!match) return functions['color'](str);
            return functions[match[1]](match[2]);
        }

        return fromDefaultString(str);
    }
};

export default WixColorUtils;
