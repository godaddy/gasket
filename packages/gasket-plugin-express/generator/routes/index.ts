import type { Request, Response } from 'express';
import gasket from '../gasket.js';

const app = gasket.actions.getExpressApp();

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
app.get('/default', async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to your default route...'
  });
});
