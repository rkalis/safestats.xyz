import '../styles/globals.css'
import { NextSeo } from 'next-seo';
import type { AppProps } from 'next/app'
import { EthereumProvider } from '../utils/hooks/useEthereum'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextSeo
        title="SafeStats.xyz - Get insight into your Gnosis Safe"
        description="Get insight into your Gnosis Safe by seeing the participation of your signers."
        canonical="https://safestats.xyz/"
        openGraph={{
          url: "https://safestats.xyz/",
          images: [{
            url: "https://og-image.vercel.app/SafeStats.**xyz**.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg&widths=",
            width: 1600,
            height: 900,
          }],
          site_name: "SafeStats.xyz",
          type: "website",
        }}
        twitter={{
          site: "@RoscoKalis",
          cardType: "summary_large_image",
        }}
        additionalLinkTags={[
          {
            rel: 'icon',
            type: 'image/x-icon',
            href: '/favicon.ico',
          },
        ]}
      />
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
    </>
  )
}

export default MyApp
