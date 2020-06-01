# Gasket Next.js Docker Deployment

Assuming you have domains, certs, load balancing, etc setup in your deployment
environment. Here is a sample definition for a container that runs a Gasket
application:

```Dockerfile
FROM jcrugzz/s6-node-alpine:12.16.1-native
# create a user that can run the application
# and define the maximum open files at 16k
RUN ulimit -n 65536 && \
    addgroup -g 9999 app && \
    adduser -D  -G app -s /bin/false -u 999 app

ENV HOME /home/app/
COPY docker/.npmrc /home/app/

RUN mkdir -p /home/app/your_app
WORKDIR /home/app/your_app
COPY package.json /home/app/your_app/
COPY package-lock.json /home/app/your_app/

RUN npm ci
COPY . /home/app/your_app

RUN npm run build
RUN npm prune --production

RUN chown -R app:app /home/app/
COPY run.sh /etc/services.d/your_app/run
RUN chmod 755 /etc/services.d/your_app/run

EXPOSE 8080
```
Then, make sure that `run.sh` is present so whatever container service you use
(Kubernetes for example), knows what `docker run` means:

```sh
#!/usr/bin/with-contenv sh
set -e

cd /home/app/your_app
# using the group that defined above, run npm start
exec s6-applyuidgid -u 9999 -g 999 npm start
```
