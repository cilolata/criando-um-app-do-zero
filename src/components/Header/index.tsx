import Link from 'next/link';
import header from './header.module.scss';

export default function Header() {
  return (
    <header className={header.headerContainer}>
      <Link href="/">
        <img src="../logo.svg" alt="logo" />
      </Link>
    </header>
  );
}
