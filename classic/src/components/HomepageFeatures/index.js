import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'CLI loads configured Presets and Plugins',
    Svg: require('@site/static/img/icon-cli.svg').default,
    description: (
      <>
        The entry point to creating and interacting with apps. The CLI provides the frame and engine upon which apps are built.
      </>
    ),
  },
  {
    title: 'Presets provide Plugins',
    Svg: require('@site/static/img/icon-presets.svg').default,
    description: (
      <>
        Logical groups of plugins to build apps. Tech choices for teams, integrations for communities. Effectively, the framework you want to build apps within.
      </>
    ),
  },
  {
    title: 'Plugins add Commands & Hooks',
    Svg: require('@site/static/img/icon-plugins.svg').default,
    description: (
      <>
        The building blocks of an app framework - plugins provide the scaffolding and circuitry to integrate libraries and have them communicate together.
      </>
    ),
  },
  {
    title: 'Commands execute Lifecycles',
    Svg: require('@site/static/img/icon-commands.svg').default,
    description: (
      <>
        Build and start your app. Analyze it, or read the docs. Just a few commands you can execute with available plugins, or create your own.
      </>
    ),
  },
  {
    title: 'Lifecycles handled by Hooks',
    Svg: require('@site/static/img/icon-lifecycles.svg').default,
    description: (
      <>
        The nervous system to transmit signals between parts of apps. Not your typical events; lifecycles can be handled in order and executed in sync.
      </>
    ),
  },
  {
    title: 'Hooks execute additional Lifecycles',
    Svg: require('@site/static/img/icon-hooks.svg').default,
    description: (
      <>
        Receptors to handle lifecycle events and perform the actual work of integrating libraries and implementing application code.
      </>
    ),
  }
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
