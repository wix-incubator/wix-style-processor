import wixStylesColorUtils from './wixStylesColorUtils';
import wixStylesFontUtils from './wixStylesFontUtils';
import {isEqual, omitBy, pickBy} from 'lodash';
import * as Stylis from 'stylis';
import {processor} from './processor';
import {VarsResolver} from './varsResolver';

export default (wixService, domService, options) => {
    const cacheMap = {};

    return {
        update(isRerender = false) {
            return wixService.getStyleParams().then(([siteColors, siteTextPresets, styleParams]) => {
                const isStringHack = fontParam => fontParam.fontStyleParam === false;
                const isValidFontParam = fontParam => fontParam.family !== undefined;

                const colorStyles = omitBy(styleParams.colors || {}, (v) => isEqual(v, {value: 'rgba(1,2,3,1)'}) || isEqual(v, {rgba: 'rgba(1,2,3,1)'}));
                const fontStyles = pickBy(styleParams.fonts, isValidFontParam);

                const numbers = styleParams.numbers || {};
                const colors = wixStylesColorUtils.getFullColorStyles({colorStyles, siteColors}) || {};
                const fonts = wixStylesFontUtils.getFullFontStyles({fontStyles, siteTextPresets}) || {};
                const strings = pickBy(styleParams.fonts, isStringHack);

                if (options.isCssVarsSupported && isRerender) {

                } else {
                    domService.getAllStyleTags().forEach(tagStyle => {
                        let css = (tagStyle.originalTemplate || tagStyle.textContent);
                        css = css.replace(/}\[/g, '} [');
                        const stylis = new Stylis({semicolon: false, compress: false, preserve: true});

                        const vars = new VarsResolver({
                            colors,
                            fonts,
                            numbers,
                            strings
                        });

                        extractVars(css, vars.extractVar.bind(vars), stylis);

                        stylis.use((context, declaration) => {
                            if (context === 1) {
                                return processor({
                                    declaration,
                                    vars,
                                    cacheMap
                                }, options)
                            }
                        });
                        const newCss = stylis('', css);

                        domService.overrideStyle(tagStyle, newCss);
                    });
                }
            }).catch(err => {
                console.error('failed updating styles', err);
                throw err;
            });
        }
    };
};

function extractVars(css: string, extractVarsFn, stylis) {
    stylis.use((context, decleration) => {
        if (context === 1) {
            extractVarsFn(decleration);
        }
    });
    stylis('', css);
    stylis.use(null);
}
