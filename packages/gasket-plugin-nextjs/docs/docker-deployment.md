# Gasket Next.js Docker Deployment

Assuming you have domains, certs, load balancing, etc setup in your deployment
environment. Here is a sample definition for a container that runs a Gasket
application:

```Dockerfile
FROM node:14.15.0-alpine3.11

COPY --chown=node:node . /home/node/your_app/

WORKDIR /home/node/your_app

USER node:node

RUN npm ci
RUN npm run build
RUN npm prune --production

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
```
