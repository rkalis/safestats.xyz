import type { NextPage } from 'next'
import { useEthereum } from 'utils/hooks/useEthereum'

const Home: NextPage = () => {
  const { chainId } = useEthereum();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      {chainId}
    </div>
  )
}

export default Home
