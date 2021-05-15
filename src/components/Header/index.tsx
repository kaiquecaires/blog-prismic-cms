import Link from 'next/link'

export default function Header() {
  return (
    <Link href="/">
      <a href="">
        <img src="/Logo.svg" alt="logo" />
      </a>
    </Link>    
  )
}
