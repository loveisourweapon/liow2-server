var configFile = require('../../config'),
    configLoader = require('../../utils/config'),
    expect = require('chai').expect;

describe('utils/config', () => {
  it('should return config defined in config.js', () => {
    var config = configLoader();
    expect(config.client_url).to.equal(configFile.client_url);
  }); // it()

  it('should override config with correctly named environment variables', () => {
    var originalValue = process.env.LIOW_CLIENT_URL;
    process.env.LIOW_CLIENT_URL = 'https://example.com';

    var config = configLoader();
    expect(config.client_url).to.equal(process.env.LIOW_CLIENT_URL);

    process.env.LIOW_CLIENT_URL = originalValue;
  }); // it()
}); // describe()
