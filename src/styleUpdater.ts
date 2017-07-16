import wixStylesColorUtils from './wixStylesColorUtils';
import wixStylesFontUtils from './wixStylesFontUtils';
import replacer from './replacer';
import {isEqual, omitBy, pickBy} from 'lodash';

export default (wixService, domService, options) => ({
    update() {
        return wixService.getStyleParams().spread((siteColors, siteTextPresets, styleParams) => {
            domService.getAllStyleTags().forEach(tagStyle => {
                const css = tagStyle.originalTemplate || tagStyle.textContent;
                const isStringHack = fontParam => fontParam.fontStyleParam === false;
                const isValidFontParam = fontParam => fontParam.family !== undefined;

                const colorStyles = omitBy(styleParams.colors || {}, (v) => isEqual(v, {value: "rgba(1,2,3,1)"}) || isEqual(v, {rgba: 'rgba(1,2,3,1)'}));
                const fontStyles = pickBy(styleParams.fonts, isValidFontParam);

                const numbers = styleParams.numbers || {};
                const colors = wixStylesColorUtils.getFullColorStyles({colorStyles, siteColors}) || {};
                const fonts = wixStylesFontUtils.getFullFontStyles({fontStyles, siteTextPresets}) || {};
                const strings = pickBy(styleParams.fonts, isStringHack);

                let newCss = replacer({
                    css,
                    colors,
                    fonts,
                    numbers,
                    strings
                }, options.plugins);

                domService.overrideStyle(tagStyle, newCss);
            }).catch(err => {
                console.error("failed updating styles", err);
                throw err;
            });
        });
    }
});
