import { Contract, providers, utils } from "ethers";
import GnosisSafe from 'utils/abis/GnosisSafe.json'

// This code was inspired by the "checkNSignatures" function in the Gnosis Safe contract
export const recoverAddress = (dataHashStr: string, signature: string) => {
  const dataHash = utils.arrayify(dataHashStr);
  const { v, r, s } = utils.splitSignature(signature);

  // Ethers adjusts the "v" when it is 1 or 0
  const unadjustedV = signature.slice(-2)

  // For contract signatures and approved hashes, the address is encoded in "r"
  if (unadjustedV === '00' || unadjustedV === '01') {
    console.log(unadjustedV, v, utils.hexDataSlice(r, 12))
    return utils.getAddress(utils.hexDataSlice(r, 12))
  }

  // If v > 30, this is an eth_sign message
  if (v > 30) {
    return utils.verifyMessage(dataHash, { v: v - 4, r, s })
  }

  return utils.recoverAddress(dataHash, { v, r, s })
}

export const getExecTransactionSigners = async (transaction: any, nonce: number, provider: providers.JsonRpcProvider) => {
  const iface = new utils.Interface(GnosisSafe);
  const decodedData = iface.decodeFunctionData('execTransaction', transaction.input)
  const signatures = decodedData.signatures.slice(2).match(/.{1,130}/g).map((sig: string) => `0x${sig}`)

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
        nonce,
      )

      return recoverAddress(dataHash, sig)
    })
  );

  return signers
}

export const getExecTransactionData = async (transaction: any, nonce: number, provider: providers.JsonRpcProvider) => {
  const executor = utils.getAddress(transaction.from);
  const signers = await getExecTransactionSigners(transaction, nonce, provider)
  return { executor, signers, transaction }
}
