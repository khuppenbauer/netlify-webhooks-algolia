const sentry = require('./libs/sentry');
const algolia = require('./libs/algolia');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { type } = event.queryStringParameters;
    const data = JSON.parse(event.body);
    const { _id } = data;
    if (type === 'feature') {
      await algolia.feature(_id);
    } else if (type === 'track') {
      await algolia.track(_id);
    }
    return {
      statusCode: 200,
      body: 'Ok',
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
