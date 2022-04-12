import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { EthereumProvider } from '../utils/hooks/useEthereum'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EthereumProvider>
      <div>
        <Component {...pageProps} />
        <div className="p-4 text-center decoration-red-500">
          Created by{' '}
          <a href="https://twitter.com/RoscoKalis" className="underline">
            Rosco Kalis
          </a>{' '}
          (
          <a href="https://github.com/rkalis/safestats.xyz" className="underline">
            Source code
          </a>
          )
        </div>
      </div>
    </EthereumProvider>
  )
}

export default MyApp
