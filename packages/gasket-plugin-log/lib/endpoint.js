module.exports = function configureEndpoint(gasket) {

  // Things to consider adding:
  // Handling of invalid requests.
  // Restrictions on request volume/frequency.
  // Evaluate how to properly handle exceptions happening here.

  async function endpoint(req, res) {

    try {
      gasket.logger[req.body.level]({
        message: 'Client log',
        namespace: req.body.namespace,
        data: req.body.data
      });
      return res.send(200);
    } finally {
      // Do nothing
    }

  }
  return endpoint;
};
