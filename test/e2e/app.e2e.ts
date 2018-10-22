import {$, $$, browser, ElementFinder, ExpectedConditions} from 'protractor';

async function waitForVisibilityOf(element: ElementFinder) {
    await browser.wait(ExpectedConditions.visibilityOf(element));
    return {and: element};
}

function elementByDataHook(dataHook: string): ElementFinder {
    return $(`[data-hook="${dataHook}"]`);
}

describe('Style Processor Scenario', () => {
    beforeEach(async () => {
        await browser.executeAsyncScript((executeDone) => {
            window.name = 'E2E';
            executeDone();
        });
    });

    it('should not change the number of style tags', async () => {
        await browser.get('/');
        await waitForVisibilityOf(elementByDataHook('text'));

        const styleNum = await $$('style').count();
        await browser.executeAsyncScript((executeDone) => {
            window.styleProcessor.init({})
                .then(executeDone);
        });

        expect(await (elementByDataHook('text').getCssValue('color'))).toBe('rgba(255, 255, 255, 1)');
        expect(await ($$('style').count())).toBe(styleNum);
    });

    it('should update styles after change from sdk', async () => {
        await browser.get('/');
        await waitForVisibilityOf(elementByDataHook('text'));

        const styleNum = await $$('style').count();
        await browser.executeAsyncScript((executeDone) => {
            window.styleProcessor.init({})
                .then(executeDone);
        });

        await browser.executeAsyncScript((executeDone) => {
            window.changeStyles();
            executeDone();
        });

        expect(await (elementByDataHook('text').getCssValue('color'))).toBe('rgba(0, 0, 0, 1)');
        expect(await $$('style').count()).toBe(styleNum);
    });
});
