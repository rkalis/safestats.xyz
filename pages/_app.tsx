import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { EthereumProvider } from '../utils/hooks/useEthereum'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EthereumProvider>
      <Component {...pageProps} />
    </EthereumProvider>
  )
}

export default MyApp
