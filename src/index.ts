import StyleUpdater from './styleUpdater';
import domService from './domService';
import WixService from './wixService';

export default {
    plugins: {
        cssFunctions: {},
        declarationReplacers: []
    },

    resetPlugins() {
        this.plugins = {
            cssFunctions: {},
            declarationReplacers: []
        }
    },

    init(options, domServiceOverride = domService) {
        options = setDefaultOptions(options, this.plugins);
        const wixService = WixService(window.Wix);
        const styleUpdater = StyleUpdater(wixService, domServiceOverride, options);
        wixService.listenToStyleParamsChange(() => styleUpdater.update());
        return styleUpdater.update();
    },

    plugin(...args) {
        return this.valuePlugin(...args);
    },

    valuePlugin(name, fun) {
        this.plugins.valueTransformers[name] = fun;
        return this;
    },

    declarationReplacerPlugin(fun) {
        this.plugins.declarationReplacers.push(fun);
        return this;
    }
}

function setDefaultOptions(options, plugins) {
    options = options || {};
    options.plugins = options.plugins || plugins;
    return options;
}
