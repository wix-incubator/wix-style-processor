export class WixService {
    constructor(private readonly Wix) {

    }

    getStyleParams() {
        return this.shouldRunAsStandalone() ?
            Promise.resolve([{}, {}, {}]) :
            Promise.all([
                promisfy(this.Wix.Styles.getSiteColors),
                promisfy(this.Wix.Styles.getSiteTextPresets),
                promisfy(this.Wix.Styles.getStyleParams)
            ]);
    }

    listenToStyleParamsChange(cb) {
        this.Wix.addEventListener(this.Wix.Events.STYLE_PARAMS_CHANGE, cb);
    }

    listenToSettingsUpdated(cb) {
        this.Wix.addEventListener(this.Wix.Events.SETTINGS_UPDATED, cb);
    }

    isEditorMode(): boolean {
        return this.Wix.Utils.getViewMode() === 'editor';
    }

    isPreviewMode(): boolean {
        return this.Wix.Utils.getViewMode() === 'preview';
    }

    isStandaloneMode(): boolean {
        return this.Wix.Utils.getViewMode() === 'standalone';
    }

    shouldRunAsStandalone(): boolean {
        return this.isStandaloneMode() || this.withoutStyleCapabilites();
    }

    withoutStyleCapabilites(): boolean {
        return !this.Wix.Styles;
    }
}

function promisfy(fn) {
    return new Promise((resolve, reject) => fn((res) => res ? resolve(res) : reject({})));
}
