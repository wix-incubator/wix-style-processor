import wixStylesColorUtils from './wixStylesColorUtils';
import wixStylesFontUtils from './wixStylesFontUtils';
import replacer from './replacer';
import _ from 'lodash';

export default (wixService, domService, options) => ({
    update() {
        const css = domService.extractStyles();

        return wixService.getStyleParams().spread((siteColors, siteTextPresets, styleParams) => {
            const colorStyles = _.omitBy(styleParams.colors || {}, (v) => _.isEqual(v, {value: "rgba(1,2,3,1)"}) || _.isEqual(v, {rgba: 'rgba(1,2,3,1)'}));
            const fontStyles = _.omitBy(styleParams.fonts || {}, (v) => !v);

            const numbers = styleParams.numbers || {};
            const colors = wixStylesColorUtils.getFullColorStyles({colorStyles, siteColors}) || {};
            const fonts = wixStylesFontUtils.getFullFontStyles({fontStyles, siteTextPresets}) || {};

            let newCss = replacer({
                css,
                colors,
                fonts,
                numbers
            }, options.plugins);

            domService.overrideStyles(newCss);
        }).catch(err => {
            console.error("failed updating styles", err);
            throw err;
        });
    }
});
