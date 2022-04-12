import { useAsync } from 'react-async-hook'
import { useEthereum } from 'utils/hooks/useEthereum'
import { lookupEnsName, shortenAddress } from 'utils/web3'

interface Props {
  address: string
}

const AddressDisplay = ({ address }: Props) => {
  const { provider } = useEthereum()
  const { result: ensName } = useAsync(lookupEnsName, [address, provider])

  return (
    <>
      <span className="hidden sm:inline">{ensName ?? address}</span>
      <span className="inline sm:hidden">{ensName ?? shortenAddress(address)}</span>
    </>
  )
}

export default AddressDisplay
