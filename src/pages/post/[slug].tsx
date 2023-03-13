/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

import { GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
    return <h1>Carregando...</h1>;
  }
  const totalWords = post.data.content?.reduce((total, contentItem) => {
    const headingTime = contentItem.heading.split(/\s+/).length;
    const wordsTime = RichText.asText(contentItem.body).split(/\s+/).length;

    return total + headingTime + wordsTime;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const updateAt = format(new Date(post.first_publication_date), 'd MMM yyyy', {
    locale: ptBR,
  });

  return (
    <>
      <img src={post.data.banner.url} alt="Banner" />
      <main className={styles.container}>
        <div className={commonStyles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.calendar}>
            <FiCalendar />
            <span>{updateAt}</span>
            <FiUser />
            <span>{post.data.author}</span>
            <FiClock />
            <span>{readTime} min</span>
          </div>
        </div>
        {post.data.content?.map(content => {
          return (
            <article key={content.heading} className={styles.post}>
              <h2 className={styles.post}>{content.heading}</h2>
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          );
        })}
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});


  return {
    props: {
      post: response
    },
  };
};
