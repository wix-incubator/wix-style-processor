import _ from "lodash";
import parseCssFont from 'parse-css-font';

const WixFontUtils = {
    getFullFontStyles({fontStyles, siteTextPresets, isHebrew}) {
        let ret = {};

        // Fix color styles due to '.' to '-' conversion
        const fixedFontStyles = {};
        _.each(fontStyles, (v, k) => fixedFontStyles[k.replace(/\./g, '-')] = v);

        const parsedSiteTextPresets = {};
        _.each(siteTextPresets, (preset, key) => {
            if (preset.displayName) {
                parsedSiteTextPresets[key] = _.extend({}, parseCssFont(preset.value), {preset:key, editorKey:preset.editorKey, displayName:preset.displayName});
            } else {
                parsedSiteTextPresets[key] = _.extend({}, parseCssFont(preset.value), {preset:key, editorKey:preset.editorKey});
            }
        });

        const parsedFontStyles = {};
        _.each(fixedFontStyles, (value, key) => parsedFontStyles[key] = parseWixStylesFont(value));

        // Basic template colors
        _.each(parsedSiteTextPresets, (preset, key) => ret[key] = parsedFontStyles[key] || preset);

        // LIGHT/MEDIUM/STRONG
        if (isHebrew) {
            ret['LIGHT'] = ret['MEDIUM'] = ret['STRONG'] = parseCssFont('12px Arial');
        } else {
            ret['LIGHT'] = parseCssFont('12px HelveticaNeueW01-45Ligh');
            ret['MEDIUM'] = parseCssFont('12px HelveticaNeueW01-55Roma');
            ret['STRONG'] = parseCssFont('12px HelveticaNeueW01-65Medi');
        }

        _.each(ret, (font, key) => {
            if (isHebrew) {
                font = JSON.parse(JSON.stringify(font));
                font.family = ['Arial'];
            }

            ret[key] = _.extend({}, font, {supports:{uppercase:true}});

            if ((_.includes(font.family, 'snellroundhandw')) || (_.includes(font.family, 'niconne'))) {
                ret[key].supports.uppercase = false;
            }

            if (ret[key].lineHeight === 'normal') {
                ret[key].lineHeight = '1.5em'; // Wix's normal line height is 1.5em...
            }
        });

        return ret;
    },

    calcValueFromString({str, values}) {
        const preset = (_default) => values[_default];
        const font = (_default) => _.extend({}, values[_default.template], _.omit(_default, 'template'));

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
        const size = _.isNumber(value.size) ? value.size + 'px' : value.size;
        const lineHeight = _.isNumber(value.lineHeight) ? value.lineHeight + 'px' : value.lineHeight;

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
    if (_.isNumber(size)) size = size + 'px';
    let lineHeight = font.lineHeight || 'normal';
    if (_.isNumber(lineHeight)) lineHeight = lineHeight + 'px';

    value += size + '/' + lineHeight +' ';

    value += font.cssFontFamily || font.family;

    return parseCssFont(value);
}

export default WixFontUtils;
