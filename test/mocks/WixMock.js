export default class WixMock {
    constructor() {
        this.queue = [];
        this.Styles = {
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

        this.Events = {
            STYLE_PARAMS_CHANGE: 'style_params_change'
        };

        this.given = {
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

        this.when = {
            updateStyleParams: () => {
                const cb = this.queue.shift();
                if (cb) {
                    cb(this.styleParams);
                }
            }
        };
    }

    addEventListener(eventName, cb) {
        this.queue.push(cb);
    }
}