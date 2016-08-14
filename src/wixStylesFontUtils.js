import _ from "lodash";
import parseCssFont from 'parse-css-font';

const WixFontUtils = {

    publicEmbeddedToSiteTextsPresets({fonts}) {

        const NAME_TO_REFERENCE = {
            'font_7':'Body-L',
            'font_8':'Body-M',
            'font_9':'Body-S',
            'font_10':'Body-XS',
            'font_4':'Heading-L',
            'font_5':'Heading-M',
            'font_6':'Heading-S',
            'font_3':'Heading-XL',
            'font_1':'Menu',
            'font_2':'Page-title',
            'font_0':'Title',
        };

        const presets = {};

        _.each(fonts, (value, name) => presets[NAME_TO_REFERENCE[name]] = {value : value.replace(/\s*{color_.*}/, ''), editorKey:name});

        return presets;
    },

    getFullFontStyles({fontStyles, siteTextPresets, defaults, isHebrew}) {
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

        _.each(_.toPairs(defaults), ([key, value]) => {
            ret[key] = parsedFontStyles[key] || this.calcValueFromString({str:value, values:ret});
        });

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

    fontToUiLibStructure(font) {
        return {
            size:parseInt(font.size),
            style:{},
            family:font.family.join(','),
            preset:font.preset,
            editorKey: font.editorKey,
            displayName: font.displayName
        };
    },

    toFontCssValue(font) {
        const size = _.isNumber(font.size) ? font.size + 'px' : font.size;
        const lineHeight = _.isNumber(font.lineHeight) ? font.lineHeight + 'px' : font.lineHeight;

        let cssValue = `${font.style} ${font.variant} ${font.weight} ${size}/${lineHeight} ${font.family.join(',')}`;

        return cssValue;
    },

    calcValueFromString({str, values}) {

        const preset = (_default) => values[_default];
        const font = (_default) => _.extend({}, values[_default.template], _.omit(_default, 'template'));

        let m = null;

        if (m = str.match(/preset\((.*)\)$/)) {
            return preset(m[1].trim());

        } else if (m = str.match(/font\((.*)\)$/)) {
            return font(JSON.parse(m[1].trim().replace(/'/g, '"')));

        } else if (values[str]) {
            return values[str];

        } else if ((str.startsWith('font-')) && (values[str.substr(5)])) {
            return values[str.substr(5)];

        } else {
            throw(new Error(`Unknown font default ${str}`));
        }
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
