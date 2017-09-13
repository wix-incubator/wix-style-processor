import StyleUpdater from './styleUpdater';
import domService from './domService';
import WixService from './wixService';
import {Plugins} from './plugins';
import {defaultPlugins} from './defaultPlugins';

export default {
    styleUpdater: null,

    plugins: new Plugins(),

    init(options = <any>{}, domServiceOverride = domService) {
        const wixService = WixService(window.Wix);

        Object.keys(defaultPlugins)
            .forEach((funcName) => this.plugins.addCssFunction(funcName, defaultPlugins[funcName]));

        const defaultOptions = <any>{};
        defaultOptions.plugins = this.plugins;
        defaultOptions.shouldUseCssVars = domService.isCssVarsSupported() && (wixService.isEditorMode() || wixService.isPreviewMode());
        defaultOptions.shouldApplyCSSFunctions = !wixService.shouldRunAsStandalone();
        options = Object.assign({}, defaultOptions, options);

        this.styleUpdater = StyleUpdater(wixService, domServiceOverride, options);

        if (wixService.isEditorMode() || wixService.isPreviewMode()) {
            wixService.listenToStyleParamsChange(() => this.styleUpdater.update(true));
        }
        return this.styleUpdater.update();
    },

    update(isRerender?: boolean) {
        return this.styleUpdater.update(isRerender);
    }
}
