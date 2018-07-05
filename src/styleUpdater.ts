import * as Stylis from 'stylis';
import {wixStylesColorUtils} from './wixStylesColorUtils';
import {wixStylesFontUtils} from './wixStylesFontUtils';
import {processor} from './processor';
import {CustomSyntaxHelper} from './customSyntaxHelper';
import {pickBy, splitDeclaration} from './utils';

export function StyleUpdaterFactory(wixService, domService, options): { update(isRerender: boolean): void } {
    const cacheMap = {};

    return {
        update(isRerender = false) {
            return wixService.getStyleParams().then(([siteColors, siteTextPresets, styleParams]) => {
                const colorStyles = styleParams.colors;
                const fontStyles = pickBy(styleParams.fonts, wixStylesFontUtils.isValidFontParam);

                const numbers = styleParams.numbers || {};
                const colors = wixStylesColorUtils.getFullColorStyles({colorStyles, siteColors}) || {};
                const fonts = wixStylesFontUtils.getFullFontStyles({fontStyles, siteTextPresets}) || {};
                const strings = pickBy(styleParams.fonts, wixStylesFontUtils.isStringHack);
                const tpaParams = {colors, fonts, numbers, strings};

                if (!isRerender || !options.shouldUseCssVars) {
                    Array.prototype.forEach.call(domService.getAllStyleTags(), (tagStyle: any) => {
                        const css = (tagStyle.originalTemplate || tagStyle.textContent);

                        const stylis = new Stylis({semicolon: false, compress: false, preserve: true});

                        applyDeclarationReplacers(options.plugins, stylis);
                        if (options.shouldApplyCSSFunctions) {
                            applyCssFunctionsExtraction({tpaParams, cacheMap, options}, stylis);
                        }

                        const newCss = stylis('', css);

                        domService.overrideStyle(tagStyle, newCss);
                    });
                }

                if (options.shouldUseCssVars) {
                    const varMap = Object.keys(cacheMap)
                        .reduce((acc, key) => {
                            acc[key] = cacheMap[key](tpaParams);
                            return acc;
                        }, {});

                    domService.updateCssVars(varMap);
                }
            }).catch(err => {
                //tslint:disable-next-line
                console.error('Failed updating styles:', err);
                throw err;
            });
        }
    };
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function applyDeclarationReplacers(plugins, stylis) {
    plugins.declarationReplacers
        .forEach((replacer) => {
            stylis.use((context, declaration) => {
                if (context === 1) {
                    const {key, value} = splitDeclaration(declaration);
                    const pluginResult = replacer(key, value);
                    return `${pluginResult.key}: ${pluginResult.value}`;
                }
            });
        });
}

function applyCssFunctionsExtraction({tpaParams, cacheMap, options}, stylis) {
    const customSyntaxHelper = new CustomSyntaxHelper();

    stylis.use((context, content) => {
        if (context === 1) {
            /* for each declaration */
            const {key, value} = splitDeclaration(content);
            customSyntaxHelper.extractVar(key, value);
            customSyntaxHelper.extractCustomSyntax(key, value);

            return `${key}: ${value}`;
        }

        if (context === -2) {
            /* post-process */
            return customSyntaxHelper.customSyntaxStrs.reduce((processedContent, part) => {
                const newValue = processor({
                    part, customSyntaxHelper, tpaParams, cacheMap
                }, options);
                return processedContent.replace(new RegExp(escapeRegExp(part), 'g'), newValue);
            }, content);
        }
    });
}
