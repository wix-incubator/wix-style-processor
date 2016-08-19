import StyleUpdater from './styleUpdater';
import domService from './domService';
import WixService from './wixService';

export default {
    init(options = {}) {
        options.isRtl = options.isRtl || false;
        const wixService = WixService(window.Wix);
        const styleUpdater = StyleUpdater(wixService, domService, options);
        wixService.listenToStyleParamsChange(() => styleUpdater.update());
        return styleUpdater.update();
    }
}
