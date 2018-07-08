import {StyleUpdaterFactory} from './styleUpdater';
import defaultDomService from './domService';
import {WixService} from './wixService';
import {Plugins} from './plugins';
import {defaultPlugins} from './defaultPlugins';
import {defaultReplacers} from './defaultReplacers';
import {IWixService} from './types';

/* tslint:disable:no-invalid-this */
export default {
    styleUpdater: null,

    plugins: new Plugins(),

    init(options = {} as any, domService = defaultDomService, wixService: IWixService = new WixService(window.Wix)) {
        Object.keys(defaultPlugins)
            .forEach((funcName) => this.plugins.addCssFunction(funcName, defaultPlugins[funcName]));
        Object.keys(defaultReplacers)
            .forEach((funcName) => this.plugins.addDeclarationReplacer(defaultReplacers[funcName]));

        const defaultOptions = {} as any;
        defaultOptions.plugins = this.plugins;
        defaultOptions.shouldUseCssVars = domService.isCssVarsSupported() && (wixService.isEditorMode() || wixService.isPreviewMode());
        defaultOptions.shouldApplyCSSFunctions = !wixService.shouldRunAsStandalone();
        options = {...defaultOptions, ...options};

        this.styleUpdater = StyleUpdaterFactory(wixService, domService, options);

        if (wixService.isEditorMode() || wixService.isPreviewMode()) {
            wixService.listenToStyleParamsChange(() => this.styleUpdater.update(true));
        }
        return this.styleUpdater.update();
    },

    update(isRerender?: boolean) {
        return this.styleUpdater.update(isRerender);
    }
};
