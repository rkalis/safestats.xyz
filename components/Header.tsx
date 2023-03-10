import Link from 'next/link'
import { useEthereum } from 'utils/hooks/useEthereum'

const Header = () => {
  const { chainName } = useEthereum()

  return (
    <div className="p-4 text-center">
      <h1 className="text-3xl">
        <Link href="/">SafeStats.xyz</Link>
      </h1>
      <div>Connected to {chainName}</div>
    </div>
  )
}

export default Header
