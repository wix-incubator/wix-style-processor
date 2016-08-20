import _ from 'lodash';
import replacer from '../src/replacer';
import {assert} from 'chai';

describe('replacer', () => {
    let opts, pluginTransformations;

    beforeEach(() => {
        opts = {
            colors: {},
            fonts: {},
            numbers: {}
        };

        pluginTransformations = {valueTransformers: {}, declarationTransformers: []};
    });

    it('color transformation', () => {
        let css = `.foo { rule: bar; rule3: baz; rule4: "color(color-1)"; rule5: "color(color(color-2))"; }`;

        opts.colors = {
            'color-1': '#FF0000',
            'color-2': 'color-1'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule: bar; rule3: baz; rule4: #FF0000; rule5: #FF0000; }');
    });

    it('opacity transformation', () => {
        let css = `.foo { rule1: "opacity(color-1, 0.5)"; }`;

        opts.colors ={
            'color-1': '#FF0000',
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: rgba(255, 0, 0, 0.5); }');
    });

    it('composed opacity', () => {
        let css = `.foo { rule1: "opacity(color(color-1), 0.5)"; }`;

        opts.colors = {
            'color-1': '#FF0000'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: rgba(255, 0, 0, 0.5); }');
    });

    it('composed opacity with custom var', () => {
        let css = `.foo { rule1: "opacity(--foo, 0.5)"; }`;

        opts.colors = {
            'foo': '#FFFF00'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: rgba(255, 255, 0, 0.5); }');
    });

    it('join', () => {
        let css = `.foo { rule1: "join(color-1, 1, color-2, 1)"; }`;

        opts.colors = {
            'color-1': '#FF0000',
            'color-2': '#00FF00'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: rgb(255, 255, 0); }');
    });

    it('composed join', () => {
        let css = `.foo { rule1: "join(opacity(color-1, 0.5), 1, opacity(color-2, 0.5), 1)"; }`;

        opts.colors = {
            'color-1': '#FF0000',
            'color-2': '#00FF00'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: rgb(128, 128, 0); }');
    });

    it('param', () => {
        let css = `.foo { rule1: "color(--zz)"; }`;

        opts.colors = {
            'color-1': '#FFFF00',
            'zz': 'color(color-1)'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: #FFFF00; }');
    });

    it('number', () => {
        let css = `.foo { rule1: "number(--foo)"px; }`;

        opts.numbers = {
            'foo': '42'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: 42px; }');
    });

    it('font', () => {
        let css = `.foo { rule1: "font(--foo)"px; }`;

        opts.fonts = {
            'foo': '21'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: 21px; }');
    });

    describe('RTL/LTR transformations', () => {
        function replaceRtlStrings(str) {
            let replaced = str.replace(/STARTSIGN/g, opts.isRtl ? '' : '-')
                              .replace(/ENDSIGN/g, opts.isRtl ? '-' : '')
                              .replace(/START/g, opts.isRtl ? 'right' : 'left')
                              .replace(/END/g, opts.isRtl ? 'left' : 'right')
                              .replace(/DIR/g, opts.isRtl ? 'rtl' : 'ltr');
            return replaced;
        }

        function rtlPlugin(key, value) {
            key = replaceRtlStrings(key);
            value = replaceRtlStrings(value);
            return {key, value};
        }

        beforeEach(() => {
            pluginTransformations.declarationTransformers = [rtlPlugin];
        })

        describe('RTL', () => {
            beforeEach(() => {
                opts.isRtl = true;
            });

            it('START', () => {
                //Given
                let css = '.foo { margin-START: 5px; }'

                //When
                let cssResult = run(css);

                //Then
                assert.equal(cssResult, '.foo { margin-right: 5px; }');
            });

            it('END', () => {
                //Given
                let css = '.foo { margin-END: 5px; }';

                //When
                let result = run(css);

                //Then
                assert.equal(result, '.foo { margin-left: 5px; }');
            });

            it('STARTSIGN', () => {
                //Given
                let css = '.foo { padding: STARTSIGN5px; }';

                //When
                let result = run(css);

                //Then
                assert.equal(result, '.foo { padding: 5px; }');
            });

            it('ENDSIGN', () => {
                //Given
                let css = '.foo { padding: ENDSIGN5px; }';

                //When
                let result = run(css);

                //Then
                assert.equal(result, '.foo { padding: -5px; }');
            });

            it('DIR', () => {
                //Given
                let css = '.foo { direction: DIR; }';

                //When
                let result = run(css);

                //Then
                assert.equal(result, '.foo { direction: rtl; }');
            });
        });

        describe('LTR', () => {
            beforeEach(() => {
                opts.isRtl = false;
            });

            it('START', () => {
                //Given
                let css = '.foo { margin-START: 5px; }'

                //When
                let cssResult = run(css);

                //Then
                assert.equal(cssResult, '.foo { margin-left: 5px; }');
            });

            it('END', () => {
                //Given
                let css = '.foo { margin-END: 5px; }';

                //When
                let result = run(css);

                //Then
                assert.equal(result, '.foo { margin-right: 5px; }');
            });

            it('STARTSIGN', () => {
                //Given
                let css = '.foo { padding: STARTSIGN5px; }';

                //When
                let result = run(css);

                //Then
                assert.equal(result, '.foo { padding: -5px; }');
            });

            it('ENDSIGN', () => {
                //Given
                let css = '.foo { padding: ENDSIGN5px; }';

                //When
                let result = run(css);

                //Then
                assert.equal(result, '.foo { padding: 5px; }');
            });

            it('DIR', () => {
                //Given
                let css = '.foo { direction: DIR; }';

                //When
                let result = run(css);

                //Then
                assert.equal(result, '.foo { direction: ltr; }');
            });
        });
    });

    it("don't throw given invalid css", () => {
        let css = `.foo { rule1: "gaga(ccc)"; rule2: "color(bbb)"; rule3: "opacity(iii)"; rule4: #fff; }`;

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: undefined; rule2: undefined; rule3: "opacity(iii)"; rule4: #fff; }')
    });

    describe('default param', () => {
        it('default param - color', () => {
            testDefaultParam('color');
        });

        it('default param override - color', () => {
            testDefaultParamOverride('color');
        });

        it('default param - font', () => {
            testDefaultParam('font');
        });

        it('default param override - font', () => {
            testDefaultParamOverride('font');
        });

        it('default param - number', () => {
            testDefaultParam('number');
        });

        it('default param override - number', () => {
            testDefaultParamOverride('number');
        });

        function testDefaultParam(type) {
            //Given
            let css = `.foo { --bar: "${type}(qux)"; baz: "${type}(--bar)";}`;

            opts[`${type}s`] = {
                'qux': 'quux'
            };

            //When
            let result = run(css, opts);

            //Then
            assert.equal(result, '.foo { --bar: quux; baz: quux;}');
        }

        function testDefaultParamOverride(type) {
            //Given
            let css = `.foo { --bar: "${type}(qux)"; baz: "${type}(--bar)";}`;

            opts[`${type}s`] = {
                'qux': 'quux',
                'bar': '42'
            };

            //When
            let result = run(css, opts);

            //Then
            assert.equal(result, '.foo { --bar: quux; baz: 42;}');
        }
    });

    it.skip('timing test', () => {
        let cssStr = '.decl {--foo: bar;}';

        for (let i=0; i<28000; i++) {
            let decl = 'a' + guid();
            cssStr += `.${decl} { background-color: "color(color-2)"; }`;
        }

        opts.colors = {
            'color-2': '#FF0000'
        };

        console.time('f');
        let cssResult = run(cssStr, opts);
        console.timeEnd('f')
    });

    it('number without quotes', () => {
        const css = '.foo { --ccc: 21; margin-top: "number(--ccc)"; }';

        let result = run(css);

        assert.equal(result, '.foo { --ccc: 21; margin-top: 21; }');
    });

    it('plugin transformation', () => {
        //Given
        const css = '.foo { margin: "incrementer(number(--num))"px; }';

        pluginTransformations = {
            valueTransformers: {
                incrementer(params, siteVars) {
                    return parseInt(params[0]) + 1;
                }
            }
        };

        opts.numbers = {
            num: 1
        };

        //When
        let result = run(css);

        //Then
        assert.equal(result, '.foo { margin: 2px; }');
    });

    function run(css) {
        return replacer({css, ...opts}, pluginTransformations);
    }
});

function guid() {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}
