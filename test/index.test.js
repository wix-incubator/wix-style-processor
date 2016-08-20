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
            expect(driver.get.domService().overrideStyles.getCall(0).args[0]).to.equal('.foo {--bar: #FFFFFF;color: #FFFFFF;}');
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
                expect(driver.get.domService().overrideStyles.getCall(1).args[0]).to.equal('.foo {--bar: red;color: red;}');
                done();
            }).catch(err => {setTimeout(function() { throw err; });});
        }).catch(err => {setTimeout(function() { throw err; });});
    });

    it('should use START=right given isRtl is true', done => {
        driver.given.css('.foo {START: 5px;}');
        driver.when.init({isRtl: true}).then(() => {
            expect(driver.get.domService().overrideStyles.getCall(0).args[0])
                .to.equal('.foo {right: 5px;}');

            done();
        }).catch(err => {setTimeout(function() { throw err; });});;
    });
});
