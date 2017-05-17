import {each, extend, includes, omit, isNumber} from 'lodash';
import * as parseCssFont from 'parse-css-font';

const WixFontUtils = {
    getFullFontStyles({fontStyles, siteTextPresets}) {
        let ret = {};

        // Fix color styles due to '.' to '-' conversion
        const fixedFontStyles = {};
        each(fontStyles, (v, k) => fixedFontStyles[k.replace(/\./g, '-')] = v);

        const parsedSiteTextPresets = {};
        each(siteTextPresets, (preset, key) => {
            if (preset.displayName) {
                parsedSiteTextPresets[key] = extend({}, parseCssFont(preset.value), {preset:key, editorKey:preset.editorKey, displayName:preset.displayName});
            } else {
                parsedSiteTextPresets[key] = extend({}, parseCssFont(preset.value), {preset:key, editorKey:preset.editorKey});
            }
        });

        const parsedFontStyles = {};
        each(fixedFontStyles, (value, key) => parsedFontStyles[key] = parseWixStylesFont(value));

        // Basic template colors
        each(parsedSiteTextPresets, (preset, key) => ret[key] = parsedFontStyles[key] || preset);

        // LIGHT/MEDIUM/STRONG
            ret['LIGHT'] = parseCssFont('12px HelveticaNeueW01-45Ligh');
            ret['MEDIUM'] = parseCssFont('12px HelveticaNeueW01-55Roma');
            ret['STRONG'] = parseCssFont('12px HelveticaNeueW01-65Medi');

        ret = Object.assign(ret, parsedFontStyles);

        each(ret, (font, key) => {
            ret[key] = extend({}, font, {supports:{uppercase:true}});

            if ((includes((<any>font).family, 'snellroundhandw')) || (includes((<any>font).family, 'niconne'))) {
                ret[key].supports.uppercase = false;
            }

            if (ret[key].lineHeight === 'normal') {
                ret[key].lineHeight = '1.4em'; // Wix's normal line height is 1.4em...
            }

            if (ret[key].size === 'normal') {
                ret[key].size = '17px';
            }
        });

        return ret;
    },

    calcValueFromString({str, values}) {
        const preset = (_default) => values[_default];
        const font = (_default) => extend({}, values[_default.template], omit(_default, 'template'));

        let m = null;

        if (m = str.match(/fontPreset\((.*)\)$/)) {
            return preset(m[1].trim());
        } else if (values[str]) {
            return values[str];
        } else {
            throw(new Error(`Unknown font default ${str}`));
        }
    },

    toFontCssValue(value) {
        const size = isNumber(value.size) ? value.size + 'px' : value.size;
        const lineHeight = isNumber(value.lineHeight) ? value.lineHeight + 'px' : value.lineHeight;

        return `${value.style} ${value.variant} ${value.weight} ${size}/${lineHeight} ${value.family.join(',')}`;
    }
};

function parseWixStylesFont(font) {
    let value = '';

    if (font.style.italic) {
        value = 'italic ';
    }

    if (font.style.bold) {
        value += 'bold ';
    }

    let size = font.size || 'normal';
    if (isNumber(size)) size = size + 'px';
    let lineHeight = font.lineHeight || 'normal';
    if (isNumber(lineHeight)) lineHeight = lineHeight + 'px';

    value += size + '/' + lineHeight +' ';

    value += font.cssFontFamily || font.family;

    return parseCssFont(value);
}

export default WixFontUtils;
