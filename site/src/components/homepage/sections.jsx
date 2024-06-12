import useBaseUrl from '@docusaurus/useBaseUrl';
import IconCliImg from '@site/static/img/icon-cli.svg';
import IconPresetsImg from '@site/static/img/icon-presets.svg';
import IconPluginsImg from '@site/static/img/icon-plugins.svg';
import IconCommandsImg from '@site/static/img/icon-commands.svg';
import IconLifecyclesImg from '@site/static/img/icon-lifecycles.svg';
import IconHooksImg from '@site/static/img/icon-hooks.svg';

const items = [
  {
    icon: <IconCliImg className='gasket-icon' />,
    caption: 'CLI',
    heading: 'CLI loads configured Presets and Plugins',
    content: 'The entry point to creating and interacting with apps. The CLI provides the frame and engine upon which apps are built.'
  },
  {
    icon: <IconPresetsImg className='gasket-icon' />,
    caption: 'PRESETS',
    heading: 'Presets provide Plugins',
    content: 'Logical groups of plugins to build apps. Tech choices for teams, integrations for communities. Effectively, the framework you want to build apps within.'
  },
  {
    icon: <IconPluginsImg className='gasket-icon' />,
    caption: 'PLUGINS',
    heading: 'Plugins add Commands & Hooks',
    content: 'The building blocks of an app framework - plugins provide the scaffolding and circuitry to integrate libraries and have them communicate together.'
  },
  {
    icon: <IconCommandsImg className='gasket-icon' />,
    caption: 'COMMANDS',
    heading: 'Commands execute Lifecycles',
    content: 'Build and start your app. Analyze it, or read the docs. Just a few commands you can execute with available plugins, or create your own.'
  },
  {
    icon: <IconLifecyclesImg className='gasket-icon' />,
    caption: 'LIFECYCLES',
    heading: 'Lifecycles handled by Hooks',
    content: 'The nervous system to transmit signals between parts of apps. Not your typical events; lifecycles can be handled in order and executed in sync.'
  },
  {
    icon: <IconHooksImg className='gasket-icon' />,
    caption: 'HOOKS',
    heading: 'Hooks execute additional Lifecycles',
    content: 'Receptors to handle lifecycle events and perform the actual work of integrating libraries and implementing application code.'
  }
];

function pair(arr, number = 2) {
  return arr.reduce(
    (acc, cur, i) =>
      i % number
        ? Object.assign([...acc], {
          [acc.length - 1]: [...acc[acc.length - 1], cur],
        })
        : [...acc, [cur]],
    []
  );
}

function CategoryItem({ index, icon, heading, content, caption }) {
  return (
    <div key={index} className="gasket-element-column">
      {icon}
      <div className="element-caption">{caption}</div>
      <h3>{heading}</h3>
      <p>{content}</p>
    </div>
  );
}

export function HomepageSections() {
  return (
    <>
      <section className="angled">
        <article>
          <h2>What is Gasket?</h2>
          <p>Gasket helps teams and communities compose frameworks to deliver
            apps of various shapes and sizes. While scaffolding is important,
            Gasket offers functionality beyond simple boilerplate generation.
            Gasket also provides the essential elements for libraries and layers
            of apps to integrate together during runtime.</p>
        </article>
      </section>

      <section>
        <article>
          <h2>How it works</h2>
          <p>These are the essential elements of Gasket, which are used to
            assemble robust frameworks and work together to power apps.
            Browse the <a href="#/README">docs</a> to learn more about these elements and how they can be used.
          </p>
          {
            pair(items).map((row, i) => (
              <div key={i} className="gasket-element-row">
                {row.map((item, j) => (
                  <CategoryItem key={j} index={j} {...item} />
                ))}
              </div>
            ))
          }
        </article>
      </section>

      <section className="angled">
        <article>
          <h2>Plugins</h2>
          <p>Libraries and features are made available for use in your frameworks in the form of plugins.
            We have plugins for several well known libraries and essential features to get started with
            much more to come.
          </p>
          <img className="plugins-graphic" src={useBaseUrl('/img/plugin-logos.svg')} />
          <p>See the <a href={useBaseUrl('/docs#plugins')}>full list</a> and also how you can <a href={useBaseUrl('/docs/contributing')}>contribute!</a>
          </p>
        </article>
      </section>
    </>
  )
}
