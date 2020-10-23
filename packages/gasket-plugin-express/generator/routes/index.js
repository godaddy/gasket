module.exports = (app) => {
  {{#if hasSwaggerPlugin}}
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
  {{/if}}
  app.get('/default', async (req, res, next) => {
    res.status(200).json({
      message: 'Welcome to your default route...'
    });
  });
};
