"use client";

import type { NextPage } from "next";
import { NFTMinter } from "~~/components/workshop/NFTMinter";
import { NFTViewer } from "~~/components/workshop/NFTViewer";
import Link from "next/link";

const SynapseNFTPage: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {/* Header */}
      <div className="px-5 mb-12 text-center">
        <h1 className="text-4xl font-bold text-secondary mb-4">NFT Minting with Filecoin Storage</h1>
        <p className="text-lg max-w-3xl mx-auto text-base-content/70">
          Create unique NFTs backed by decentralized Filecoin storage. Complete Challenge 4 of the Filecoin Onchain
          Cloud Workshop!
        </p>

        {/* Navigation Breadcrumb */}
        <div className="breadcrumbs text-sm mt-6">
          <ul>
            <li>
              <Link href="/">Workshop Home</Link>
            </li>
            <li>
              <Link href="/synapse">File Storage</Link>
            </li>
            <li>NFT Minting</li>
          </ul>
        </div>
      </div>

      {/* Main NFT Minter */}
      <div className="w-full max-w-4xl px-4 mb-8">
        <NFTMinter />
      </div>

      {/* Minted NFTs Gallery */}
      <div className="w-full max-w-4xl px-4 mb-16">
        <NFTViewer showTitle={true} showUserOnly={true} />
      </div>

      {/* Information Section */}
      <div className="w-full bg-base-300 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">🎨 What Makes This Special?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-base-100 p-6 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Decentralized Storage</h3>
                <p className="text-sm text-base-content/70">
                  Your NFT metadata is stored on Filecoin, ensuring permanent and censorship-resistant access
                </p>
              </div>

              <div className="bg-base-100 p-6 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Cryptographic Proof</h3>
                <p className="text-sm text-base-content/70">
                  Each file gets a unique Content Identifier (CID) that cryptographically verifies your content
                </p>
              </div>

              <div className="bg-base-100 p-6 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Web3 Native</h3>
                <p className="text-sm text-base-content/70">
                  Built on Filecoin Calibration testnet with seamless wallet integration and gas-efficient transactions
                </p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-base-100 p-6 rounded-xl mb-8">
            <h3 className="font-bold text-lg mb-4 text-center">⚙️ Technical Implementation</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-primary">Smart Contract</h4>
                <ul className="text-sm space-y-1 text-base-content/70">
                  <li>• ERC721 standard NFT contract</li>
                  <li>• Stores Filecoin CID as token URI</li>
                  <li>• Deployed on Filecoin Calibration</li>
                  <li>• Auto-incremented token IDs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-secondary">Storage Process</h4>
                <ul className="text-sm space-y-1 text-base-content/70">
                  <li>• File uploaded via Synapse SDK</li>
                  <li>• Stored across Filecoin network</li>
                  <li>• Generates unique Piece CID</li>
                  <li>• CID becomes NFT metadata</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Progress & Next Steps */}
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num} className={`w-3 h-3 rounded-full ${num <= 4 ? "bg-success" : "bg-base-300"}`} />
              ))}
            </div>
            <p className="text-sm text-base-content/50 mb-4">Challenge 4 of 5 - Almost there!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/synapse" className="btn btn-outline">
                ← Back to File Storage
              </Link>
              <Link href="/lit-synapse-nft" className="btn btn-primary">
                Next: Encrypted NFTs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynapseNFTPage;
