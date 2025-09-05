/**
 * SOLUTION: NFT Decryptor Component - Challenge 5: Cryptographic Guardian
 * 
 * @fileoverview Complete working implementation of encrypted NFT decryption
 * This solution demonstrates advanced cryptographic concepts using Lit Protocol
 * for access-controlled file decryption with comprehensive user experience.
 * 
 * @tutorial LEARNING OBJECTIVES:
 * - Understanding access-controlled encryption with blockchain identities
 * - Working with Lit Protocol for decentralized key management
 * - Implementing complex UI states for async cryptographic operations
 * - Managing file downloads and browser file handling
 * - Error boundaries and user feedback for cryptographic failures
 * - React state management for multi-step processes
 * 
 * @challenge_flag Successfully decrypting an encrypted NFT file
 * proves mastery of the complete encrypted storage workflow
 */

"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAllEncryptedNFTs, type NFTTokenDetails } from "@/hooks/workshop/useAllNFTs";
import { useDownloadEncryptedFile } from "@/hooks/synapse/useDownloadPiece";

/**
 * NFT Decryptor Component - Advanced Cryptographic Operations
 * 
 * @description This component demonstrates the complete encrypted NFT workflow:
 * 1. Fetch user's encrypted NFTs with access permissions
 * 2. Verify ownership and access rights for decryption
 * 3. Download encrypted file from Filecoin via piece CID
 * 4. Decrypt using Lit Protocol with session signatures
 * 5. Present decrypted file for download to user
 * 6. Handle complex error scenarios and user feedback
 * 
 * @component NFTDecryptor
 * @returns Complete UI for managing encrypted NFT decryption
 */
export const NFTDecryptor = () => {
  // State management for decryption workflow
  const { address } = useAccount();
  const [selectedNFT, setSelectedNFT] = useState<NFTTokenDetails | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState<File | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  // Hooks for data fetching and operations
  const { nfts: encryptedNFTs, isLoading, error: nftError, refetch } = useAllEncryptedNFTs();
  const { mutateAsync: downloadEncryptedFile, error: downloadError } = useDownloadEncryptedFile();

  /**
   * Handle NFT decryption workflow
   * @param nft - The NFT to decrypt
   * @description Complete decryption process with access control verification
   */
  const handleDecrypt = async (nft: NFTTokenDetails) => {
    // STEP 1: Verify user permissions
    const isOwner = nft.owner?.toLowerCase() === address?.toLowerCase();
    if (!address || !nft.hasAccess || !isOwner) {
      setDecryptError("Access denied: You must own this NFT and have decryption permissions");
      return;
    }

    // STEP 2: Initialize decryption process
    setIsDecrypting(true);
    setDecryptError(null);
    setSelectedNFT(nft);

    try {
      // STEP 3: Download encrypted file using piece CID
      console.log(`Starting decryption for NFT #${nft.tokenId}...`);
      console.log(`Piece CID: ${nft.tokenPieceCid}`);
      
      // Download returns decrypted Uint8Array from Lit Protocol
      const decryptedData = await downloadEncryptedFile({ 
        commp: nft.tokenPieceCid 
      }) as unknown as Uint8Array;

      // STEP 4: Create downloadable file from decrypted data
      const file = new File([decryptedData], "decryptedFile.png", {
        type: "image/png", // Default to PNG, could be enhanced with metadata
      });

      console.log(`Successfully decrypted NFT #${nft.tokenId}`);
      console.log(`File size: ${file.size} bytes`);
      
      setDecryptedFile(file);
    } catch (error) {
      console.error("Decryption error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to decrypt NFT. Please check your access permissions.";
      setDecryptError(errorMessage);
    } finally {
      setIsDecrypting(false);
    }
  };

  /**
   * Handle decrypted file download
   * @description Create blob URL and trigger browser download
   */
  const handleDownloadDecrypted = () => {
    if (!decryptedFile) return;

    // Create temporary URL for file download
    const url = URL.createObjectURL(decryptedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = decryptedFile.name;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup: remove element and revoke URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`Downloaded decrypted file: ${decryptedFile.name}`);
  };

  /**
   * Reset component state for new decryption
   */
  const handleReset = () => {
    setSelectedNFT(null);
    setDecryptedFile(null);
    setDecryptError(null);
  };

  /**
   * Refresh NFT data
   */
  const handleRefresh = () => {
    setDecryptError(null);
    refetch();
  };

  // Loading state
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
      {/* Component Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-accent mb-2">🔓 NFT Decryptor</h3>
        <p className="text-base-content/70">Decrypt and view your encrypted NFTs using Lit Protocol</p>
      </div>

      {/* Statistics and Controls */}
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

      {/* Decryption Progress Display */}
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

      {/* Successfully Decrypted File Display */}
      {decryptedFile && selectedNFT && (
        <div className="bg-success/10 border border-success/20 p-6 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-success">✅ Decryption Successful!</h4>
            <button onClick={handleReset} className="btn btn-ghost btn-sm">
              ✕ Close
            </button>
          </div>

          <div className="space-y-4">
            {/* File Information */}
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

            {/* Action Buttons */}
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

      {/* NFT List Interface */}
      {!decryptedFile && (
        <>
          <h4 className="font-semibold mb-4">Your Encrypted NFTs</h4>

          {/* Wallet Not Connected */}
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

          {/* No NFTs Found */}
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

          {/* NFT Grid Display */}
          {address && encryptedNFTs.length > 0 && (
            <div className="space-y-4">
              {encryptedNFTs.map(nft => {
                const isOwner = nft.owner?.toLowerCase() === address?.toLowerCase();
                const canDecrypt = nft.hasAccess && isOwner;

                return (
                  <div key={`${nft.contractAddress}-${nft.tokenId}`} className="bg-base-200 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      {/* NFT Information */}
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
                          
                          {/* Access Status Badges */}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`badge badge-sm ${nft.hasAccess ? "badge-success" : "badge-warning"}`}>
                              {nft.hasAccess ? "🌍 Accessible" : "🔒 Private"}
                            </span>
                            {isOwner && <span className="badge badge-primary badge-sm">👑 Owned</span>}
                            {canDecrypt ? (
                              <span className="badge badge-success badge-sm">✅ Can Decrypt</span>
                            ) : (
                              <span className="badge badge-error badge-sm">🚫 Access Denied</span>
                            )}
                          </div>
                          
                          {/* Technical Details */}
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

                      {/* Action Button */}
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

      {/* Educational Help Section */}
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

/**
 * CHALLENGE HINTS FOR PARTICIPANTS:
 * 
 * Beginner Level:
 * - Study the access control logic: ownership + hasAccess permission
 * - Understand the file download process using blob URLs
 * - Look at React state management for complex UI flows
 * 
 * Intermediate Level:
 * - Learn about Lit Protocol's access control conditions
 * - Understand the relationship between piece CIDs and encrypted files
 * - Study error handling patterns for cryptographic operations
 * 
 * Advanced Level:
 * - How does Lit Protocol manage decryption keys without exposing them?
 * - What are the security implications of client-side decryption?
 * - How does the access condition verification work on-chain?
 * 
 * COMMON PITFALLS:
 * - Not handling access permission checks properly
 * - Missing error states for failed decryption attempts
 * - Forgetting to cleanup blob URLs after download
 * - Not providing proper user feedback during async operations
 * - Missing owner verification before allowing decryption
 * 
 * KEY CONCEPTS:
 * - Access Control Lists (ACLs): Blockchain-based permission systems
 * - Threshold Cryptography: Decentralized key management
 * - Session Signatures: Temporary authentication for operations
 * - Content Addressing: Files identified by cryptographic hash
 * - Client-Side Decryption: Security model and trust assumptions
 * 
 * SECURITY CONSIDERATIONS:
 * - Only NFT owners with proper access can decrypt files
 * - Lit Protocol provides decentralized key escrow
 * - Session signatures prevent unauthorized access
 * - Decrypted content never leaves user's browser
 * - Access conditions are enforced by blockchain consensus
 */