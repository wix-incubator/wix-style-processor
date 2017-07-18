import {expect} from 'chai';
import Driver from './driver';

describe('Index', () => {
    let driver;

    beforeEach(() => {
        driver = new Driver();

        driver
            .given.css('.foo { --bar: "color(color-4)"; color: "color(--bar)"}')
            .defaultSiteColors()
            .styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
            .siteTextPresets({});
    });

    it('should update on init', () => {
        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver)).to.equal('.foo{--bar: #717070;color: #717070;}');
        });
    });

    it('should update style on style change event', () => {
        return driver.when.init()
            .then(driver.when.updateStyleParams)
            .then(() => {
                expect(getOverrideStyleCallArg(driver, 1)).to.equal('.foo{--bar: #717070;color: #717070;}');
            });
    });

    it('should support colors from settings', () => {
        driver
            .given.css('.foo {color: "color(--my_var)";}')
            .defaultSiteColors()
            .styleParams({
                numbers: {},
                colors: {
                    'my_var': {value: 'red'}
                },
                fonts: {}
            })
            .siteTextPresets({});

        return driver.when.init()
            .then(driver.when.updateStyleParams)
            .then(() => {
                expect(getOverrideStyleCallArg(driver, 1)).to.equal('.foo{color: rgb(255, 0, 0);}');
            });
    });

    it('should support fonts from settings', () => {
        driver
            .given.css('.foo {font: "font(--my_var)";}')
            .defaultSiteColors()
            .styleParams({
                numbers: {},
                colors: {},
                fonts: {
                    'my_var': {
                        'value': 'font-family:\'mr de haviland\',\'cursive\';',
                        'index': 93,
                        'cssFontFamily': '\'mr de haviland\',\'cursive\'',
                        'family': 'mr de haviland',
                        'fontParam': true,
                        'size': 0,
                        'style': {
                            'bold': false,
                            'italic': false,
                            'underline': false
                        }
                    }
                }
            })
            .siteTextPresets({});

        return driver.when.init()
            .then(driver.when.updateStyleParams)
            .then(() => {
                expect(getOverrideStyleCallArg(driver, 1)).to
                    .equal(`.foo{font: normal normal normal 17px/1.4em mr de haviland,cursive;}`);
            });
    });

    it('should support font string hack from settings', () => {
        driver
            .given.css('.foo {width: "string(--my_var)";}')
            .defaultSiteColors()
            .styleParams({
                numbers: {},
                colors: {},
                fonts: {
                    'my_var': {
                        'value': '100px',
                        fontStyleParam: false
                    }
                }
            })
            .siteTextPresets({});

        return driver.when.init()
            .then(driver.when.updateStyleParams)
            .then(() => {
                expect(getOverrideStyleCallArg(driver, 1)).to.equal(`.foo{width: 100px;}`);
            });
    });

    it('should support string default value', () => {
        driver
            .given.css('.foo {--my_var: "string(0px)"; width: "string(--my_var)";}')
            .defaultSiteColors()
            .styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
            .siteTextPresets({});

        return driver.when.init().then(driver.when.updateStyleParams)
            .then(() => {
                expect(getOverrideStyleCallArg(driver, 1)).to.equal(`.foo{--my_var: 0px;width: 0px;}`);
            });
    });

    it('should support default values', () => {
        driver
            .given.css(':root{--my_var3: "color(color-4)";} .foo {color: "color(--my_var3)";}')
            .defaultSiteColors()
            .styleParams({
                numbers: {},
                colors: {
                    'my_var3': {value: 'rgba(128,110,66,0.6193647540983607)'}
                },
                fonts: {}
            })
            .siteTextPresets({});

        return driver.when.init().then(driver.when.updateStyleParams)
            .then(() => {
                expect(getOverrideStyleCallArg(driver, 1)).to
                    .equal(':root{--my_var3: #717070;}.foo{color: rgba(128, 110, 66, 0.6193647540983607);}');
            });
    });


    it('should work with declarations with no semicolon at the end', () => {
        driver
            .given.css(`:root {
--cart_textFontStyle:"font(Body-M)";
--cartButton_textColor:"color(color-1)"}
.foo{font:"font(--cart_textFontStyle)";color:"color(--cartButton_textColor)"}`)
            .defaultSiteColors()
            .styleParams({
                numbers: {},
                colors: {
                    'my_var2': {value: 'rgba(128,110,66,0.6193647540983607)'}
                },
                fonts: {}
            })
            .siteTextPresets({
                'Body-M': {
                    editorKey: 'font_8',
                    fontFamily: 'raleway',
                    lineHeight: '1.4em',
                    size: '17px',
                    style: 'normal',
                    value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
                    weight: 'normal'
                }
            });

        return driver.when.init().then(driver.when.updateStyleParams)
            .then(() => {
                expect(getOverrideStyleCallArg(driver, 1)).to
                    .equal(`:root{--cart_textFontStyle: normal normal normal 17px/1.4em raleway,sans-serif;--cartButton_textColor: #FFFFFF;}.foo{font: normal normal normal 17px/1.4em raleway,sans-serif;color: #FFFFFF;}`);
            });
    });

    xit('has plugin support', () => {
        driver.given.css('.foo {bar: "increment(number(--baz))"px; --baz: "1";}')
            .plugin('increment', params => parseInt(params[0]) + 1);

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver)).to.equal('.foo { bar: 2px; --baz: 1;}');
        });
    });

    it('has declaration plugin support', () => {
        driver.given.css('.foo {bar: 4;}')
            .declarationPlugin((key, val) => ({
                key: 'ZzZ' + key + 'ZzZ',
                value: '#' + val + '#'
            }));

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver)).to.equal('.foo{ZzZbarZzZ:#4#;}');
        });
    });

    it('should support double font reference', () => {
        driver.given.css('.font-test{--some-font: "font(Body-M)"; font: "font(--some-font)";}')
            .siteTextPresets({
                'Body-M': {
                    displayName: 'Paragraph 2',
                    editorKey: 'font_8',
                    fontFamily: 'din-next-w01-light',
                    lineHeight: '1.4em',
                    size: '16px',
                    style: 'normal',
                    value: 'font:normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif',
                    weight: 'normal'
                }
            });

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to
                .equal('.font-test{--some-font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;}');
        });
    });

    it('should not calculate empty strings', () => {
        driver.given.css('.font-test:after{content: " ";}');

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal('.font-test:after{content: " ";}');
        });
    });

    it('should calculate nested functions', () => {
        driver.given.css('.font-test{--var: "color(color-2)"; color:"join(opacity(color(color-1), 0.5), 1, opacity(--var, 0.5), 1)"}');

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal('.font-test{--var: #F3F3F3;color: rgba(255, 255, 255, 0.5);}');
        });
    });

    it('opacity with default value', () => {
        driver.given.css('.foo { rule1: "opacity(--lala, 0.5)"; --lala: "color(color-9)"}');

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal('.foo{rule1: rgba(255, 0, 0, 0.5);--lala: #FF0000;}');
        });
    });

    it('color transformation', () => {
        let css = `.foo { rule: bar; rule3: baz; rule4: "color(color-1)"; rule5: "color(color(color(color-2)))"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal('.foo{rule: bar;rule3: baz;rule4: #FFFFFF;rule5: #F3F3F3;}');
        });
    });

    it('darken transformation', () => {
        let css = `.foo { rule1: "darken(color(color-9), 0.5)"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal(`.foo{rule1: rgb(128, 0, 0);}`);
        });
    });

    it('without opacity', () => {
        let css = `.foo { rule1: "withoutOpacity(opacity(color(color-9), 0.1))"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal(`.foo{rule1: rgb(255, 0, 0);}`);
        });
    });

    it('composed opacity with custom var', () => {
        let css = `.foo { rule1: "opacity(--foo, 0.5)"; }`;

        driver.given.css(css)
            .styleParams({
                colors: {
                    foo: {value: '#FFFF00'}
                }
            });

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal(`.foo{rule1: rgba(255, 255, 0, 0.5);}`);
        });
    });

    it('join', () => {
        let css = `.foo { rule1: "join(--foo, 1, color(color-10), 1)"; }`;

        driver.given.css(css)
            .styleParams({
                colors: {
                    foo: {value: '#FF0000'}
                }
            });

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal(`.foo{rule1: rgb(255, 255, 0);}`);
        });
    });

    it('should support number', () => {
        let css = `.foo { border: "number(--foo)"px solid "color(--bar)"; }`;

        driver.given.css(css)
            .styleParams({
                numbers: {
                    foo: 42
                },
                colors: {
                    bar: {value: '#FF0000'}
                }
            });

        return driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal(`.foo{border: 42px solid #FF0000;}`);
        });
    });

    function getOverrideStyleCallArg(driver, callIdx = 0) {
        return driver.get.domService().overrideStyle.getCall(callIdx).args[1];
    }
});
