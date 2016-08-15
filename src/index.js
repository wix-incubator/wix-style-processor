import Q from 'q';
import StyleUpdater from './styleUpdater';
import domService from './domService';
import WixService from './wixService';

export default {
    init() {
        const wixService = WixService(window.Wix);
        const styleUpdater = StyleUpdater(wixService, domService);
        wixService.listenToStyleParamsChange(() => styleUpdater.update());
        return styleUpdater.update();
    }
}
