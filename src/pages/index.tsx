/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
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
  const formattedPosts = postsPagination.results.map(post => {
    return {
      ...post, 
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattedPosts);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNextPage(): Promise<void> {
    if (nextPage === null) return;

    const postsResults = await fetch(nextPage).then(response =>
      response.json()
    );

    setNextPage(postsResults.next_page);

    const newPosts = postsResults.results.map(post => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  return (
    <main className={commonStyles.container}>
      <div className={commonStyles.posts}>
        {posts.map(item => (
          <Link key={item.uid} href={`/post/${item.uid}`}>
            <a>
              <h3>{item.data.title}</h3>
              <p>{item.data.subtitle}</p>
              <div className={commonStyles.calendar}>
                <FiCalendar />
                <time>{item.first_publication_date}</time>
                <FiUser />
                <span>{item.data.author}</span>
              </div>
            </a>
          </Link>
        ))}
        {nextPage && (
          <button type="button" onClick={handleNextPage}>
            Carregar mais posts
          </button>
        )}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType<any>('posts', {
    fetch: ['posts.title', 'posts.group', 'posts.author'],
    pageSize: 3,
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.data.author.includes('Danilo')
        ? '2021-03-25T19:27:35+0000'
        : '2021-03-15T19:25:28+0000',
      ...post
    };
  });
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
  };
};
