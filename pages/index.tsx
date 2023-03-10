import AddressInput from 'components/AddressInput'
import Link from 'next/link'

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <AddressInput />
      <div>
        Or try{' '}
        <Link href="/safe/0x15d0f64ffcf91c39810529f805cc3595dc3ef83f" className="underline decoration-red-500">
          0x15d0f64ffcf91c39810529f805cc3595dc3ef83f
        </Link>
      </div>
    </div>
  )
}

export default Home
