import {expect} from 'chai';
import Driver from './mocks/driver';

describe('Index', () => {
    let driver;

    beforeEach(() => {
        driver = new Driver();

        driver
            .given.css('.foo {--bar: "color(color-1)";color: "color(--bar)";}')
            .defaultSiteColors()
            .styleParams({
                numbers: {},
                colors: {},
                fonts: {}
            })
            .siteTextPresets({});
    });

    it('should update on init', (done) => {
        driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver)).to.equal('.foo {--bar: #FFFFFF;color: #FFFFFF;}');
            done();
        }).catch(err => {setTimeout(function() { throw err; });});
    });

    it('should update style on style change event', (done) => {
        driver.when.init().then(() => {
            driver.given.styleParams({
                numbers: {},
                colors: {
                    'color-1': {value: 'red'}
                },
                fonts: {}
            });

            driver.when.updateStyleParams().then(() => {
                expect(getOverrideStyleCallArg(driver, 1)).to.equal('.foo {--bar: red;color: red;}');
                done();
            }).catch(err => {setTimeout(function() { throw err; });});
        }).catch(err => {setTimeout(function() { throw err; });});
    });

    it('has plugin support', done => {
        driver.given.css('.foo {bar: "increment(number(--baz))"px; --baz: 1;}')
                    .plugin('increment', params => parseInt(params[0]) + 1);

        driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal('.foo {bar: 2px;--baz: 1;}');
            done();
        }).catch(err => {setTimeout(function() { throw err; });});
    });

    it('has declaration plugin support', done => {
        driver.given.css('.foo {bar: 4;}')
                    .declarationPlugin((key, val) => ({
                        key: key + '$',
                        value: val + '#'
                    }));

        driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal('.foo {bar$: 4#;}');
            done();
        }).catch(err => {setTimeout(function() { throw err; });});
    });

    it('should support double font reference', done => {
        driver.given.css('.font-test{--some-font: "font(Body-M)"; font: "font(--some-font)";}')
            .siteTextPresets({
                'Body-M': {
                    displayName: "Paragraph 2",
                    editorKey: "font_8",
                    fontFamily: "din-next-w01-light",
                    lineHeight: "1.4em",
                    size: "16px",
                    style: "normal",
                    value: "font:normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif",
                    weight: "normal"
                }
        });

        driver.when.init().then(() => {
            expect(getOverrideStyleCallArg(driver))
                .to.equal('.font-test{--some-font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;}');
            done();
        }).catch(err => {setTimeout(function() { throw err; });});
    });

    function getOverrideStyleCallArg(driver, callIdx = 0) {
        return driver.get.domService().overrideStyles.getCall(callIdx).args[0];
    }
});
