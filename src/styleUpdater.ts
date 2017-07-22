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
                const tpaParams = {colors, fonts, numbers, strings};

                if (!isRerender || !options.shouldUseCssVars) {
                    domService.getAllStyleTags().forEach(tagStyle => {
                        let css = (tagStyle.originalTemplate || tagStyle.textContent);

                        const stylis = new Stylis({semicolon: false, compress: false, preserve: true});

                        const varsResolver = new VarsResolver();

                        stylis.use((context, content) => {
                            if (context === 1) {
                                /* for each declaration */
                                varsResolver.extractVar(content);
                                return varsResolver.extractParts(content, options.plugins);
                            }

                            if (context === -2) {
                                /* post-process */
                                return varsResolver.parts.reduce((content, part) => {
                                    const newValue = processor({
                                        part, varsResolver, tpaParams, cacheMap
                                    }, options);
                                    return content.replace(new RegExp(escapeRegExp(part), 'g'), newValue);
                                }, content);
                            }
                        });
                        const newCss = stylis('', css);

                        domService.overrideStyle(tagStyle, newCss);
                    });
                }

                if (options.shouldUseCssVars) {
                    const varMap = Object.keys(cacheMap).reduce((varMap, key) => {
                        varMap[key] = cacheMap[key](tpaParams);
                        return varMap;
                    }, {});

                    domService.updateCssVars(varMap);
                }
            }).catch(err => {
                console.error('failed updating styles', err);
                throw err;
            });
        }
    };
};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
