"use client";

import { useState } from "react";
import { ChallengeSuccess } from "./ChallengeSuccess";
import { UploadProgress } from "./UploadProgress";
import { useScaffoldWriteContract } from "@/hooks/fil-frame/useScaffoldWriteContract";
import { useFileUpload } from "@/hooks/synapse/useFileUpload";
import { useAccount } from "wagmi";

interface NFTMinterProps {
  showSuccess?: boolean;
}

export const NFTMinter = ({ showSuccess = true }: NFTMinterProps) => {
  const { address } = useAccount();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<boolean>(false);
  const [pieceCid, setPieceCid] = useState<string | null>(null);

  // File upload hook
  const { uploadFileMutation, progress, uploadedInfo, handleReset, status } = useFileUpload();
  const {
    mutateAsync: uploadPieceCid,
    isPending: isUploading,
    error: uploadError,
    isSuccess: isUploadSuccess,
  } = uploadFileMutation;
  const { txHash: uploadTxHash } = uploadedInfo ?? {};

  // NFT minting hook
  const {
    writeContractAsync: mintNFT,
    isPending: isMinting,
    error: mintError,
  } = useScaffoldWriteContract("NFTContract");

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
      setMintedTokenId(false);
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

  // Handle upload and mint workflow
  const handleUploadAndMint = async () => {
    if (!selectedFile || !address) return;

    try {
      // Step 1: Upload file
      const uploadResult = await uploadPieceCid(selectedFile);
      if (!uploadResult) {
        throw new Error("Upload failed: No piece CID received");
      }

      setPieceCid(uploadResult);

      // Step 2: Mint NFT with the piece CID
      const mintResult = await mintNFT({
        functionName: "mint",
        args: [uploadResult],
      });

      // Get the token ID from the transaction (would need to parse events in real implementation)
      // For now, we'll use a simple counter approach
      setMintedTokenId(true); // Placeholder - should get actual token ID from contract events
    } catch (err) {
      console.error("Upload and mint error:", err);
    }
  };

  // Handle retry
  const handleRetry = () => {
    handleReset();
    setSelectedFile(null);
    setPieceCid(null);
    setMintedTokenId(false);
  };

  // Show success component if NFT was minted successfully
  if (showSuccess && mintedTokenId && pieceCid) {
    return (
      <ChallengeSuccess
        challengeNumber={4}
        title="NFT Minted Successfully! 🎨"
        message="Your file has been uploaded to Filecoin and minted as an NFT!"
        transactionHash={uploadTxHash}
        additionalInfo={
          <div className="space-y-4">
            <div className="bg-base-100 p-4 rounded-xl">
              <h4 className="font-semibold mb-2">🎨 NFT Details</h4>
              <div className="text-sm space-y-1">
                <div>
                  Contract: <span className="font-mono text-xs">NFTContract</span>
                </div>
                <div>
                  Network: <span className="badge badge-success badge-sm">Filecoin Calibration</span>
                </div>
              </div>
            </div>
            <div className="bg-base-100 p-4 rounded-xl">
              <h4 className="font-semibold mb-2">📁 Stored File Reference</h4>
              <div className="text-sm space-y-1">
                <div>
                  File: <span className="font-mono">{selectedFile?.name}</span>
                </div>
                <div>
                  Size:{" "}
                  <span className="font-mono">
                    {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                  </span>
                </div>
                <div>
                  Piece CID: <span className="font-mono text-xs break-all">{pieceCid}</span>
                </div>
              </div>
            </div>
          </div>
        }
        nextChallenge="/lit-synapse-nft"
        nextChallengeTitle="Encrypted NFTs"
      />
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-primary mb-2">🎨 Challenge 4: NFT Minting</h3>
        <p className="text-base-content/70">Upload a file to Filecoin and mint it as an NFT</p>
      </div>

      {/* Error Display */}
      {(uploadError || mintError) && (
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
          <span>{(uploadError || mintError || "An error occurred") as string}</span>
        </div>
      )}

      {/* Upload Progress */}
      {(isUploading || isMinting) && (
        <div className="mb-6">
          {isUploading && <UploadProgress progress={progress} status={status ?? ""} />}
          {isMinting && (
            <div className="bg-base-200 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Minting NFT</h4>
                <span className="text-2xl">🎨</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="loading loading-spinner loading-sm"></div>
                <span className="text-sm font-medium">Creating your NFT on the blockchain...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Drop Zone */}
      {!selectedFile && !isUploading && !pieceCid && !isUploadSuccess && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive ? "border-secondary bg-secondary/5" : "border-base-300 hover:border-secondary/50"
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2">Choose file to mint as NFT</h4>
          <p className="text-base-content/70 mb-4">Upload any file (max 100MB) to create your unique NFT</p>
          <input type="file" onChange={handleFileInputChange} className="hidden" id="nft-file-upload" accept="*/*" />
          <label htmlFor="nft-file-upload" className="btn btn-outline btn-primary cursor-pointer">
            Browse Files
          </label>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !isUploading && !pieceCid && !isUploadSuccess && (
        <div className="bg-base-200 p-6 rounded-xl mb-6">
          <h4 className="font-semibold mb-4">📄 Selected File</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-base-content/70">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-xs text-base-content/50">Type: {selectedFile.type || "Unknown"}</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="btn btn-ghost btn-sm">
              ✕ Remove
            </button>
          </div>
        </div>
      )}

      {/* File Uploaded Successfully */}
      {pieceCid && !mintedTokenId && !isUploadSuccess && (
        <div className="bg-success/10 border border-success/20 p-6 rounded-xl mb-6">
          <h4 className="font-semibold mb-4 text-success">✅ File Uploaded Successfully!</h4>
          <div className="text-sm space-y-2">
            <div>
              File: <span className="font-mono">{selectedFile?.name}</span>
            </div>
            <div>
              Piece CID: <span className="font-mono text-xs break-all">{pieceCid}</span>
            </div>
            <div className="text-success font-medium">Ready to mint as NFT!</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!isUploading && !isMinting && selectedFile && !pieceCid && !isUploadSuccess && (
          <>
            <button onClick={() => setSelectedFile(null)} className="btn btn-outline">
              📁 Choose Different File
            </button>
            <button onClick={handleUploadAndMint} disabled={!address} className="btn btn-secondary">
              🚀 Upload & Mint NFT
            </button>
          </>
        )}

        {(uploadError || mintError) && !isUploadSuccess && (
          <button onClick={handleRetry} className="btn btn-primary">
            🔄 Try Again
          </button>
        )}
      </div>

      {/* Workflow Steps */}
      {!pieceCid && !isUploadSuccess && !isUploading && !isMinting && (
        <div className="mt-8 p-4 bg-info/10 rounded-xl">
          <h4 className="font-semibold mb-3 text-info">📋 NFT Creation Process</h4>
          <div className="text-sm space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                1
              </span>
              <span>Upload file to Filecoin network</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-base-300 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Get unique Piece CID (Content Identifier)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-base-300 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Mint NFT with CID as metadata</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-base-300 rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>Receive your unique NFT token!</span>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Notice */}
      {!address && (
        <div className="text-center mt-4">
          <p className="text-base-content/50 text-sm">Connect your wallet to mint NFTs</p>
        </div>
      )}
    </div>
  );
};
