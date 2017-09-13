import wixStylesColorUtils from './wixStylesColorUtils';
import wixStylesFontUtils from './wixStylesFontUtils';
import pickBy = require('lodash/pickBy');
import omitBy = require('lodash/omitBy');
import isEqual = require('lodash/isEqual');
import forEach = require('lodash/forEach');
import * as Stylis from 'stylis';
import {processor} from './processor';
import {CustomSyntaxHelper} from './customSyntaxHelper';
import {splitDeclaration} from './utils';

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
                    forEach(domService.getAllStyleTags(), (tagStyle: any) => {
                        let css = (tagStyle.originalTemplate || tagStyle.textContent);

                        const stylis = new Stylis({semicolon: false, compress: false, preserve: true});

                        applyDeclarationReplacers(options.plugins, stylis, options.retainOriginal);
                        if(options.shouldApplyCSSFunctions) {
                            applyCssFunctionsExtraction({tpaParams, cacheMap, options}, stylis);
                        }

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
                console.error('Failed updating styles:', err);
                throw err;
            });
        }
    };
};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function applyDeclarationReplacers(plugins, stylis, retainOriginal) {
    plugins.declarationReplacers
        .forEach((replacer) => {
            stylis.use((context, declaration) => {
                if (context == 1) {
                    let {key, value} = splitDeclaration(declaration);
                    let pluginResult = replacer(key, value);
                    let result = `${pluginResult.key}: ${pluginResult.value}`

                    if (retainOriginal && (pluginResult.key !== key || pluginResult.value !== value)) {
                      result += `;${key}: ${value}`
                    }

                    return result;
                }
            })
        });
}

function applyCssFunctionsExtraction({tpaParams, cacheMap, options}, stylis) {
    const customSyntaxHelper = new CustomSyntaxHelper();

    stylis.use((context, content) => {
        if (context === 1) {
            /* for each declaration */
            let {key, value} = splitDeclaration(content);
            customSyntaxHelper.extractVar(key, value);
            customSyntaxHelper.extractCustomSyntax(key, value);

            return `${key}: ${value}`;
        }

        if (context === -2) {
            /* post-process */
            return customSyntaxHelper.customSyntaxStrs.reduce((content, part) => {
                const newValue = processor({
                    part, customSyntaxHelper: customSyntaxHelper, tpaParams, cacheMap
                }, options);
                return content.replace(new RegExp(escapeRegExp(part), 'g'), newValue);
            }, content);
        }
    });
}
