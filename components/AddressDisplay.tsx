import { useAsync } from 'react-async-hook'
import { useEthereum } from 'utils/hooks/useEthereum';
import { lookupEnsName } from 'utils/web3';

interface Props {
  address: string;
}

const AddressDisplay = ({ address }: Props) => {
  const { provider } = useEthereum();
  const { result: ensName } = useAsync(lookupEnsName, [address, provider]);

  return (
    <span>{ensName ?? address}</span>
  )
}

export default AddressDisplay;
