module.exports = (app) => {
  /**
  * @swagger
  *
  * /default:
  *   get:
  *     summary: "Get default route"
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns welcome message."
  *         content:
  *           application/json
  */
  app.get('/default', async (req, res) => {
    if (res.statusCode === 200) {
      res.send({ message: 'Welcome to your default route...' });
    }
  });
};
