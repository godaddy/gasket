export default (app: any) => {
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
  app.get('/default', async (req: any, res: any) => {
    res.status(200).json({
      message: 'Welcome to your default route...'
    });
  });
};
