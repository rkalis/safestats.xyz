import axios from 'axios'
import pRetry from 'p-retry'
import { Contract, providers, utils } from 'ethers'
import GnosisSafe from 'utils/abis/GnosisSafe.json'

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

export const getExecTransactionSigners = async (
  transaction: any,
  nonce: number,
  provider: providers.JsonRpcProvider
) => {
  const iface = new utils.Interface(GnosisSafe)
  const decodedData = iface.decodeFunctionData('execTransaction', transaction.input)
  const signatures = decodedData.signatures
    .slice(2)
    .match(/.{1,130}/g)
    .map((sig: string) => `0x${sig}`)

  const contract = new Contract(transaction.to, iface, provider)

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
}

export const getExecTransactionData = async (transaction: any, nonce: number, provider: providers.JsonRpcProvider) => {
  const executor = utils.getAddress(transaction.from)
  const signers = await getExecTransactionSigners(transaction, nonce, provider)
  return { executor, signers, transaction }
}

export const loadTransactions = async (address: string, provider?: providers.JsonRpcProvider, chainId?: number) => {
  if (!provider) return

  const iface = new utils.Interface(GnosisSafe)

  const transactions = await pRetry(() => getAddressTransactions(address, chainId), { retries: 5 })
  // Filter all successful 'execTransaction' calls
  const execTransactions = (transactions ?? [])
    .filter((tx: any) => tx.input.slice(0, 10) == iface.getSighash(iface.getFunction('execTransaction')))
    .filter((tx: any) => tx.txreceipt_status === '1')

  const parsedTransactions = await Promise.all(
    execTransactions.map(async (tx: any, nonce: number) => getExecTransactionData(tx, nonce, provider))
  )

  return parsedTransactions
}

const getAddressTransactions = async (address: string, chainId?: number) => {
  let explorerBaseURL = 'api.etherscan.com'
  switch (chainId) {
    case 137:
      explorerBaseURL = 'api.polygonscan.com'
      break
    case 42220:
      explorerBaseURL = 'api.celoscan.io'
      break
    case 42161:
      explorerBaseURL = 'api.arbiscan.io'
      break
  }

  const res = await axios.get(
    `https://${explorerBaseURL}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&apikey=YourApiKeyToken`
  )

  if (res.data.message === 'NOTOK') {
    throw new Error(`Etherscan API returned an error: ${res.data.result}`)
  }

  return res.data.result
}
