export default class WixMock {
    private siteColors: any;
    private siteTextPresets: any;
    private styleParams: any;

    constructor() {

    }

    private queue = [];
    private Styles = {
        getSiteColors: (cb) => {
            cb(this.siteColors);
        },
        getSiteTextPresets: (cb) => {
            cb(this.siteTextPresets);
        },
        getStyleParams: (cb) => {
            cb(this.styleParams);
        }
    };

    private Events = {
        STYLE_PARAMS_CHANGE: 'style_params_change'
    };

    public given = {
        siteColors: (siteColors) => {
            this.siteColors = siteColors;
        },
        siteTextPresets: (siteTextPresets) => {
            this.siteTextPresets = siteTextPresets;
        },
        styleParams: (styleParams) => {
            this.styleParams = styleParams;
        }
    };

    public when = {
        updateStyleParams: () => {
            const cb = this.queue.shift();
            if (cb) {
                return cb();
            }
        }
    };

    addEventListener(eventName, cb) {
        this.queue.push(cb);
    }
}