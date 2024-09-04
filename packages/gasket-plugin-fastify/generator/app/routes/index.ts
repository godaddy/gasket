import type {
  FastifyRequest,
  FastifyReply
} from 'fastify';

export const defaultHandler = async (req: FastifyRequest, res: FastifyReply) => {
  if (res.statusCode === 200) {
    res.send({ message: 'Welcome to your default route...' });
  }
};

{{#if useSwagger}}
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
app.get('/default', defaultHandler);
