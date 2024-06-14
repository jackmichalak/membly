import type { NextPage } from 'next';
import Head from 'next/head';
import Search from '../components/Search';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Membly</title>
        <meta name="description" content="Membly -- use your browser history as a knowledge base" />
      </Head>
      <main>
        <Search />
      </main>
    </div>
  );
};

export default Home;