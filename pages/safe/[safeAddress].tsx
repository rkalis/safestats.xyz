import { useRouter } from 'next/router'
import { useEthereum } from 'utils/hooks/useEthereum'
import GnosisSafe from 'utils/abis/GnosisSafe.json'
import { Contract, utils } from 'ethers'
import { loadTransactions } from 'utils/transactions'
import { CountTable } from 'components/CountTable'
import AddressDisplay from 'components/AddressDisplay'
import { useAsync } from 'react-async-hook'
import { ADDRESS_REGEX } from 'utils/constants'
import ClipLoader from 'react-spinners/ClipLoader'

const SafeDashboard = () => {
  const iface = new utils.Interface(GnosisSafe)
  const router = useRouter()
  const address = router.query.safeAddress as string

  const { provider } = useEthereum()
  const { result: parsedTransactions = [], loading, error } = useAsync(loadTransactions, [address, provider])
  const { result: currentSigners = [] } = useAsync(() => loadSigners(), [provider])
  const { result: threshold = 0 } = useAsync(() => loadThreshold(), [provider])

  const loadSigners = async () => {
    if (!provider) return

    const contract = new Contract(address, iface, provider)
    const [signers] = await contract.functions.getOwners()

    return signers
  }

  const loadThreshold = async () => {
    if (!provider) return

    const contract = new Contract(address, iface, provider)
    const [threshold] = await contract.functions.getThreshold()

    return Number(threshold)
  }

  const defaultCounts = Object.fromEntries(currentSigners.map((signer: string) => [signer, 0]))

  const signerCounts = parsedTransactions
    .flatMap((tx) => tx.signers)
    .reduce<{ [signer: string]: number }>(
      (counts, signer) => ({
        ...counts,
        [signer]: (counts[signer] ?? 0) + 1,
      }),
      defaultCounts
    )

  const executorCounts = parsedTransactions
    .map((tx) => tx.executor)
    .reduce<{ [executor: string]: number }>(
      (counts, executor) => ({
        ...counts,
        [executor]: (counts[executor] ?? 0) + 1,
      }),
      defaultCounts
    )

  if (!provider) {
    return <div className="text-center">SafeStats.xyz requires MetaMask to be installed.</div>
  }

  if (!ADDRESS_REGEX.test(address)) {
    return <div className="text-center">Incorrect address.</div>
  }

  if (error) {
    return <div className="text-center">An error occurred: {error.message}.</div>
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="p-4 text-2xl">
        <AddressDisplay address={address} /> ({threshold} of {currentSigners.length})
      </h2>
      {loading ? (
        <ClipLoader />
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <CountTable title="Transactions Signed" counts={signerCounts} currentSigners={currentSigners} />
          <CountTable title="Transactions Executed" counts={executorCounts} currentSigners={currentSigners} />
        </div>
      )}
    </div>
  )
}

export default SafeDashboard
