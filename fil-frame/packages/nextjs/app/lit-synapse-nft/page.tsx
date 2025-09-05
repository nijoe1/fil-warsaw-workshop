"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { EncryptedNFTMinter } from "~~/components/workshop/EncryptedNFTMinter";
import { NFTDecryptor } from "~~/components/workshop/NFTDecryptor";
import Link from "next/link";

const LitSynapseNFTPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"create" | "decrypt">("create");
  const [mintSuccess, setMintSuccess] = useState<{ tokenId: string; pieceCid: string } | null>(null);

  // Handle successful NFT creation
  const handleMintSuccess = (tokenId: string, pieceCid: string) => {
    setMintSuccess({ tokenId, pieceCid });
    // Auto-switch to decrypt tab after success
    setTimeout(() => {
      setActiveTab("decrypt");
    }, 5000);
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {/* Header */}
      <div className="px-5 mb-12 text-center">
        <h1 className="text-4xl font-bold text-accent mb-4">Encrypted NFTs with Lit Protocol</h1>
        <p className="text-lg max-w-3xl mx-auto text-base-content/70">
          Create access-controlled NFTs with encrypted content using Lit Protocol and Filecoin storage. Master the final
          Challenge 5 of the Filecoin Onchain Cloud Workshop!
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
            <li>
              <Link href="/synapse-nft">NFT Minting</Link>
            </li>
            <li>Encrypted NFTs</li>
          </ul>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full max-w-5xl px-4 mb-8">
        <div className="tabs tabs-boxed bg-base-200 p-1">
          <button
            className={`tab tab-lg flex-1 ${activeTab === "create" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            <span className="mr-2">🔐</span>
            Create Encrypted NFT
            <span className="ml-2 badge badge-sm bg-accent/20 text-accent border-accent/30">Step 1</span>
          </button>
          <button
            className={`tab tab-lg flex-1 ${activeTab === "decrypt" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("decrypt")}
          >
            <span className="mr-2">🔓</span>
            Decrypt & View NFTs
            <span className="ml-2 badge badge-sm bg-success/20 text-success border-success/30">Step 2</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-5xl px-4 mb-16">
        {activeTab === "create" && (
          <EncryptedNFTMinter
            onSuccess={handleMintSuccess}
            showSuccess={!mintSuccess} // Don't show default success if we're managing it
          />
        )}

        {activeTab === "decrypt" && <NFTDecryptor />}
      </div>

      {/* Success Banner */}
      {mintSuccess && activeTab === "create" && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <div className="alert alert-success shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Encrypted NFT Created!</h3>
              <div className="text-xs">Token #{mintSuccess.tokenId} ready to decrypt</div>
            </div>
            <button onClick={() => setMintSuccess(null)} className="btn btn-sm btn-ghost">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="w-full bg-base-300 px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">🔐 Advanced Encryption Features</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-base-100 p-6 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Access Control</h3>
                <p className="text-sm text-base-content/70">
                  Define exactly who can decrypt and access your NFT content using wallet addresses or conditions
                </p>
              </div>

              <div className="bg-base-100 p-6 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Lit Protocol</h3>
                <p className="text-sm text-base-content/70">
                  Decentralized encryption using threshold cryptography - no single point of failure
                </p>
              </div>

              <div className="bg-base-100 p-6 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Filecoin Storage</h3>
                <p className="text-sm text-base-content/70">
                  Encrypted content stored permanently on the decentralized Filecoin network
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-base-100 p-8 rounded-xl mb-8">
            <h3 className="text-xl font-bold text-center mb-6">⚡ How Encrypted NFTs Work</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Creation Flow */}
              <div>
                <h4 className="font-semibold mb-4 text-accent text-center">🔐 Creation Process</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">File Encryption</p>
                      <p className="text-sm text-base-content/70">
                        Your file is encrypted using Lit Protocol with your defined access conditions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Filecoin Upload</p>
                      <p className="text-sm text-base-content/70">
                        Encrypted data is uploaded to Filecoin network via Synapse
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">NFT Minting</p>
                      <p className="text-sm text-base-content/70">
                        Smart contract mints NFT with encrypted file CID and access controls
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decryption Flow */}
              <div>
                <h4 className="font-semibold mb-4 text-success text-center">🔓 Decryption Process</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Access Verification</p>
                      <p className="text-sm text-base-content/70">
                        Lit Protocol checks if your wallet address has access permissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">File Retrieval</p>
                      <p className="text-sm text-base-content/70">
                        Encrypted file is downloaded from Filecoin using the NFT&apos;s CID
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Decryption & Access</p>
                      <p className="text-sm text-base-content/70">
                        Original file is decrypted and made available for download
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workshop Completion */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-success/20 to-accent/20 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">🎉 Workshop Completion</h3>
              <div className="flex justify-center items-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="w-4 h-4 rounded-full bg-success animate-pulse" />
                ))}
              </div>
              <p className="text-lg mb-6">Complete Challenge 5 to master the Filecoin Onchain Cloud Workshop!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/synapse-nft" className="btn btn-outline">
                  ← Back to NFT Minting
                </Link>
                <Link href="/" className="btn btn-primary">
                  🏠 Workshop Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitSynapseNFTPage;
