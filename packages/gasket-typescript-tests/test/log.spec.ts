import Log from '@gasket/log';

describe('gasket/log', function () {
  const perform = false;

  it('has expected API', function () {
    let logger: Log;

    logger = new Log();

    logger = new Log({ level: 'debug', local: true, prefix: 'awesome', silent: false });

    // @ts-ignore-error
    logger = new Log({ bogus: true });
  });

  it('has default level methods', () => {
    const logger = new Log();

    if(perform) {
      logger.alert('message');
      logger.crit('message');
      logger.debug('message');
      logger.emerg('message');
      logger.error('message');
      logger.info('message');
      logger.warning('message');
      logger.notice('message');
      logger.log('message');
    }
  });

  it('allows custom level methods', () => {
    const logger = new Log();

    if(perform) {
      logger.custom('message');
    }
  });
});
