const happyFeet = require('happy-feet');

module.exports = {
    name: require('../package').name,
    hooks: {
        preboot: async function preboot(gasket) {
            const happyConfig = gasket.config.get('happyConfig') || {}
            gasket.happyFeet = happyFeet(happyConfig)
        },
        healthcheck: async function healthcheck(gasket, HealthCheckError) {
            const happyConfig = gasket.config.get('happyConfig') || {}
            const happy = gasket.happyFeet;
            if (happy.state === happy.STATE.UNHAPPY) {
                // flag pod to be removed from LB
                throw new HealthCheckError(`Pod has exceeded its memory limits \n 
                    ${JSON.stringify(happyConfig)`)
            }
            return 'page ok';
        }
    }
};
