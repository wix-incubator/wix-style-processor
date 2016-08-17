import _ from 'lodash';
import parseCssFont from 'parse-css-font';
import WixStylesColorUtils from './wixStylesColorUtils.js';
import WixStylesFontUtils from './wixStylesFontUtils.js';

export default class Replacer {
    static defaultCustomVarRegex = /(--\S*?)\s*:\s*"(\w*?)\(([^\)]*?)\)"/g;
    static defaultCustomVarRemovalRegex = /(--\S*?)\s*:\s*"(\w*?)\(([^\)]*?)\)";/g;

    constructor({css}) {
        this.update({css});
    }

    loadDefaultVariables(css) {
        const defaults = {colors:{}, fonts:{}, numbers: {}};

        // Support CssVars style definition as well
        let match = null;
        while (match = Replacer.defaultCustomVarRegex.exec(css)) {
            let name = match[1];
            const type = match[2];
            const value = match[3];

            switch (type) {
                case 'color':
                    defaults.colors[name] = value;
                    break;
                case 'fontPreset':
                    defaults.fonts[name] = value;
                    break;
                case 'number':
                    defaults.numbers[name] = value;
                    break;
            }
        }

        return defaults;
    }

    removeDefaultCssVars(css) {
        return css.replace(Replacer.defaultCustomVarRemovalRegex, '');
    }

    tokenizeDynamicValues(css) {
        const parts = _.compact(css.split(/"((?:join|color|number|opacity|fontPreset)[^"]*?)"/g));

        let tokens = _.map(parts, (part) => {
            let matches;
            if (part.match(/^(?:join|color|opacity)\(/)) {
                return {type:'css-var-color', value: part};
            } else if (part.match(/^fontPreset\(/)) {
                return {type:'css-var-font', value: part};
            } else if (matches = part.match(/^number\(([^\)]+)/)) {
                return {type: 'css-var-number', value: matches[1].trim()};
            } else {
                return {type:'text', text: part};
            }
        });

        return _.flatten(tokens);
    }

    tokenizeDirectionVars(tokens) {
        _.each(tokens, (token) => {
            if (token.type === 'text') {
                token.text = _.compact(token.text.split(/(STARTSIGN|ENDSIGN|DIR|END|START)/g));
            }
        });
    }

    update({css}) {
        this.defaults = this.loadDefaultVariables(css);
        css = this.removeDefaultCssVars(css);
        this.tokens = this.tokenizeDynamicValues(css);
        this.tokenizeDirectionVars(this.tokens);
    }

    get({colors, fonts, numbers, isRtl}) {
        const css = [];

        _.each(this.tokens, token => {
            switch (token.type) {
                case 'text': {
                    _.each(token.text, text => {
                        if (text === 'STARTSIGN') {
                            css.push(isRtl ? '' : '-');
                        } else if (text === 'ENDSIGN') {
                            css.push(isRtl ? '-' : '');
                        } else if (text === 'START') {
                            css.push(isRtl ? 'right' : 'left');
                        } else if (text === 'END') {
                            css.push(isRtl ? 'left' : 'right');
                        } else if (text === 'DIR') {
                            css.push(isRtl ? 'rtl' : 'ltr');
                        } else {
                            css.push(text);
                        }
                    });
                }
                break;

                case 'css-var-color': {
                    const value = WixStylesColorUtils.calcValueFromString({str:token.value, values:colors});
                    css.push(value);
                }
                break;

                case 'css-var-font': {
                    const value = WixStylesFontUtils.calcValueFromString({str:token.value, values:fonts});
                    const cssValue = toFontCssValue(value);
                    css.push(cssValue);
                }
                break;

                case 'css-var-number': {
                    let entry = token.value;
                    if(_.startsWith(token.value, '--')) {
                        entry = token.value.substr(2, token.value.length-2);
                    }
                    const value = numbers[entry];
                    css.push(value);
                }
                break;

                default: {
                    const value = colors[token.fieldId] || WixStylesColorUtils.calcValueFromString({str:token.default, values:colors});
                    css.push(`${token.type}: ${value};`);
                }
            }
        });

        return css.join('');
    }
};

function toFontCssValue(value) {
    const size = _.isNumber(value.size) ? value.size + 'px' : value.size;
    const lineHeight = _.isNumber(value.lineHeight) ? value.lineHeight + 'px' : value.lineHeight;

    return `${value.style} ${value.variant} ${value.weight} ${size}/${lineHeight} ${value.family.join(',')}`;
}
