import { providers } from 'ethers'

export async function lookupEnsName(address?: string, provider?: providers.Provider): Promise<string | undefined> {
  if (!provider || !address) return undefined
  try {
    return (await provider.lookupAddress(address)) ?? undefined
  } catch {
    return undefined
  }
}

export function shortenAddress(address?: string): string | undefined {
  return address && `${address.substr(0, 6)}...${address.substr(address.length - 4, 4)}`
}
