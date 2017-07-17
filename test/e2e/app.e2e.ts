import {$, $$, browser, ElementFinder, ExpectedConditions} from 'protractor';

interface IAndElementFinder {
  and: ElementFinder;
}
function waitForVisibilityOf(element: ElementFinder): IAndElementFinder {
  browser.wait(ExpectedConditions.visibilityOf(element), 4000);
  return {and: element};
}

function elementByDataHook(dataHook: string): ElementFinder {
  return $(`[data-hook="${dataHook}"]`);
}

describe('Style Processor Scenario', () => {
  beforeEach(async () => {
    browser.executeAsyncScript((executeDone) => {
      window.name = 'E2E';
      executeDone();
    });
    await browser.get('/');
  });

  it('should not change the number of style tags', async () => {
    waitForVisibilityOf(elementByDataHook('text'));
    const styleNum = await $$('style').count();
    browser.executeAsyncScript((executeDone) => {
      window.styleProcessor.init({})
        .then(executeDone);
    });

    expect(await (elementByDataHook('text').getCssValue('color'))).toBe('rgba(255, 255, 255, 1)');
    expect(await ($$('style').count())).toBe(styleNum);
  });

  it('should update styles after change form sdk', async () => {
    const styleNum = await $$('style').count();
    browser.executeAsyncScript((executeDone) => {
      window.styleProcessor.init({})
        .then(executeDone);
    });

    browser.executeAsyncScript((executeDone) => {
      window.changeStyles();
      executeDone();
    });

    expect(await (elementByDataHook('text').getCssValue('color'))).toBe('rgba(0, 0, 0, 1)');
    expect(await $$('style').count()).toBe(styleNum);
  });
});
