import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

export function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className="splash">
      <article>
        <h1>Introducing {siteConfig.title}</h1>
        <p>Framework Maker for JavaScript Applications</p>
        <a href={useBaseUrl('docs')}>Get Started</a>
      </article>
    </header>
  );
}
