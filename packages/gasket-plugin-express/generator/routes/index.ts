import type { Gasket } from '@gasket/core';
import type { AppRoutes } from '@gasket/plugin-express';
import type { Application, Request, Response } from 'express';

export const routes: AppRoutes = [
  (gasket: Gasket, app: Application): void => {
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
  }
];

