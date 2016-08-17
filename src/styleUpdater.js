import wixStylesColorUtils from './wixStylesColorUtils';
import wixStylesFontUtils from './wixStylesFontUtils';
import Replacer from './replacer';
import _ from 'lodash';

export default (wixService, domService, options) => ({
    update() {
        const css = domService.extractStyles();
        const replacer = new Replacer({css});

        return wixService.getStyleParams().spread((siteColors, siteTextPresets, styleParams) => {
            const colorStyles = _.omitBy(styleParams.colors || {}, (v) => _.isEqual(v, {value: "rgba(1,2,3,1)"}) || _.isEqual(v, {rgba: 'rgba(1,2,3,1)'}));
            const fontStyles = _.omitBy(styleParams.fonts || {}, (v) => !v);

            const numbers = styleParams.numbers || {};
            const colors = wixStylesColorUtils.getFullColorStyles({colorStyles, siteColors, defaults: replacer.defaults.colors}) || {};
            const fonts = wixStylesFontUtils.getFullFontStyles({fontStyles, siteTextPresets, defaults: replacer.defaults.fonts, isHebrew: false}) || {};

            updateStyles({colors, fonts, numbers, replacer, domService, options});
        }).catch(err => {
            console.error("failed updating styles", err);
            throw err;
        });
    }
});

function updateStyles({colors, fonts, numbers, replacer, domService, options}) {
    const css = replacer.get({colors, fonts, numbers, isRtl: options.isRtl});
    domService.overrideStyles(css);
}
