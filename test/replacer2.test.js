import _ from 'lodash';
import replacer from '../src/replacer2';
import {assert} from 'chai';
import {Parser, Stringifier} from 'shady-css-parser';

describe.only('replacer2', () => {

    it('get transformation', () => {
        let css = `.foo {
            rule: bar;
            rule3: baz;
            rule4: "color(color-1)";
            rule5: "color(color(color-2))";
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

        let cssResult = run(css, opts);
        assert.equal(cssResult, '.foo{rule:bar;rule3:baz;rule4:#FF0000;rule5:#FF0000;}');
    });

    it('opacity transformation', () => {
        let css = `.foo {
            rule1: "opacity(color-1, 0.5)";
        }`;

        let opts = {
            colors: {
                'color-1': '#FF0000',
            },
            fonts: {},
            numbers: {},
            isRtl: false
        };

        let cssResult = run(css, opts);
        assert.equal(cssResult, '.foo{rule1:rgba(255, 0, 0, 0.5);}');
    });

    it('composed opacity', () => {
        let css = `.foo {
            rule1: "opacity(color(color-1), 0.5)";
        }`;

        let opts = {
            colors: {
                'color-1': '#FF0000',
            },
            fonts: {},
            numbers: {},
            isRtl: false
        };

        let cssResult = run(css, opts);
        assert.equal(cssResult, '.foo{rule1:rgba(255, 0, 0, 0.5);}');
    });

    it('join', () => {
        let css = `.foo {
            rule1: "join(color-1, 1, color-2, 1)";
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

        let cssResult = run(css, opts);
        assert.equal(cssResult, '.foo{rule1:rgb(255, 255, 0);}');
    });

    it('composed join', () => {
        let css = `.foo {
            rule1: "join(opacity(color-1, 0.5), 1, opacity(color-2, 0.5), 1)";
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

        let cssResult = run(css, opts);
        assert.equal(cssResult, '.foo{rule1:rgb(128, 128, 0);}');
    });

    it('param', () => {
        let css = `.foo {
            rule1: "color(--zz)";
        }`;

        let opts = {
            colors: {
                'color-1': '#FFFF00',
                'zz': 'color(color-1)'
            },
            fonts: {},
            numbers: {},
            isRtl: false
        };

        let cssResult = run(css, opts);
        assert.equal(cssResult, '.foo{rule1:#FFFF00;}');
    });

    it('number', () => {
        let css = `.foo {
            rule1: "number(--foo)"px;
        }`;

        let opts = {
            colors: {},
            fonts: {},
            numbers: {
                'foo': '42'
            }
        };

        let cssResult = run(css, opts);
        assert.equal(cssResult, '.foo{rule1:42px;}');
    });

    it("don't throw given invalid css", () => {
        let css = `.foo {
            rule1: "gaga(ccc)";
            rule2: "color(bbb)";
            rule3: "opacity(iii)";
            rule4: #fff;
        }`;

        let opts = {
            colors: {},
            fonts: {},
            numbers: {}
        };

        let cssResult = run(css, opts);
        assert.equal(cssResult, '.foo{rule1:undefined;rule2:undefined;rule3:"opacity(iii)";rule4:#fff;}')
    });
});

function run(css, opts, assert) {
    return replacer({css, ...opts});
}

function trimCss(css) {
    return css.split('\n').map(t => t.trim()).join(' ');
}
