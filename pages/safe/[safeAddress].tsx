import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import { useEthereum } from "utils/hooks/useEthereum";
import GnosisSafe from 'utils/abis/GnosisSafe.json';
import { utils } from "ethers";
import axios from 'axios';
import { getExecTransactionData } from "utils/signatures";
import { CountTable } from "components/CountTable";
import AddressDisplay from "components/AddressDisplay";

interface ParsedTransaction {
  executor: string
  signers: string[]
  transaction: any
}

const SafeDashboard = () => {
  const router = useRouter()
  const address = router.query.safeAddress as string

  const { provider } = useEthereum();
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!provider) return;

      const iface = new utils.Interface(GnosisSafe);
      const res = await axios.get(`https://api.etherscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&apikey=YourApiKeyToken`)
      const transactions = res.data.result

      const execTransactions = transactions?.filter((tx: any) => (
        tx.input.slice(0, 10) == iface.getSighash(iface.getFunction('execTransaction'))) && tx.to === address
      );

      const parsedTransactions = await Promise.all(
        execTransactions?.map(async (tx: any, nonce: number) => getExecTransactionData(tx, nonce, provider))
      );

      setParsedTransactions(parsedTransactions)
    }

    init();
  }, [provider])

  const signerCounts = parsedTransactions
    .flatMap((tx) => tx.signers)
    .reduce<{ [signer: string]: number }>((counts, signer) => ({
      ...counts,
      [signer]: (counts[signer] ?? 0) + 1
    }), {})

  const executorCounts = parsedTransactions
    .map((tx) => tx.executor)
    .reduce<{ [executor: string]: number }>((counts, executor) => ({
      ...counts,
      [executor]: (counts[executor] ?? 0) + 1
    }), {})

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-2xl p-4"><AddressDisplay address={address} /></h1>
      <div className="flex gap-2">
        <CountTable title="Transactions Signed" counts={signerCounts} />
        <CountTable title="Transactions Executed" counts={executorCounts} />
      </div>
    </div>
  )
}

export default SafeDashboard
