import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { HomepageHeader, HomepageSections } from '../components/homepage';
import Layout from '@theme/Layout';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Framework`}
      description={`${siteConfig.title} Framework Maker for JavaScript Applications`}>
      <main className='front-cover'>
        <HomepageHeader />
        <HomepageSections />
      </main>
    </Layout>
  );
}
