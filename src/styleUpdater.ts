import wixStylesColorUtils from './wixStylesColorUtils';
import wixStylesFontUtils from './wixStylesFontUtils';
import replacer from './replacer';
import {isEqual, omitBy, pickBy} from 'lodash';
import * as stylis from 'stylis';
import {replacer2} from './replacer2';
import {extractVarsPlugin} from './extractVarsPlugin';

export default (wixService, domService, options) => ({
    update() {
        return wixService.getStyleParams().spread((siteColors, siteTextPresets, styleParams) => {
            domService.getAllStyleTags().forEach(tagStyle => {

                let css = (tagStyle.originalTemplate || tagStyle.textContent);//.split('\n').join(' ');
                const isStringHack = fontParam => fontParam.fontStyleParam === false;
                const isValidFontParam = fontParam => fontParam.family !== undefined;

                const colorStyles = omitBy(styleParams.colors || {}, (v) => isEqual(v, {value: 'rgba(1,2,3,1)'}) || isEqual(v, {rgba: 'rgba(1,2,3,1)'}));
                const fontStyles = pickBy(styleParams.fonts, isValidFontParam);

                const numbers = styleParams.numbers || {};
                const colors = wixStylesColorUtils.getFullColorStyles({colorStyles, siteColors}) || {};
                const fonts = wixStylesFontUtils.getFullFontStyles({fontStyles, siteTextPresets}) || {};
                const strings = pickBy(styleParams.fonts, isStringHack);


                stylis.set({semicolon: false, compress: false, preserve: true});
                const vars = getVars(css, stylis);

                stylis.use((context, declaration) => {
                    if(context === 1) {
                        return replacer2({
                            declaration,
                            colors,
                            fonts,
                            numbers,
                            strings,
                            vars
                        }, options.plugins)
                    }
                });
                css = stylis('', css);

                domService.overrideStyle(tagStyle, css);
            });
        }).catch(err => {
            console.error('failed updating styles', err);
            throw err;
        });
    }
});

function getVars(css: string, stylis) {
    const vars = {};
    stylis.use((context, decleration) => {
        if (context === 1) {
            extractVarsPlugin(decleration, vars);
        }
    });
    stylis('', `${css}`);
    stylis.use(null);
    return vars;
}
