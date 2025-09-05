"use client";

import { useState } from "react";
import { ChallengeSuccess } from "./ChallengeSuccess";
import { UploadProgress } from "./UploadProgress";
import { useScaffoldWriteContract } from "@/hooks/fil-frame/useScaffoldWriteContract";
import { useEncryptedFileUpload } from "@/hooks/synapse/useEncryptedFileUpload";
import { useAccount } from "wagmi";

interface EncryptedNFTMinterProps {
  onSuccess?: (tokenId: string, pieceCid: string) => void;
  showSuccess?: boolean;
}

export const EncryptedNFTMinter = ({ onSuccess, showSuccess = true }: EncryptedNFTMinterProps) => {
  const { address } = useAccount();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [accessAddresses, setAccessAddresses] = useState<string[]>([""]);
  const [mintType, setMintType] = useState<"public" | "private">("public");
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [pieceCid, setPieceCid] = useState<string | null>(null);
  const {
    mutateAsync: encryptAndUploadFile,
    reset: resetEncryptAndUploadFile,
    isPending: isEncryptingAndUploading,
    error: encryptError,
    isSuccess,
    status: progress,
  } = useEncryptedFileUpload();

  // NFT minting hook
  const {
    writeContractAsync: mintNFT,
    isPending: isMinting,
    error: mintError,
  } = useScaffoldWriteContract("LitEncryptedNFT");

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        alert("File size must be less than 100MB");
        return;
      }
      setSelectedFile(file);
      // Reset previous states
      setPieceCid(null);
      setMintedTokenId(null);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Add access address
  const addAccessAddress = () => {
    setAccessAddresses([...accessAddresses, ""]);
  };

  // Remove access address
  const removeAccessAddress = (index: number) => {
    setAccessAddresses(accessAddresses.filter((_, i) => i !== index));
  };

  // Update access address
  const updateAccessAddress = (index: number, value: string) => {
    const updated = [...accessAddresses];
    updated[index] = value;
    setAccessAddresses(updated);
  };

  // Handle encrypt, upload and mint workflow
  const handleEncryptUploadAndMint = async () => {
    if (!selectedFile || !address) return;

    try {
      const pieceCid = await encryptAndUploadFile({
        file: selectedFile,
        tokenId: 1,
      });

      setPieceCid(pieceCid);

      // Step 3: Mint NFT
      await mintNFT({
        functionName: "mintPrivate",

        args: [pieceCid, accessAddresses],
      });

      // Get the token ID from the transaction (placeholder)
      setMintedTokenId("1"); // Should get actual token ID from contract events

      if (onSuccess) {
        onSuccess("1", pieceCid);
      }
    } catch (err) {
      console.error("Encrypt, upload and mint error:", err);
    } finally {
      resetEncryptAndUploadFile();
    }
  };

  // Handle retry
  const handleRetry = () => {
    resetEncryptAndUploadFile();
    setSelectedFile(null);
    setPieceCid(null);
    setMintedTokenId(null);
  };

  // Show success component if NFT was minted successfully
  if (showSuccess && mintedTokenId && pieceCid) {
    return (
      <ChallengeSuccess
        challengeNumber={5}
        title="Encrypted NFT Created! 🔐"
        message="Your encrypted file has been minted as an NFT with Lit Protocol access control!"
        additionalInfo={
          <div className="space-y-4">
            <div className="bg-base-100 p-4 rounded-xl">
              <h4 className="font-semibold mb-2">🔐 Encrypted NFT Details</h4>
              <div className="text-sm space-y-1">
                <div>
                  Token ID: <span className="font-mono">#{mintedTokenId}</span>
                </div>
                <div>
                  Type:{" "}
                  <span className="badge badge-sm">{mintType === "public" ? "Public Access" : "Private Access"}</span>
                </div>
                <div>
                  Encryption: <span className="badge badge-accent badge-sm">Lit Protocol</span>
                </div>
                <div>
                  Network: <span className="badge badge-success badge-sm">Filecoin Calibration</span>
                </div>
              </div>
            </div>
            <div className="bg-base-100 p-4 rounded-xl">
              <h4 className="font-semibold mb-2">📁 Original File</h4>
              <div className="text-sm space-y-1">
                <div>
                  Name: <span className="font-mono">{selectedFile?.name}</span>
                </div>
                <div>
                  Size:{" "}
                  <span className="font-mono">
                    {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                  </span>
                </div>
                <div>
                  Status: <span className="text-success font-medium">🔒 Encrypted & Stored</span>
                </div>
              </div>
            </div>
            {mintType === "private" && (
              <div className="bg-base-100 p-4 rounded-xl">
                <h4 className="font-semibold mb-2">🔑 Access Control</h4>
                <div className="text-sm space-y-1">
                  {accessAddresses
                    .filter(addr => addr.trim() !== "")
                    .map((addr, index) => (
                      <div key={index}>
                        <span className="font-mono text-xs">{addr}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        }
      />
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">🔐 Challenge 5: Encrypted NFT</h3>
        <p className="text-base-content/70">Encrypt your file with Lit Protocol and mint as an access-controlled NFT</p>
      </div>

      {/* Error Display */}
      {(encryptError || mintError) && (
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
          <span>{encryptError?.message || "An error occurred"}</span>
        </div>
      )}

      {/* Progress Display */}
      {(isEncryptingAndUploading || isMinting) && (
        <div className="mb-6">
          {isEncryptingAndUploading && (
            <div className="bg-base-200 p-6 rounded-xl mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Encrypting File</h4>
                <span className="text-2xl">🔐</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="loading loading-spinner loading-sm"></div>
                <span className="text-sm font-medium">Encrypting with Lit Protocol...</span>
              </div>
            </div>
          )}
          {isEncryptingAndUploading && (
            <UploadProgress progress={isEncryptingAndUploading ? 50 : isSuccess ? 100 : 0} status={progress} />
          )}
          {isMinting && (
            <div className="bg-base-200 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Minting Encrypted NFT</h4>
                <span className="text-2xl">🎨</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="loading loading-spinner loading-sm"></div>
                <span className="text-sm font-medium">Creating your encrypted NFT...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mint Type Selection */}
      {!selectedFile && !isEncryptingAndUploading && !pieceCid && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Choose NFT Access Type</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                mintType === "public" ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/50"
              }`}
              onClick={() => setMintType("public")}
            >
              <h5 className="font-semibold text-primary">🌍 Public Access</h5>
              <p className="text-sm text-base-content/70 mt-1">Anyone can view the decrypted content</p>
            </div>
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                mintType === "private" ? "border-accent bg-accent/5" : "border-base-300 hover:border-accent/50"
              }`}
              onClick={() => setMintType("private")}
            >
              <h5 className="font-semibold text-accent">🔒 Private Access</h5>
              <p className="text-sm text-base-content/70 mt-1">Only specified addresses can decrypt</p>
            </div>
          </div>
        </div>
      )}

      {/* Access Control for Private NFTs */}
      {mintType === "private" && !selectedFile && !isEncryptingAndUploading && (
        <div className="mb-6 bg-base-200 p-4 rounded-xl">
          <h4 className="font-semibold mb-3">🔑 Access Control Addresses</h4>
          <div className="space-y-3">
            {accessAddresses.map((address, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="0x... (wallet address)"
                  value={address}
                  onChange={e => updateAccessAddress(index, e.target.value)}
                  className="input input-bordered flex-1 text-sm"
                />
                {accessAddresses.length > 1 && (
                  <button onClick={() => removeAccessAddress(index)} className="btn btn-ghost btn-sm text-error">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button onClick={addAccessAddress} className="btn btn-outline btn-sm w-full">
              + Add Address
            </button>
          </div>
        </div>
      )}

      {/* File Drop Zone */}
      {!selectedFile && !isEncryptingAndUploading && !pieceCid && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive ? "border-accent bg-accent/5" : "border-base-300 hover:border-accent/50"
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2">Choose file to encrypt</h4>
          <p className="text-base-content/70 mb-4">Upload any file (max 100MB) to create your encrypted NFT</p>
          <input
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            id="encrypted-file-upload"
            accept="*/*"
          />
          <label htmlFor="encrypted-file-upload" className="btn btn-outline btn-accent cursor-pointer">
            Browse Files
          </label>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !isEncryptingAndUploading && !pieceCid && (
        <div className="bg-base-200 p-6 rounded-xl mb-6">
          <h4 className="font-semibold mb-4">📄 Selected File</h4>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-base-content/70">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="btn btn-ghost btn-sm">
              ✕ Remove
            </button>
          </div>
          <div className="bg-base-100 p-3 rounded-lg">
            <div className="text-sm space-y-1">
              <div>
                Access Type: <span className="badge badge-sm">{mintType === "public" ? "Public" : "Private"}</span>
              </div>
              {mintType === "private" && (
                <div>Authorized Addresses: {accessAddresses.filter(addr => addr.trim() !== "").length}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!isEncryptingAndUploading && !isMinting && selectedFile && !pieceCid && (
          <>
            <button onClick={() => setSelectedFile(null)} className="btn btn-outline">
              📁 Choose Different File
            </button>
            <button
              onClick={handleEncryptUploadAndMint}
              disabled={
                !address || (mintType === "private" && accessAddresses.filter(addr => addr.trim() !== "").length === 0)
              }
              className="btn btn-accent"
            >
              🔐 Encrypt & Mint NFT
            </button>
          </>
        )}

        {(encryptError || mintError) && (
          <button onClick={handleRetry} className="btn btn-primary">
            🔄 Try Again
          </button>
        )}
      </div>

      {/* Wallet Connection Notice */}
      {!address && (
        <div className="text-center mt-4">
          <p className="text-base-content/50 text-sm">Connect your wallet to create encrypted NFTs</p>
        </div>
      )}
    </div>
  );
};
