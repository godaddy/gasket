import { GasketConfigFile } from "@gasket/engine";
import '@gasket/plugin-elastic-apm';

describe('@gasket/plugin-elastic-apm', () => {
  it('adds elasticAPM config to Gasket', () => {
    const config: GasketConfigFile = {
      elasticAPM: {
        secretToken: '****',
        serverUrl: 'http://localhost:9200',
        sensitiveCookies: ['my_jwt', 'userFullName']
      }
    }
  });
});
