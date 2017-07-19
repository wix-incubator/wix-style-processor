import StyleUpdater from './styleUpdater';
import domService from './domService';
import WixService from './wixService';
import {Plugins} from './plugins';
import {defaultPlugins} from './defaultPlugins';

export default {
    plugins: new Plugins(),

    init(options, domServiceOverride = domService) {
        Object.keys(defaultPlugins).forEach((funcName) => this.plugins.addCssFunction(funcName, defaultPlugins[funcName]));

        options = setDefaultOptions(options, this.plugins);
        const wixService = WixService(window.Wix);
        const styleUpdater = StyleUpdater(wixService, domServiceOverride, options);
        wixService.listenToStyleParamsChange(() => styleUpdater.update());
        return styleUpdater.update();
    }
}

function setDefaultOptions(options, plugins) {
    options = options || {};
    options.plugins = options.plugins || plugins;
    return options;
}
