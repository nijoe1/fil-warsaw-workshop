"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAllEncryptedNFTs, type NFTTokenDetails } from "@/hooks/workshop/useAllNFTs";
import { useDownloadEncryptedFile } from "@/hooks/synapse/useDownloadPiece";

export const NFTDecryptor = () => {
  const { address } = useAccount();
  const [selectedNFT, setSelectedNFT] = useState<NFTTokenDetails | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState<File | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const { nfts: encryptedNFTs, isLoading, error: nftError, refetch } = useAllEncryptedNFTs();

  // Hook for downloading files
  const { mutateAsync: downloadEncryptedFile, error: downloadError } = useDownloadEncryptedFile();

  // Handle NFT decryption
  const handleDecrypt = async (nft: NFTTokenDetails) => {
    const isOwner = nft.owner?.toLowerCase() === address?.toLowerCase();
    if (!address || !nft.hasAccess || !isOwner) return;

    setIsDecrypting(true);
    setDecryptError(null);
    setSelectedNFT(nft);

    try {
      // Step 1: Download the encrypted file
      const file = new File(
        [(await downloadEncryptedFile({ commp: nft.tokenPieceCid })) as unknown as Uint8Array],
        "decryptedFile.png",
      );

      setDecryptedFile(file);
    } catch (error) {
      console.error("Decryption error:", error);
      setDecryptError(error instanceof Error ? error.message : "Failed to decrypt NFT");
    } finally {
      setIsDecrypting(false);
    }
  };

  // Handle file download
  const handleDownloadDecrypted = () => {
    if (!decryptedFile) return;

    const url = URL.createObjectURL(decryptedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = decryptedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset state
  const handleReset = () => {
    setSelectedNFT(null);
    setDecryptedFile(null);
    setDecryptError(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    setDecryptError(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-accent mb-2">🔓 NFT Decryptor</h3>
          <p className="text-base-content/70">Decrypt and view your encrypted NFTs using Lit Protocol</p>
        </div>
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/70">Loading encrypted NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-accent mb-2">🔓 NFT Decryptor</h3>
        <p className="text-base-content/70">Decrypt and view your encrypted NFTs using Lit Protocol</p>
      </div>

      {/* Header with stats and refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="stat bg-base-200 rounded-lg p-3">
          <div className="stat-value text-2xl text-accent">{encryptedNFTs.length}</div>
          <div className="stat-title text-xs">Encrypted NFTs</div>
        </div>
        <button onClick={handleRefresh} className="btn btn-outline btn-sm" disabled={isLoading}>
          🔄 Refresh
        </button>
      </div>

      {/* Error Display */}
      {(decryptError || downloadError || nftError) && (
        <div className="alert alert-error mb-6">
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
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{decryptError || downloadError?.message || nftError?.message}</span>
          <button onClick={() => setDecryptError(null)} className="btn btn-sm btn-ghost ml-auto">
            ✕
          </button>
        </div>
      )}

      {/* Decryption Progress */}
      {isDecrypting && (
        <div className="bg-base-200 p-6 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg">Decrypting NFT #{selectedNFT?.tokenId}</h4>
            <span className="text-2xl">🔓</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="loading loading-spinner loading-sm"></div>
              <span className="text-sm">Checking access permissions...</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="loading loading-spinner loading-sm"></div>
              <span className="text-sm">Decrypting with Lit Protocol...</span>
            </div>
          </div>
        </div>
      )}

      {/* Successfully Decrypted File */}
      {decryptedFile && selectedNFT && (
        <div className="bg-success/10 border border-success/20 p-6 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-success">✅ Decryption Successful!</h4>
            <button onClick={handleReset} className="btn btn-ghost btn-sm">
              ✕ Close
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-base-100 p-4 rounded-lg">
              <h5 className="font-medium mb-2">📁 Decrypted File</h5>
              <div className="text-sm space-y-1">
                <div>
                  Name: <span className="font-mono">{decryptedFile.name}</span>
                </div>
                <div>
                  Size: <span className="font-mono">{(decryptedFile.size / 1024).toFixed(2)} KB</span>
                </div>
                <div>
                  Type: <span className="font-mono">{decryptedFile.type}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleDownloadDecrypted} className="btn btn-success flex-1">
                💾 Download File
              </button>
              <button onClick={handleReset} className="btn btn-outline">
                🔄 Decrypt Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFT List */}
      {!decryptedFile && (
        <>
          <h4 className="font-semibold mb-4">Your Encrypted NFTs</h4>

          {!address && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-base-content/50">Connect your wallet to view your encrypted NFTs</p>
            </div>
          )}

          {address && encryptedNFTs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">No Encrypted NFTs Found</h4>
              <p className="text-base-content/70">Create some encrypted NFTs first to decrypt them here</p>
            </div>
          )}

          {address && encryptedNFTs.length > 0 && (
            <div className="space-y-4">
              {encryptedNFTs.map(nft => {
                const isOwner = nft.owner?.toLowerCase() === address?.toLowerCase();
                const canDecrypt = nft.hasAccess && isOwner;

                return (
                  <div key={`${nft.contractAddress}-${nft.tokenId}`} className="bg-base-200 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium">Encrypted NFT #{nft.tokenId}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`badge badge-sm ${nft.hasAccess ? "badge-success" : "badge-warning"}`}>
                              {nft.hasAccess ? "🌍 Accessible" : "🔒 Private"}
                            </span>
                            {isOwner && <span className="badge badge-primary badge-sm">👑 Owned</span>}
                            {nft.hasAccess && isOwner ? (
                              <span className="badge badge-success badge-sm">✅ Can Decrypt</span>
                            ) : (
                              <span className="badge badge-error badge-sm">🚫 Access Denied</span>
                            )}
                          </div>
                          <div className="text-xs text-base-content/50 mt-1">
                            CID: {nft.tokenPieceCid.substring(0, 20)}...
                          </div>
                          {nft.owner && (
                            <div className="text-xs text-base-content/50 mt-1">
                              Owner: {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleDecrypt(nft)}
                          disabled={!canDecrypt || isDecrypting}
                          className={`btn btn-sm ${canDecrypt ? "btn-accent" : "btn-disabled"}`}
                        >
                          {isDecrypting && selectedNFT?.tokenId === nft.tokenId ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Decrypting...
                            </>
                          ) : canDecrypt ? (
                            <>🔓 Decrypt</>
                          ) : (
                            <>🔒 No Access</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Help Section */}
      {!decryptedFile && address && (
        <div className="mt-8 p-4 bg-info/10 rounded-xl">
          <h4 className="font-semibold mb-2 text-info">💡 How Decryption Works</h4>
          <div className="text-sm space-y-1 text-base-content/70">
            <p>
              • <strong>Access Check:</strong> Lit Protocol verifies your wallet address against NFT access conditions
            </p>
            <p>
              • <strong>Decryption:</strong> If authorized, the encrypted file is decrypted using your session signature
            </p>
            <p>
              • <strong>Download:</strong> The original file is recovered and available for download
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
