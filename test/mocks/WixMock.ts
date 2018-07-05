export default class WixMock {
    private siteColors: any;
    private siteTextPresets: any;
    private styleParams: any;
    private viewMode: string = 'site';

    private readonly callbackQ = [];
    public Styles = {
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

    public Utils = {
        getViewMode: () => this.viewMode
    };

    public Events = {
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
        },
        viewMode: (mode: string): WixMock => {
            this.viewMode = mode;
            return this;
        },
        siteColor: (ref: string, value: string): WixMock => {
            this.siteColors.filter((color) => color.reference === ref)
                .map(c => c.value = value);
            return this;
        },
        withoutStyles: (): WixMock => {
          this.Styles = null;
          return this;
        }
    };

    public when = {
        updateStyleParams: () => {
            const cb = this.callbackQ.shift();
            if (cb) {
                return cb();
            }
        }
    };

    public addEventListener(eventName, cb) {
        this.callbackQ.push(cb);
    }
}
