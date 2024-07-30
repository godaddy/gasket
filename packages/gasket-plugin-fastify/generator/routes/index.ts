import type { AppRoutes } from '@gasket/plugin-fastify';
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply
} from 'fastify';

export const routes: AppRoutes = [
  (app: FastifyInstance): void => {
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
    app.get('/default', async (req: FastifyRequest, res: FastifyReply) => {
      if (res.statusCode === 200) {
        res.send({ message: 'Welcome to your default route...' });
      }
    });
  }
];
