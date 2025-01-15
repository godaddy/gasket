export const defaultHandler = async (req, res) => {
  if (res.statusCode === 200) {
    res.send({ message: 'Welcome to your default route...' });
  }
};
export default {
  name: 'routes-plugin',
  hooks: {
    fastify(gasket, app) {
      {{#if useSwagger }}
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
      {{/if }}
      app.get('/default', defaultHandler);
    }
  }
}
