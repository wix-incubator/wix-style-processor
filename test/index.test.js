import {expect} from 'chai';
import Driver from './mocks/driver';

describe('Index', () => {
    let driver;

    beforeEach(() => {
        driver = new Driver();

        driver
            .given.css('.foo {color: "get(color-1)"}')
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
            expect(driver.get.domService().overrideStyles.getCall(0).args[0]).to.equal('.foo {color: #FFFFFF}');
            done();
        }).catch(err => {setTimeout(function() { throw err; });});
    });

    it('should update ', (done) => {
        driver.when.init().then(() => {
            driver.given.styleParams({
                numbers: {},
                colors: {
                    'color-1': {value: 'red'}
                },
                fonts: {}
            });

            driver.when.updateStyleParams().then(() => {
                expect(driver.get.domService().overrideStyles.getCall(1).args[0]).to.equal('.foo {color: red}');
                done();
            }).catch(err => {setTimeout(function() { throw err; });});
        }).catch(err => {setTimeout(function() { throw err; });});
    });
});
