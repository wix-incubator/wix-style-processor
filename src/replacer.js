import _ from 'lodash';
import parseCssFont from 'parse-css-font';
import WixStylesColorUtils from './wixStylesColorUtils.js';
import WixStylesFontUtils from './wixStylesFontUtils.js';

export default class Replacer{
    constructor({css}) {
        this.update({css});
    }

    loadDefaultVariables(token) {
        const defaults = {colors:{}, fonts:{}};

        // Support CssVars style definition as well
        const regex = /--(\S*?)\s*:\s*\"([^"]*?)\"/g;
        let match = null;
        while (match = regex.exec(token.text)) {
            let name = match[1];
            const value = match[2];
            if (name.startsWith('color-')) {
                defaults.colors[name.substr(6)] = value;
            } else if (name.startsWith('font-')) {
                defaults.fonts[name.substr(5)] = value;
            }
        }

        return defaults;
    }

    removeDefaultCssVars(token) {
        return {type:'text', text: token.text.replace(/--(\S*)\s*:\s*\"([^"]*?)\";/g, "")};
    }

    tokenizeDynamicValues(css) {
        const parts = _.compact(css.split(/"([var|join|get|opacity|preset|font][^"]*?)"/g));

        let tokens = _.map(parts, (part) => {

            if (part.startsWith('var(')) {
                part = part.substr(4, part.length - 5);

                if (part.indexOf('color-') > -1) {
                    return {type:'css-var-color', value:part};
                } else if (part.indexOf('font-') > -1) {
                    return {type:'css-var-font', value:part};
                } else if (part.indexOf('number-') > -1) {
                    return {type:'css-var-number', value:part};
                }
            } else if (part.match(/^(join|get|opacity)\(/)) {
                return {type:'css-var-color', value:part};
            } else if (part.match(/^(preset|font)\(/)) {
                return {type:'css-var-font', value:part};
            }

            return {type:'text', text: part};
        });

        return _.flatten(tokens);
    }

    tokenizeDirectionVars(tokens) {
        // Split all text tokens to old fashioned WixRest CSS (extracting all "_@BLAHBLAH", START, END, ...)
        _.each(tokens, (token) => {
            if (token.type === 'text') {
                token.text = _.compact(token.text.split(/(STARTSIGN|ENDSIGN|DIR|END|START)/g));
            }
        });
    }

    update({css}) {
        let token = {
            type: 'text',
            text: css
        };

        this.defaults = this.loadDefaultVariables(token);
        token = this.removeDefaultCssVars(token);
        this.tokens = this.tokenizeDynamicValues(token.text);
        this.tokenizeDirectionVars(this.tokens);
    }

    get({colors, fonts, numbers, isRtl}) {
        const css = [];

        _.each(this.tokens, token => {

            if (token.type === 'text') {

                _.each(token.text, text => {

                    if (text.type === 'color') {
                        css.push(colors[text.key]);
                    } else if (text.type === 'font') {
                        const font = fonts[text.key] || {};
                        const value = fontJoin({base:font, default:font.family}, fonts);
                        const cssValue = toFontCssValue(value);
                        css.push(cssValue);
                    } else if (text === 'STARTSIGN') {
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

            } else if (token.type === 'css-var-color') {
                const value = WixStylesColorUtils.calcValueFromString({str:token.value, values:colors});
                css.push(value);

            } else if (token.type === 'css-var-font') {
                const value = WixStylesFontUtils.calcValueFromString({str:token.value, values:fonts});
                const cssValue = toFontCssValue(value);
                css.push(cssValue);

            } else if (token.type === 'css-var-number') {
                const value = numbers[token.value.replace(/^number-/, '')];
                css.push(value);

            } else if (token.type === 'font') {
                const value = fontJoin(token, fonts);
                const cssValue = toFontCssValue(value);
                css.push(`${token.type}: ${cssValue};`);
            } else {
                const value = colors[token.fieldId] || WixStylesColorUtils.calcValueFromString({str:token.default, values:colors});
                css.push(`${token.type}: ${value};`);
            }
        });

        return css.join('');
    }
};

function fontJoin(token, fonts) {

    if (fonts[token.fieldId]) return;

    const parseFamily = (family) => {

        if (family.startsWith('MEDIUM_')) {
            family = family.substr(7);
        }

        const recursive = fonts[family];

        if (recursive) {
            return _.map(recursive.family, r => parseFamily(r)).join(',');
        } else {
            return family;
        }
    }

    const family = _.map(token.default, (r) => parseFamily(r));

    return _.extend({}, token.base, {family});

}

function toFontCssValue(value) {
    const size = _.isNumber(value.size) ? value.size + 'px' : value.size;
    const lineHeight = _.isNumber(value.lineHeight) ? value.lineHeight + 'px' : value.lineHeight;

    let cssValue = `${value.style} ${value.variant} ${value.weight} ${size}/${lineHeight} ${value.family.join(',')}`;

    return cssValue;
}
