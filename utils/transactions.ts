import axios from 'axios'
import pRetry from 'p-retry'
import { Contract, providers, Transaction, utils } from 'ethers'
import GnosisSafe from 'utils/abis/GnosisSafe.json'
import { ChainId } from 'eth-chains'

// This code was inspired by the "checkNSignatures" function in the Gnosis Safe contract
export const recoverAddress = (dataHashStr: string, signature: string) => {
  const dataHash = utils.arrayify(dataHashStr)
  const { v, r, s } = utils.splitSignature(signature)

  // Ethers adjusts the "v" when it is 1 or 0
  const unadjustedV = signature.slice(-2)

  // For contract signatures and approved hashes, the address is encoded in "r"
  if (unadjustedV === '00' || unadjustedV === '01') {
    return utils.getAddress(utils.hexDataSlice(r, 12))
  }

  // If v > 30, this is an eth_sign message
  if (v > 30) {
    return utils.verifyMessage(dataHash, { v: v - 4, r, s })
  }

  return utils.recoverAddress(dataHash, { v, r, s })
}

// TODO: Decode data from functions other than execTransaction (e.g. MultiSend)
export const getExecTransactionSigners = async (
  transaction: Transaction,
  nonce: number,
  provider: providers.JsonRpcProvider
) => {
  try {
    const iface = new utils.Interface(GnosisSafe)
    const decodedData = iface.decodeFunctionData('execTransaction', transaction.data)
    const signatures = decodedData.signatures
      .slice(2)
      .match(/.{1,130}/g)
      .map((sig: string) => `0x${sig}`)

    const contract = new Contract(transaction.to!, iface, provider)

    const signers = await Promise.all(
      signatures.map(async (sig: string) => {
        const [dataHash] = await contract.functions.getTransactionHash(
          decodedData.to,
          decodedData.value,
          decodedData.data,
          decodedData.operation,
          decodedData.safeTxGas,
          decodedData.baseGas,
          decodedData.gasPrice,
          decodedData.gasToken,
          decodedData.refundReceiver,
          nonce
        )

        return recoverAddress(dataHash, sig)
      })
    )

    return signers
  } catch {
    // This means it's not an execTransaction (TODO: Decode data from functions other than execTransaction)
    return []
  }
}

export const getExecTransactionData = async (transaction: any, nonce: number, provider: providers.JsonRpcProvider) => {
  const executor = utils.getAddress(transaction.from)
  const signers = await getExecTransactionSigners(transaction, nonce, provider)
  return { executor, signers, transaction }
}

export const loadPastSigners = async (address: string, provider?: providers.JsonRpcProvider, _chainId?: number) => {
  if (!provider) return

  const logs = await provider.getLogs({
    address,
    fromBlock: 0,
    toBlock: 'latest',
    topics: ['0x9465fa0c962cc76958e6373a993326400c1c94f8be2fe3a952adfa7f60b2ea26'], // AddedOwner
  })

  const signers = logs.map((log) => utils.getAddress(utils.hexDataSlice(log.data, 12)))

  return signers
}

export const loadTransactions = async (address: string, provider?: providers.JsonRpcProvider, _chainId?: number) => {
  if (!provider) return

  const transactions = await pRetry(() => getAddressTransactions(address, provider), { retries: 5 })

  const parsedTransactions = await Promise.all(
    transactions.map(async (tx: any, nonce: number) => getExecTransactionData(tx, nonce, provider))
  )

  return parsedTransactions
}

const getAddressTransactions = async (
  address: string,
  provider: providers.JsonRpcProvider
): Promise<Array<Transaction>> => {
  const logs = await provider.getLogs({
    address,
    fromBlock: 0,
    toBlock: 'latest',
    topics: ['0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e'], // ExecutionSuccess
  })

  const transactions = await Promise.all(
    logs.map(async (log: any) => {
      const tx = await provider.getTransaction(log.transactionHash)
      return tx
    })
  )

  return transactions
}
