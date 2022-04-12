import { providers } from "ethers"

export async function lookupEnsName(address?: string, provider?: providers.Provider): Promise<string | undefined> {
  if (!provider || !address) return undefined
  try {
    return await provider.lookupAddress(address) ?? undefined
  } catch {
    return undefined
  }
}
