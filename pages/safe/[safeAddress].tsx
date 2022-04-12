import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useEthereum } from 'utils/hooks/useEthereum'
import GnosisSafe from 'utils/abis/GnosisSafe.json'
import { Contract, utils } from 'ethers'
import axios from 'axios'
import { getExecTransactionData } from 'utils/signatures'
import { CountTable } from 'components/CountTable'
import AddressDisplay from 'components/AddressDisplay'
import { useAsync } from 'react-async-hook'

interface ParsedTransaction {
  executor: string
  signers: string[]
  transaction: any
}

const SafeDashboard = () => {
  const iface = new utils.Interface(GnosisSafe)
  const router = useRouter()
  const address = router.query.safeAddress as string

  const { provider } = useEthereum()
  const { result: parsedTransactions = [] } = useAsync(() => loadTransactions(), [provider])
  const { result: currentSigners = [] } = useAsync(() => loadSigners(), [provider])
  const { result: threshold = 0 } = useAsync(() => loadThreshold(), [provider])

  const loadTransactions = async () => {
    if (!provider) return

    const res = await axios.get(
      `https://api.etherscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&apikey=YourApiKeyToken`
    )
    const transactions = res.data.result

    const execTransactions = transactions?.filter(
      (tx: any) => tx.input.slice(0, 10) == iface.getSighash(iface.getFunction('execTransaction')) && tx.to === address
    )

    const parsedTransactions = await Promise.all(
      execTransactions?.map(async (tx: any, nonce: number) => getExecTransactionData(tx, nonce, provider))
    )

    return parsedTransactions
  }

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
    return (
      <div>SafeStats.xyz requires MetaMask to be installed.</div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="p-4 text-2xl">
        <AddressDisplay address={address} /> ({threshold} of {currentSigners.length})
      </h1>
      <div className="flex gap-2">
        <CountTable title="Transactions Signed" counts={signerCounts} currentSigners={currentSigners} />
        <CountTable title="Transactions Executed" counts={executorCounts} currentSigners={currentSigners} />
      </div>
    </div>
  )
}

export default SafeDashboard
