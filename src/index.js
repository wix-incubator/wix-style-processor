import StyleUpdater from './styleUpdater';
import domService from './domService';
import WixService from './wixService';

export default {
    plugins: {},

    init(options) {
        options = setDefaultOptions(options, this.plugins);
        const wixService = WixService(window.Wix);
        const styleUpdater = StyleUpdater(wixService, domService, options);
        wixService.listenToStyleParamsChange(() => styleUpdater.update());
        return styleUpdater.update();
    },

    plugin(name, fun) {
        this.plugins[name] = fun;
        return this;
    }
}

function setDefaultOptions(options, plugins) {
    options = options || {};
    options.isRtl = options.isRtl || false;
    options.plugins = options.plugins || plugins;
    return options;
}
