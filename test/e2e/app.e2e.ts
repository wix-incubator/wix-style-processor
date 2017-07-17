import {$, $$, browser, ExpectedConditions} from 'protractor';

describe('Style Processor Scenario', () => {
  beforeEach((done) => {
    browser.executeAsyncScript((executeDone) => {
      window.name = 'E2E';
      executeDone();
    });
    done();
  });

  it('should not change the number of style tags', async () => {
    await browser.get('/');
    browser.wait(ExpectedConditions.visibilityOf($('[data-hook="text"]')));

    const styleNum = await $$('style').count();
    browser.executeAsyncScript((executeDone) => {
      window.styleProcessor.init({})
        .then(executeDone);
    });

    expect(await ($('[data-hook="text"]').getCssValue('color'))).toBe('rgba(255, 255, 255, 1)');
    expect(await ($$('style').count())).toBe(styleNum);
  });

  it('should update styles after change form sdk', async () => {
    await browser.get('/');
    browser.wait(ExpectedConditions.visibilityOf($('[data-hook="text"]')));

    const styleNum = await $$('style').count();
    browser.executeAsyncScript((executeDone) => {
      window.styleProcessor.init({})
        .then(executeDone);
    });

    browser.executeAsyncScript((executeDone) => {
      window.changeStyles();
      executeDone();
    });

    expect(await ($('[data-hook="text"]').getCssValue('color'))).toBe('rgba(0, 0, 0, 1)');
    expect(await $$('style').count()).toBe(styleNum);
  });
});
