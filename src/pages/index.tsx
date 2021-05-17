import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function handleLoadNextPage() {
    const response = await fetch(nextPage)
    .then(response => response.json())
    .then(response => response);

    const postsFormatted = response.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data
      }
    })

    const newPosts = [...posts, ...postsFormatted]

    setPosts(newPosts);
    setNextPage(response.next_page)
  }

  return (
    <>
    <Head>
      <title>Home | spacetraveling.</title>
    </Head>
    <div className={`${commonStyles.commonContainer} ${styles.container}`}>
      <img src="/Logo.svg" alt="logo" />
      <div className={styles.posts}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a href="">
              <div className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <time>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      "dd MMM yyyy",
                      {
                        locale: ptBR
                      }
                    )}
                  </time>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {nextPage && (
        <button className={styles.loadPosts} onClick={handleLoadNextPage}>Carregar mais posts</button>
      )}
    </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: post.data
    }
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page
      }
    }
  }
};
