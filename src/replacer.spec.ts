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

    it('font', () => {
        let css = `.foo { rule1: "font(--foo)"px; }`;

        opts.fonts = {
            'foo': '21'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: 21px; }');
    });

    xit("don't throw given invalid css", () => {
        let css = `.foo { rule1: "gaga(ccc)"; rule2: "color(bbb)"; rule3: "opacity(iii)"; rule4: #fff; }`;

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule1: gaga(ccc); rule2: undefined; rule3: "opacity(iii)"; rule4: #fff; }');
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
            let result = run(css);

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
            let result = run(css);

            //Then
            assert.equal(result, '.foo { --bar: quux; baz: 42;}');
        }
    });

    it.skip('timing test', () => {
        let cssStr = '.decl {--foo: bar;}';

        for (let i = 0; i < 28000; i++) {
            let decl = 'a' + guid();
            cssStr += `.${decl} { background-color: "color(color-2)"; }`;
        }

        opts.colors = {
            'color-2': '#FF0000'
        };

        console.time('f');
        let cssResult = run(cssStr);
        console.timeEnd('f')
    });

    xit('number without quotes', () => {
        const css = '.foo { --ccc: "21"; margin-top: "number(--ccc)"; }';

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

    it('pass correct parameters to declaration plugins', () => {
        //Given
        const css = '.foo { bar: baz; one: two; }';

        let parameters;

        pluginTransformations = {
            declarationTransformers: [((...args) => parameters = args)]
        };

        //When
        run(css);

        //Then
        assert.equal(parameters[0], 'one');
        assert.equal(parameters[1], 'two');
        assert.deepEqual(parameters[2], {
            css: '.foo { bar: baz; one: two; }',
            colors: {},
            fonts: {},
            numbers: {}
        });
        assert.equal(typeof(parameters[3]), 'function');
    });

    it('pass correct parameters to value plugins', () => {
        //Given
        const css = '.foo { bar: "increment(number(--baz))"; --baz: "3"; }';

        let parameters;

        pluginTransformations = {
            valueTransformers: {
                increment: (...args) => {
                    parameters = args;
                }
            }
        };

        //When
        run(css);

        //Then
        assert.deepEqual(parameters[0], ['3']);
        assert.deepEqual(parameters[1], {
            css: '.foo { bar: "increment(number(--baz))"; --baz: "3"; }',
            colors: {},
            fonts: {},
            numbers: {}
        });
        assert.equal(typeof(parameters[2]), 'function');
    });

    it('does not modify static params', () => {
        //Given
        const css = '.foo { padding: 10px 11px 12px 13px; margin-right: 20px; color: blue; }'

        //When
        let result = run(css);

        //Then
        assert.equal(result, css);
    });

    it('does not modify regular css vars', () => {
        //Given
        const css = '.foo { --bar: var(42); --baz: var(21); padding: --baz;}';

        //When
        let result = run(css);

        //Then
        assert.equal(result, css)
    });

    it('does not modify selectors', () => {
        //Given
        const css = '.foo {bar: baz;}';

        pluginTransformations.declarationTransformers.push(
            (key, value) => ({key: '$' + key, value})
        );

        //When
        let result = run(css);

        //Then
        assert.equal(result, '.foo { $bar: baz;}');
    });

    it('should work with pseudo selectors', () => {
        const css = `.react-datepicker__day--highlighted:hover{ background-color: #32be3f;}`

        //When
        let result = run(css);

        //Then
        assert.equal(result.trim(), css)
    });

    it('should detect declarations with no space after the :', () => {
        let css = `.foo { rule: bar; rule3:baz; rule4:"color(color-1)"; rule5:"color(color(color-2))" }`;

        opts.colors = {
            'color-1': '#FF0000',
            'color-2': 'color-1'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { rule: bar; rule3: baz; rule4: #FF0000; rule5: #FF0000 }');
    });

    xit('should detect multi var on the same declaration', () => {
        let css = `.foo { --border_width: "1px"; --border_color: "color(color-1)"; border: "color(--border_color)" "number(--border_width)" solid; }`;

        opts.colors = {
            'color-1': '#FF0000',
            'color-2': 'color-1'
        };

        let cssResult = run(css);
        assert.equal(cssResult, '.foo { --border_width: 1px; --border_color: #FF0000; border: #FF0000 1px solid; }');
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
