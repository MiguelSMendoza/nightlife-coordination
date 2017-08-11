import { NightlifeCoordinationPage } from './app.po';

describe('nightlife-coordination App', () => {
  let page: NightlifeCoordinationPage;

  beforeEach(() => {
    page = new NightlifeCoordinationPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
