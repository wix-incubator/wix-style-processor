import {expect} from 'chai';
import {IndexDriver} from './index.driver';
import {hash} from './hash';

describe('Index', () => {
    let driver: IndexDriver;

    beforeEach(() => {
        driver = new IndexDriver();

        driver
            .given.css('.foo { --bar: "color(color-4)"; color: "color(--bar)"}')
            .given.defaultSiteColors()
            .given.styleParams({
            numbers: {},
            colors: {},
            fonts: {}
        })
            .given.siteTextPresets({});
    });

    it('should update on init', () => {
        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg()).to.equal('.foo{--bar: #717070;color: #717070;}');
        });
    });

    it('should support colors from settings', () => {
        const css = '.foo {color: "color(--my_var)";}';
        driver
            .given.css(css)
            .given.styleParams({
            colors: {
                'my_var': {value: 'red'}
            }
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to.equal('.foo{color: rgb(255, 0, 0);}');
            });
    });

    it('should support fonts from settings', () => {
        const css = '.foo {font: "font(--my_var)";}';
        driver
            .given.css(css)
            .given.styleParams({
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
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to
                    .equal(`.foo{font: normal normal normal 17px/1.4em mr de haviland,cursive;}`);
            });
    });

    it('should support font string hack from settings', () => {
        const css = '.foo {width: "string(--my_var)";}';

        driver
            .given.css(css)
            .given.styleParams({
            fonts: {
                'my_var': {
                    'value': '100px',
                    fontStyleParam: false
                }
            }
        });

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{width: 100px;}`);
            });
    });

    it('should support string default value', () => {
        const css = '.foo {--my_var: "string(0px)"; width: "string(--my_var)";}';
        driver
            .given.css(css)
            .given.styleParams({
            numbers: {},
            colors: {},
            fonts: {}
        })
            .given.siteTextPresets({});

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to.equal(`.foo{--my_var: 0px;width: 0px;}`);
            });
    });

    it('should support default values', () => {
        const css = ':root{--my_var3: "color(color-4)";} .foo {color: "color(--my_var3)";}';
        driver
            .given.css(css)
            .given.styleParams({
            numbers: {},
            colors: {
                'my_var3': {value: 'rgba(128,110,66,0.6193647540983607)'}
            },
            fonts: {}
        })
            .given.siteTextPresets({});

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to
                    .equal(':root{--my_var3: #717070;}.foo{color: rgba(128, 110, 66, 0.6193647540983607);}');
            });
    });

    it('should work with declarations with no semicolon at the end', () => {
        const css = `:root {
--cart_textFontStyle:"font(Body-M)";
--cartButton_textColor:"color(color-1)"}
.foo{font:"font(--cart_textFontStyle)";color:"color(--cartButton_textColor)"}`;

        driver
            .given.css(css)
            .given.styleParams({
            colors: {
                'my_var2': {value: 'rgba(128,110,66,0.6193647540983607)'}
            }
        })
            .given.siteTextPresets({
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

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg()).to
                    .equal(`:root{--cart_textFontStyle: normal normal normal 17px/1.4em raleway,sans-serif;--cartButton_textColor: #FFFFFF;}.foo{font: normal normal normal 17px/1.4em raleway,sans-serif;color: #FFFFFF;}`);
            });
    });

    it('should support double font reference', () => {
        const css = '.font-test{--some-font: "font(Body-M)"; font: "font(--some-font)";}';
        driver.given.css(css)
            .given.siteTextPresets({
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

        return driver.when.init()
            .then(() => {
                expect(driver.get.overrideStyleCallArg())
                    .to
                    .equal('.font-test{--some-font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;}');
            });
    });

    it('should not calculate empty strings', () => {
        const css = '.font-test:after{content: " ";}';
        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.font-test:after{content: " ";}');
        });
    });

    it('should calculate nested functions', () => {
        const css = '.font-test{--var: "color(color-2)"; color:"join(opacity(color(color-1), 0.5), 1, opacity(--var, 0.5), 1)"}';
        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.font-test{--var: #F3F3F3;color: rgba(255, 255, 255, 0.5);}');
        });
    });

    it('opacity with default value', () => {
        const css = '.foo { rule1: "opacity(--lala, 0.5)"; --lala: "color(color-9)"}';
        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.foo{rule1: rgba(255, 0, 0, 0.5);--lala: #FF0000;}');
        });
    });

    it('color transformation', () => {
        const css = `.foo { rule: bar; rule3: baz; rule4: "color(color-1)"; rule5: "color(color(color(color-2)))"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal('.foo{rule: bar;rule3: baz;rule4: #FFFFFF;rule5: #F3F3F3;}');
        });
    });

    it('darken transformation', () => {
        const css = `.foo { rule1: "darken(color(color-9), 0.5)"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule1: rgb(128, 0, 0);}`);
        });
    });

    it('without opacity', () => {
        const css = `.foo { rule1: "withoutOpacity(opacity(color(color-9), 0.1))"; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule1: rgb(255, 0, 0);}`);
        });
    });

    it('composed opacity with custom var', () => {
        const css = `.foo { rule1: "opacity(--foo, 0.5)"; }`;

        driver.given.css(css)
            .given.styleParams({
            colors: {
                foo: {value: '#FFFF00'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule1: rgba(255, 255, 0, 0.5);}`);
        });
    });

    it('join', () => {
        const css = `.foo { rule1: "join(--foo, 1, color(color-10), 1)"; }`;

        driver.given.css(css)
            .given.styleParams({
            colors: {
                foo: {value: '#FF0000'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule1: rgb(255, 255, 0);}`);
        });
    });

    it('should support number', () => {
        const css = `.foo { width: calc(100% - "number(--foo)"); }`;

        driver.given.css(css)
            .given.styleParams({
            numbers: {
                foo: 42
            },
            colors: {
                bar: {value: '#FF0000'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{width: calc(100% - 42);}`);
        });
    });

    it('should support unit', () => {
        let css = `.foo { border: "unit(--foo, px)" solid "color(--bar)"; }`;

        driver.given.css(css)
            .given.styleParams({
            numbers: {
                foo: 42
            },
            colors: {
                bar: {value: '#FF0000'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{border: 42px solid #FF0000;}`);
        });
    });

    it('should support unit with value 0', () => {
        let css = `.foo { border: "unit(--foo, px)" solid "color(--bar)"; }`;

        driver.given.css(css)
            .given.styleParams({
            numbers: {
                foo: 0
            },
            colors: {
                bar: {value: '#FF0000'}
            }
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{border: 0px solid #FF0000;}`);
        });
    });

    it('does not modify static params', () => {
        const css = `.foo { padding: 10px 11px 12px 13px; margin-right: 20px; color: blue; }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{padding: 10px 11px 12px 13px;margin-right: 20px;color: blue;}`);
        });
    });

    it('does not modify regular css vars', () => {
        const css = `.foo { --bar: var(42); --baz: var(21); padding: --baz;}`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{--bar: var(42);--baz: var(21);padding: --baz;}`);
        });
    });

    it('should work with pseudo selectors', () => {
        const css = `.datepicker__day--highlighted:hover{ background-color: #32be3f;}`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.datepicker__day--highlighted:hover{background-color: #32be3f;}`);
        });
    });

    it('should detect declarations with no space after the :', () => {
        const css = `.foo { rule: bar; rule3:baz; rule4:"color(color-9)"; rule5:"color(color(color-9))" }`;

        driver.given.css(css);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{rule: bar;rule3: baz;rule4: #FF0000;rule5: #FF0000;}`);
        });
    });

    it('should support font theme override', () => {
        const css = `.foo{ font: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"}`;

        driver.given.css(css)
            .given.siteTextPresets({
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

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{font: italic normal bold 10px/2em raleway,sans-serif;}`);
        });
    });

    it('should support font override with var from settings', () => {
        const css = `.foo{ --bodyText: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"; font: "font(--bodyText)"}`;

        driver.given.css(css)
            .given.siteTextPresets({
            'Body-M': {
                editorKey: 'font_8',
                fontFamily: 'raleway',
                lineHeight: '1.4em',
                size: '17px',
                style: 'normal',
                value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
                weight: 'normal'
            }
        })
            .given.styleParams({
            fonts: {
                bodyText: {
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
        });

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to
                .equal(`.foo{--bodyText: italic normal bold 10px/2em raleway,sans-serif;font: normal normal normal 17px/1.4em mr de haviland,cursive;}`);
        });
    });

    it('should support font override with var', () => {
        const css = `.foo{ --bodyText: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"; font: "font(--bodyText)"}`;

        driver.given.css(css)
            .given.siteTextPresets({
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

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to
                .equal(`.foo{--bodyText: italic normal bold 10px/2em raleway,sans-serif;font: italic normal bold 10px/2em raleway,sans-serif;}`);
        });
    });

    it('should support double var reference', () => {
        const css = `.foo { --var1: "number(42)"; --var2: "number(--var1)"; rule4:"number(--var2)"; }`;

        driver.given.css(css)
            .given.styleParams({numbers: {var1: 1}});

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{--var1: 42;--var2: 1;rule4: 1;}`);
        });
    });

    it('has declaration plugin support', () => {
        const css = `.foo {bar: 4;}`;

        driver.given.css(css)
            .given.declarationReplacerPlugin((key, val) => ({
            key: 'ZzZ' + key + 'ZzZ',
            value: '#' + val + '#'
        }));

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg()).to.equal('.foo{ZzZbarZzZ: #4#;}');
        });
    });

    it('should support external css functions', () => {
        let css = `.foo { --var1: "increment(1)"; border-radius: "unit(--var1, px)" }`;

        driver.given.css(css)
            .given.cssFunctionPlugin('increment', (value) => 1 + +value);

        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{--var1: 2;border-radius: 2px;}`);
        });
    });

    it('should not fail on undefined var for font', () => {
        let css = `.foo { --var1: "font(--var)" }`;

        driver.given.css(css);
        return driver.when.init().then(() => {
            expect(driver.get.overrideStyleCallArg())
                .to.equal(`.foo{--var1: undefined;}`);
        });
    });

    describe('As Standalone', () => {
        beforeEach(() => {
          const css = `.foo {bar: 4; color: "color(color-1)"}`;

          driver
          .given.css(css)
          .given.styleParams(null)
          .given.siteTextPresets(null)
          .given.resetSiteColors()
          .given.declarationReplacerPlugin((key, val) => ({
            key,
            value: '#' + val + '#'
          }))
        });

        describe('withoutStyleCapabilites', () => {
          it('should not apply css functions', () => {
            driver.given.withoutWixStyles();
            return driver.when.init().then(() => {
              expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
            });
          });
        });

        describe('inStandaloneMode', () => {
          beforeEach(() => {
            driver.given.inStandaloneMode();
          });

          it('should finish init', () => {
            return driver.when.init().then(() => {
              expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
            });
          });

          it('should not apply css functions', () => {
            return driver.when.init().then(() => {
              expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
            });
          });
        });
    });

    describe('In Editor', () => {
        beforeEach(() => {
            driver.given.inEditorMode();
        });

        it('should update style on style change event', () => {
            const css = `.foo { --bar: "color(color-4)"; color: "color(--bar)"}`;

            driver.given.css(css);

            return driver.when.init()
                .then(() => {
                    driver.given.styleParams({
                        colors: {
                            bar: {value: '#ffffff'}
                        }
                    })
                })
                .then(driver.when.updateStyleParams)
                .then(() => {
                    expect(driver.get.overrideStyleCallArg(1)).to.equal('.foo{--bar: #717070;color: #ffffff;}');
                });
        });

        describe('Enhanced mode', () => {
            const color = '"join(darken(color(color-9), 0.5), 0.5, color(color-10), 0.5)"';
            const borderWidth = '"unit(number(--borderWidth), string(px))"';
            const borderColor = '"withoutOpacity(opacity(color(color-1), 0.5))"';
            const font = `"font({theme: 'Body-M', size: '30px'})"`;

            beforeEach(() => {
                driver.given.cssVarsSupported(true)
                    .given.css(`.foo {color: ${color}; border: ${borderWidth} solid ${borderColor}; font: ${font}`)
                    .given.siteTextPresets({
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
            });

            it('should change custom syntax to native vars', () => {
                driver.when.init()
                    .then(() => expect(driver.get.overrideStyleCallArg()).to
                        .equal(`.foo{color: var(--${hash(color)});border: var(--${hash(borderWidth)}) solid var(--${hash(borderColor)});font: var(--${hash(font)});}`));
            });

            it('should evaluate custom functions on style update', () => {
                const newValues = {
                    number: 42,
                    color: '#000000'
                };
                driver.when.init()
                    .then(() => {
                        driver.given.styleParams({
                            numbers: {
                                borderWidth: newValues.number
                            }
                        }).given.siteColor('color-1', newValues.color)
                            .given.siteColor('color-9', '#0000FF');
                    })
                    .then(driver.when.updateStyleParams)
                    .then(() => {
                        expect(driver.get.updateCssVarsCallArg(1)).to
                            .eql({
                                [`--${hash(color)}`]: 'rgb(0, 255, 128)',
                                [`--${hash(borderWidth)}`]: `${newValues.number}px`,
                                [`--${hash(borderColor)}`]: 'rgb(0, 0, 0)',
                                [`--${hash(font)}`]: 'normal normal normal 30px/1.4em raleway,sans-serif'
                            });
                    });
            });

            it('should should allow to override shouldUseCssVars by options', () => {
                driver
                    .given.styleParams({numbers: {borderWidth: 42}})
                    .when.init({shouldUseCssVars: false})
                    .then(() => expect(driver.get.overrideStyleCallArg()).to
                        .equal(`.foo{color: rgb(128, 255, 0);border: 42px solid rgb(255, 255, 255);font: normal normal normal 30px/1.4em raleway,sans-serif;}`));
            });
        });
    });
});
