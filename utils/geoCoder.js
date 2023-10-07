const NodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.GEO_CODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEO_CODER_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
