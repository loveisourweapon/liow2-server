var configFile = require('../../config'),
    configLoader = require('../../utils/config'),
    expect = require('chai').expect;

describe('utils/config', () => {
  it('should return config defined in config.js', () => {
    var config = configLoader();
    expect(config.client_urls).to.equal(configFile.client_urls);
  }); // it()

  it('should override config with correctly named environment variables', () => {
    var originalValue = process.env.LIOW_CLIENT_URLS;
    process.env.LIOW_CLIENT_URLS = ['https://example.com'];

    var config = configLoader();
    expect(config.client_urls).to.equal(process.env.LIOW_CLIENT_URLS);

    process.env.LIOW_CLIENT_URLS = originalValue;
  }); // it()
}); // describe()
