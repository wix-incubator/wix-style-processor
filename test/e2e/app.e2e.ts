describe('Style Processor Scenario', () => {
  beforeEach(async (done) => {
    browser.executeAsyncScript((excuteDone) => {
      window.name = 'E2E';
      excuteDone();
    });
    await browser.get('/');
    done();
  });

  it('should display title', async () => {
    const styleNum = $$('style').count();
    browser.executeAsyncScript((excuteDone) => {
      window.styleProcessor.init({})
        .then(excuteDone);
      excuteDone();
    });
    expect(await $$('style').count()).toBe(styleNum);
  });
});
