import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
// import HomepageFeatures from '@site/src/components/HomepageFeatures';
import useBaseUrl from '@docusaurus/useBaseUrl';

// import Heading from '@theme/Heading';
// import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className="splash">
      <article>
        <h1>Introducing Gasket</h1>
        <p>Framework Maker for JavaScript Applications</p>
        <a href={useBaseUrl('docs')}>Get Started</a>
      </article>
    </header>
  );
}

function HomepageSections() {
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

          <div className="gasket-element-row">
            <div className="gasket-element-column">
              <img className="element-icon" src={useBaseUrl('/img/icon-cli.svg')} />
              <div className="element-caption">CLI</div>
              <h3>CLI loads configured Presets and Plugins</h3>
              <p>The entry point to creating and interacting with apps.
                The CLI provides the frame and engine upon which apps are built.</p>
            </div>

            <div className="gasket-element-column">
              <img className="element-icon" src={useBaseUrl('/img/icon-presets.svg')} />
              <div className="element-caption">PRESETS</div>
              <h3>Presets provide Plugins</h3>
              <p>Logical groups of plugins to build apps. Tech choices for teams, integrations for communities.
                Effectively, the framework you want to build apps within.</p>
            </div>
          </div>


          <div className="gasket-element-row">
            <div className="gasket-element-column">
              <img className="element-icon" src={useBaseUrl('/img/icon-plugins.svg')} />
              <div className="element-caption">PLUGINS</div>
              <h3>Plugins add Commands & Hooks</h3>
              <p>The building blocks of an app framework - plugins provide the scaffolding
                and circuitry to integrate libraries and have them communicate together.</p>
            </div>

            <div className="gasket-element-column">
              <img className="element-icon" src={useBaseUrl('/img/icon-commands.svg')} />
              <div className="element-caption">COMMANDS</div>
              <h3>Commands execute Lifecycles</h3>
              <p>Build and start your app. Analyze it, or read the docs.
                Just a few commands you can execute with available plugins, or create your own.</p>
            </div>
          </div>

          <div className="gasket-element-row">
            <div className="gasket-element-column">
              <img className="element-icon" src={useBaseUrl('/img/icon-lifecycles.svg')} />
              <div className="element-caption">LIFECYCLES</div>
              <h3>Lifecycles handled by Hooks</h3>
              <p>The nervous system to transmit signals between parts of apps.
                Not your typical events; lifecycles can be handled in order and executed in sync.</p>
            </div>

            <div className="gasket-element-column">
              <img className="element-icon" src={useBaseUrl('/img/icon-hooks.svg')} />
              <div className="element-caption">HOOKS</div>
              <h3>Hooks execute additional Lifecycles</h3>
              <p>Receptors to handle lifecycle events and perform the actual work of
                integrating libraries and implementing application code.</p>
            </div>
          </div>

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

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Framework`}
      description={`${siteConfig.title} Framework Maker for JavaScript Applications`}>
      <main className='front-cover'>
        <HomepageHeader />
        <HomepageSections />
        {/* <footer>
          <article>
            <div className="footer-links">
              <h4>Docs</h4>
              <a href="#/docs/quick-start">Get Started</a>
              <a href="#/README">Overview</a>
              <a href="#/README?id=guides">Guides</a>
            </div>
            <div className="footer-links">
              <h4>Channel</h4>
              <a href="https://blog.gasket.dev">Blog</a>
              <a target="_blank" href="https://twitter.com/gasketjs">Twitter</a>
              <a target="_blank" href="https://stackoverflow.com/questions/tagged/gasket">Stack Overflow</a>
            </div>
            <div className="footer-links">
              <h4>Contribute</h4>
              <a href="#/CONTRIBUTING">Guidelines</a>
              <a target="_blank" href="https://github.com/godaddy/gasket/">Github</a>
            </div>
            <div className="footer-copyright">
              <a target="_blank" href="https://www.godaddy.com/engineering/">
                <div className="godaddy-open-source">
                  GODADDY OPEN SOURCE
                </div>
              </a>
              <span className="godaddy-copyright">
                Copyright (c) 1999 - 2020 GoDaddy Operating Company, LLC.
              </span>
            </div>
          </article>
        </footer> */}
      </main>
    </Layout>
  );
}
