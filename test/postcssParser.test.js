import postcss from 'postcss';
import parser from '../src/postcssParser';
import {assert} from 'chai';

describe.only('postcssParser', () => {
    it('get transformation', done => {
        let css = `.foo {
            rule: bar;
            rule3: baz;
            rule4: get(color-1);
            rule5: get(get(color-2));
        }`;

        let opts = {
            colors: {
                'color-1': '#FF0000',
                'color-2': 'color-1'
            },
            fonts: {},
            numbers: {},
            isRtl: false
        };

        run(css, opts, result => {
            let cssResult = trimCss(result.css);
            assert.equal(cssResult, '.foo { rule: bar; rule3: baz; rule4: #FF0000; rule5: #FF0000; }');
            done();
        });
    });

    it('opacity transformation', done => {
        let css = `.foo {
            rule1: opacity(color-1, 0.5);
        }`;

        let opts = {
            colors: {
                'color-1': '#FF0000',
            },
            fonts: {},
            numbers: {},
            isRtl: false
        };

        run(css, opts, result => {
            let cssResult = trimCss(result.css);
            assert.equal(cssResult, '.foo { rule1: rgba(255, 0, 0, 0.5); }');
            done();
        });
    });

    it('composed opacity', done => {
        let css = `.foo {
            rule1: opacity(get(color-1), 0.5);
        }`;

        let opts = {
            colors: {
                'color-1': '#FF0000',
            },
            fonts: {},
            numbers: {},
            isRtl: false
        };

        run(css, opts, result => {
            let cssResult = trimCss(result.css);
            assert.equal(cssResult, '.foo { rule1: rgba(255, 0, 0, 0.5); }');
            done();
        });
    });

    it.skip('join', done => {
        let css = `.foo {
            rule1: join(color-1, 1, color-2, 1);
        }`;

        let opts = {
            colors: {
                'color-1': '#FF0000',
                'color-2': '#00FF00'
            },
            fonts: {},
            numbers: {},
            isRtl: false
        };

        run(css, opts, result => {
            let cssResult = trimCss(result.css);
            assert.equal(cssResult, '.foo { rule1: rgba(255, 255, 0, 1); }');
            done();
        });
    });
});

function run(css, opts, assert) {
    return postcss([parser(opts)])
            .process(css)
            .then(assert)
            .catch(err => {setTimeout(() => { throw err; });});
}

function trimCss(css) {
    return css.split('\n').map(t => t.trim()).join(' ');
}
