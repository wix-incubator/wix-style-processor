describe('React application', () => {
  describe('open page', () => {
    it('should display title', async () => {
      await browser.get('/');
      expect(await $('h2').getText()).toBe('Hello World!');
    });
  });
});
