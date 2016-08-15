import _ from "lodash";
import Color from 'color';

let WixColorUtils = {
    getFullColorStyles({colorStyles, siteColors, defaults}) {
        let ret = {};

        // Fix color styles due to '.' to '-' conversion
        const fixedColorStyles = {};
        _.each(colorStyles, (v, k) => fixedColorStyles[k.replace(/\./g, '-')] = v);

        // Helper functions
        // Basic definitions
        ret['white'] = '#FFFFFF';
        ret['black'] = '#000000';

        // Basic template colors
        _.each(['color-1',
            'color-2',
            'color-3',
            'color-4',
            'color-5',
            'color-6',
            'color-7',
            'color-8',
            'color-9',
            'color-10',
            'color-18'
        ], (key) => ret[key] = (fixedColorStyles[key] || {}).value ||_.find(siteColors, (c) => c.reference == key).value);

        // Fix for a bug in a very specific template
        ret.background = (fixedColorStyles.background || {}).value || (ret['color-1'] === '#FFFFFF') && (ret['color-2'] === '#F4EFE1') ? ret['color-2'] : ret['color-1'];

        const working = _.clone(_.toPairs(defaults));
        while (working.length > 0) {
            const [key, defString, tried = false] = working.shift();
            try {
                ret[key] = (fixedColorStyles[key] || {}).value || (fixedColorStyles[key] || {}).rgba || this.calcValueFromString({ str: defString, values: ret });
            } catch (e) {
                if (e === 'unparsed') {
                    if (tried) {
                        throw(new Error(`[WixStylesColorUtils] Using unkown key as default for ${key}.`));
                    }
                    working.push([key, defString, true]);
                } else {
                    throw(e);
                }
            }
        }

        return ret;
    },

    calcValueFromString({str, values}) {
        const functions = {
            'get':(key) => {
                if (key.startsWith('"') && key.endsWith('"')) {
                    key = key.substr(1, key.length - 2);
                }

                key = key.replace(/\./g, '-');

                // Variables are defined in the css as color-xxx, but in the styles as xxx (for backwards compatibility).
                // So, we need to make sure to check for both
                const value = (() => {
                    if (values[key]) return values[key];
                    if (key.startsWith('color-')) return values[key.substr(6)]; // support 'bbb' and 'color-bbb' for same variable
                })();

                if (value) return value;

                try {
                    // Try to parse the string as a color, return if successful.
                    return new Color(key).rgbString();
                } catch(e) {
                    throw 'unparsed';
                }
            },
            'opacity':(params) => {
                const match = params.match(/^(.*),(.*)$/);
                const value = fromDefaultString(match[1]);
                const alpha = parseFloat(match[2]);
                return (new Color(value)).clearer(1 - alpha).rgbString();
            },
            'join':(params) => {

                if ((params.startsWith('[')) && (params.endsWith(']'))) {
                    params = params.substr(1, params.length - 2);
                }

                var tokenRegex = /\(([^(]*?)\)/
                let m = null;

                while (m = params.match(tokenRegex)) {
                    const token = `_<_${m[1]}_>_`.replace(/,/g, '_|_');
                    params = params.replace(tokenRegex, token);
                }
                const arr = _.map(params.split(','), p => p.replace(/_<_/g, '(').replace(/_>_/g, ')').replace(/_\|_/g, ',').trim());

                let ret = _.reduce(arr, (acc, color) => {
                    const c = new Color(fromDefaultString(color));
                    acc.red(acc.red()     + c.red()   * c.alpha());
                    acc.green(acc.green() + c.green() * c.alpha());
                    acc.blue(acc.blue()   + c.blue()  * c.alpha());
                    acc.alpha(acc.alpha() + c.alpha());
                    return acc;
                }, new Color('rgba(0,0,0,0)'));

                return ret.rgbString();
            }
        };

        function fromDefaultString(str) {
            const match = str.match(/(\w*)\((.*)\)$/);
            if (!match) return functions['get'](str);
            return functions[match[1]](match[2]);
        }

        return fromDefaultString(str);
    }
};

export default WixColorUtils;
