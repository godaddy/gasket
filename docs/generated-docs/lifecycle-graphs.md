```mermaid
graph LR;
* -- exec --> commandOptions;
* -- exec --> commands;
express -- execWaterfall --> composeServiceWorker;
init -- execWaterfall --> configure;
gasket/cli --> create;
init -- exec --> createLogger;
start -- execWaterfall --> createServers;
docsSetup -- exec --> docsGenerate;
docs-cmd(docs) -- execApply --> docsSetup;
docsSetup -- exec --> docsView;
createServers -- exec --> errorMiddleware;
createServers -- exec --> errorMiddleware;
createServers -- exec --> express;
createServers -- exec --> fastify;
preboot -- execWaterfall --> gasketData;
*-cmd(*) -- exec --> init;
middleware -- execWaterfall --> initReduxState;
middleware -- exec --> initReduxStore;
build-cmd(build) --> initWebpack;
middleware -- execWaterfall --> intlLocale;
middleware -- execWaterfall --> manifest;
init -- execApply --> metadata;
init -- exec --> metrics;
createServers -- exec --> middleware;
createServers -- exec --> middleware;
express -- exec --> next;
fastify -- exec --> next;
express -- execWaterfall --> nextConfig;
express -- exec --> nextExpress;
fastify -- exec --> nextFastify;
express -- exec --> nextPreHandling;
prompt --> postCreate;
gasket/plugin-start -- exec --> preboot;
create --> prompt;
middleware -- execWaterfall --> responseData;
start -- exec --> servers;
express -- exec --> serviceWorkerCacheKey;
preboot -- exec --> start;
start -- execWaterfall --> terminus;
<<<<<<< HEAD
initWebpack -- execSync --> webpack["webpack (deprecated)"];
initWebpack -- execSync --> webpackChain["webpackChain (deprecated)"];
initWebpack -- execWaterfallSync --> webpackConfig;
createLogger -- exec --> winstonTransports;
=======
initWebpack -- execApplySync --> webpack["webpack (deprecated)"];
initWebpack -- execApplySync --> webpackChain["webpackChain (deprecated)"];
initWebpack -- execApplySync --> webpackConfig;
>>>>>>> 6d4c70e3 (disable prepack doc scripts)
composeServiceWorker -- exec --> workbox;
style docs-cmd fill: red;
style *-cmd fill: red;
style build-cmd fill: red;
```