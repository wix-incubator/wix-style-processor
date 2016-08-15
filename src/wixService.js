import Q from 'q';

export default Wix => ({
    getStyleParams() {
        return Q.all([
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
    }
});

function getSiteColors(Wix) {
    const deferred = Q.defer();
    Wix.Styles.getSiteColors((res) => res ? deferred.resolve(res) :
                                            deferred.reject());
    return deferred.promise;
}

function getSiteTextPresets(Wix) {
    const deferred = Q.defer();
    Wix.Styles.getSiteTextPresets((res) => res ? deferred.resolve(res) :
                                                 deferred.reject());
    return deferred.promise;
}

function getStyleParams(Wix) {
    const deferred = Q.defer();
    Wix.Styles.getStyleParams((res) => res ? deferred.resolve(res) :
                                             deferred.reject());
    return deferred.promise;
}
