import WixMock from './WixMock';
import {default as Index, __RewireAPI__} from '../../src/index';
import sinon from 'sinon';

export default class Driver {

    constructor() {
        this.mocks = {
            Wix: new WixMock(),
            domService: {
                overrideStyles: sinon.spy(),
                extractStyles: () => this.css
            }
        };

        GLOBAL.window = {
            Wix: (() => this.mocks.Wix)()
        };

        this.when = {
            init: () => {
                __RewireAPI__.__set__('domService', this.mocks.domService);
                return Index.init();
            }
        };

        this.given = {
            css: (css) => {
                this.css = css;
                return this.given;
            },
            siteColors: (siteColors) => {
                this.mocks.Wix.given.siteColors(siteColors);
                return this.given;
            },
            siteTextPresets: (siteTextPresets) => {
                this.mocks.Wix.given.siteTextPresets(siteTextPresets);
                return this.given;
            },
            styleParams: (styleParams) => {
                this.mocks.Wix.given.styleParams(styleParams);
                return this.given;
            }
        };

        this.get = {
            domService: () => this.mocks.domService
        };
    }
}