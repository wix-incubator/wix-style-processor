export default Wix => ({
    getStyleParams() {
        return this.shouldRunAsStandalone() ?
            Promise.resolve([{},{},{}]) :
            Promise.all([
                getSiteColors(Wix),
                getSiteTextPresets(Wix),
                getStyleParams(Wix)
            ]);
    },

    listenToStyleParamsChange(cb) {
        Wix.addEventListener(Wix.Events.STYLE_PARAMS_CHANGE, cb);
    },

    listenToSettingsUpdated(cb) {
        Wix.addEventListener(Wix.Events.SETTINGS_UPDATED, cb);
    },

    isEditorMode(): boolean {
        return Wix.Utils.getViewMode() === 'editor';
    },

    isPreviewMode(): boolean {
        return Wix.Utils.getViewMode() === 'preview';
    },

    shouldRunAsStandalone(): boolean {
      return this.isStandaloneMode() || this.withoutStyleCapabilites();
    },

    withoutStyleCapabilites(): boolean {
      return !Wix.Styles;
    },

    isStandaloneMode(): boolean {
        return Wix.Utils.getViewMode() === 'standalone';
    }
});

function getSiteColors(Wix) {
    return new Promise((resolve, reject) => Wix.Styles.getSiteColors((res) => res ? resolve(res) : reject({})));
}

function getSiteTextPresets(Wix) {
    return new Promise((resolve, reject) => Wix.Styles.getSiteTextPresets((res) => res ? resolve(res) : reject({})));
}

function getStyleParams(Wix) {
    return new Promise((resolve, reject) => Wix.Styles.getStyleParams((res) => res ? resolve(res) : reject({})));
}
