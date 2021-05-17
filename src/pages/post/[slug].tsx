import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const count = post.data?.content.reduce((acc, item) => {
    const section = RichText.asText(item.body).split(' ').length;
    return acc + section;
  }, 0);

  const readingTime = Math.ceil(count / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <Header />
      <img src={post.data.banner.url} className={styles.banner} alt="banner" />
      <div className={`${styles.container} ${commonStyles.commonContainer}`}>
        <div className={styles.post}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar size={20} />
              {format(
                new Date(post.first_publication_date),
                "dd MMM yyyy",
                {
                  locale: ptBR
                }
              )}
            </time>
            <span className={styles.author}>
              <FiUser size={20} />
              {post.data.author}
            </span>
            <span className={styles.readingTime}>
              <FiClock size={20} />
              {readingTime} min
            </span>
          </div>
          {post.data.content.map(contentData => (
            <div className={styles.postContent} key={contentData.heading}>
              <h1 className={styles.heading}>{contentData.heading}</h1>
              <div
                className={styles.textContent}
                dangerouslySetInnerHTML={{__html: RichText.asHtml(contentData.body)}}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      pageSize: 3
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {  paths, fallback: true }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params

  const post = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post
    }
  }
};
