import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import useBaseUrl from '@docusaurus/useBaseUrl';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)} style={{
      backgroundImage: `url(${useBaseUrl('img/gasket-hero.svg')})`,
      backgroundPosition: 'center',
      backgroundSize: 'contain',
    }}>
      <div className="container">
        <img src={useBaseUrl("img/logo-cover.svg")} alt="Gasket Framework" className={styles.heroBannerLogo} />
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <a class="button button--lg button--secondary" href={useBaseUrl('docs')}>Get Started</a>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Framework`}
      description={`${siteConfig.title} Framework Maker for JavaScript Applications`}>
      <HomepageHeader />
      <main className={`${styles.mainAlign} margin-vert--lg`}>
        <div className='container'>
          <div className={`row ${styles.centerFlex}`}>
            <div className='col col--6'>
              <Heading as='h2'>What is Gasket?</Heading>
              <p>Gasket helps teams and communities compose frameworks to deliver
                apps of various shapes and sizes. While scaffolding is important,
                Gasket offers functionality beyond simple boilerplate generation.
                Gasket also provides the essential elements for libraries and layers
                of apps to integrate together during runtime.
              </p>
            </div>
          </div>
          <div className={`row ${styles.centerFlex}`}>
            <div className='col col--6'>
              <Heading as='h2'>How it works</Heading>
              <p>These are the essential elements of Gasket, which are used to
                assemble robust frameworks and work together to power apps.
                Browse the <a href={useBaseUrl('docs')}>docs</a> to learn more about these elements and how they can be used.
              </p>
            </div>
          </div>
        </div>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
