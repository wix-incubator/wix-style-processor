describe('Style Processor Scenario', () => {
  beforeEach(async (done) => {
    browser.executeAsyncScript((excuteDone) => {
      window.name = 'E2E';
      excuteDone();
    });
    await browser.get('/');
    done();
  });

  it('should not change the number of style tags', async () => {
    const styleNum = await $$('style').count();
    browser.executeAsyncScript((excuteDone) => {
      window.styleProcessor.init({})
        .then(excuteDone);
    });

    expect(await ($('[data-hook="text"]').getCssValue('color'))).toBe('rgba(255, 255, 255, 1)');
    expect(await $$('style').count()).toBe(styleNum);
  });

  it('should update styles after change form sdk', async () => {
    const styleNum = await $$('style').count();
    browser.executeAsyncScript((excuteDone) => {
      window.styleProcessor.init({})
        .then(excuteDone);
    });

    browser.executeAsyncScript((excuteDone) => {
      window.changeStyles();
      excuteDone();
    });

    expect(await ($('[data-hook="text"]').getCssValue('color'))).toBe('rgba(0, 0, 0, 1)');
    expect(await $$('style').count()).toBe(styleNum);
  });
});
