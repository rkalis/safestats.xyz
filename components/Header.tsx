import Link from 'next/link'
import { SUPPORTED_CHAINS } from 'utils/constants';
import { useEthereum } from 'utils/hooks/useEthereum';

const Header = () => {
  const { chainName, chainId } = useEthereum();

  return (
    <div className='p-4 text-center'>
      <h1 className="text-3xl">
        <Link href="/">SafeStats.xyz</Link>
      </h1>
      <div>
        Connected to {chainName}
        {SUPPORTED_CHAINS.includes(chainId ?? 0) ? null : ' (unsupported)'}
      </div>
    </div>
);
  }

export default Header
