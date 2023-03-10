import { ChainId } from 'eth-chains';

export const ADDRESS_REGEX = /^0x[0-9a-fA-f]{40}$/

export const SUPPORTED_CHAINS = [
  ChainId.EthereumMainnet,
  ChainId.PolygonMainnet,
  ChainId.BinanceSmartChainMainnet,
  ChainId.ArbitrumOne,
  ChainId.AuroraMainnet,
  ChainId['AvalancheC-Chain'],
  ChainId.Optimism,
  // Base Goerli
  ChainId.Goerli,
  // Volta
  ChainId.CeloMainnet,
] as const;
