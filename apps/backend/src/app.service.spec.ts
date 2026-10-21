import { AppService } from './app.service.js';

describe('AppService', () => {
  it('returns the greeting', () => {
    const appService = new AppService();

    expect(appService.getHello()).toBe('Hello World!');
  });
});
