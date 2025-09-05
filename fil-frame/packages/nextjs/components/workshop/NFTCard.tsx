"use client";

import { useState } from "react";
import { useDownloadPiece } from "@/hooks/synapse/useDownloadPiece";
import type { NFTTokenDetails } from "@/hooks/workshop/useAllNFTs";
import { useNFTFile } from "@/hooks/workshop/useNFTFile";
import { useAccount } from "wagmi";

interface NFTCardProps {
  nft: NFTTokenDetails;
  showOwnerInfo?: boolean;
}

export const NFTCard = ({ nft, showOwnerInfo = true }: NFTCardProps) => {
  const { address } = useAccount();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Generate filename for the NFT
  const filename = `nft-${nft.tokenId}-${nft.tokenPieceCid.substring(0, 8)}`;

  // Hook for downloading the file
  const { downloadMutation } = useDownloadPiece(nft.tokenPieceCid, filename);

  // Hook for fetching and rendering the NFT file
  const {
    imageUrl,
    isLoading: fileLoading,
    error: fileError,
    fileSize,
    fileType,
  } = useNFTFile(nft.tokenPieceCid, filename);

  const isOwner = nft.owner?.toLowerCase() === address?.toLowerCase();

  const handleDownload = async () => {
    if (!nft.tokenPieceCid) return;

    setDownloadError(null);
    try {
      await downloadMutation.mutateAsync();
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(error instanceof Error ? error.message : "Failed to download NFT file");
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <div className="bg-base-200 rounded-xl overflow-hidden">
      {/* NFT Image Display */}
      <div className="relative w-64 h-64 bg-base-300 flex items-center justify-center rounded-xl">
        {fileLoading && (
          <div className="flex flex-col items-center space-y-3">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="text-sm text-base-content/70">Loading NFT...</span>
          </div>
        )}

        {fileError && (
          <div className="flex flex-col items-center space-y-3 text-center p-4">
            <svg className="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-error">Failed to load NFT</p>
              <p className="text-xs text-base-content/50">{fileError}</p>
            </div>
          </div>
        )}

        {imageUrl && !fileLoading && (
          <img
            src={imageUrl}
            alt={`NFT #${nft.tokenId}`}
            className="w-full h-full object-contain"
            onError={() => {
              // If image fails to load, show a placeholder
            }}
          />
        )}

        {!imageUrl && !fileLoading && !fileError && fileType && (
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Non-image file</p>
              <p className="text-xs text-base-content/50">{fileType}</p>
              {fileSize && <p className="text-xs text-base-content/50">{(fileSize / 1024).toFixed(2)} KB</p>}
            </div>
          </div>
        )}

        {/* NFT Badge */}
        <div className="absolute top-4 left-4">
          <div className="badge badge-primary badge-lg font-bold">#{nft.tokenId}</div>
        </div>

        {/* Owner Badge */}
        {isOwner && (
          <div className="absolute top-4 right-4">
            <div className="badge badge-success badge-sm">👑 Owned</div>
          </div>
        )}
      </div>

      {/* NFT Info Panel */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-lg">NFT #{nft.tokenId}</h5>
          <span className="badge badge-success">🌍 Public</span>
        </div>

        {/* File Information */}
        <div className="bg-base-100 p-3 rounded-lg space-y-2">
          <h6 className="font-medium text-sm flex items-center">
            📁 File Information
            {fileLoading && <div className="loading loading-spinner loading-sm ml-2"></div>}
          </h6>

          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-base-content/70">CID:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-base-200 px-2 py-1 rounded text-xs max-w-32 truncate">{nft.tokenPieceCid}</code>
                <button
                  onClick={() => handleCopyToClipboard(nft.tokenPieceCid)}
                  className="btn btn-ghost btn-xs"
                  title="Copy CID"
                >
                  📋
                </button>
              </div>
            </div>

            {fileType && (
              <div className="flex items-center justify-between">
                <span className="text-base-content/70">Type:</span>
                <code className="bg-base-200 px-2 py-1 rounded text-xs">{fileType}</code>
              </div>
            )}

            {fileSize && (
              <div className="flex items-center justify-between">
                <span className="text-base-content/70">Size:</span>
                <code className="bg-base-200 px-2 py-1 rounded text-xs">{(fileSize / 1024).toFixed(2)} KB</code>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-base-content/70">Contract:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-base-200 px-2 py-1 rounded text-xs max-w-32 truncate">{nft.contractAddress}</code>
                <button
                  onClick={() => handleCopyToClipboard(nft.contractAddress)}
                  className="btn btn-ghost btn-xs"
                  title="Copy Contract Address"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        {showOwnerInfo && nft.owner && (
          <div className="bg-base-100 p-3 rounded-lg">
            <h6 className="font-medium text-sm mb-2">👤 Owner</h6>
            <div className="flex items-center justify-between">
              <code className="bg-base-200 px-2 py-1 rounded text-xs break-all max-w-48 truncate">{nft.owner}</code>
              <button
                onClick={() => handleCopyToClipboard(nft.owner ?? "")}
                className="btn btn-ghost btn-xs"
                title="Copy Owner Address"
              >
                📋
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {downloadError && (
          <div className="alert alert-error alert-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-4 w-4"
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
            <span className="text-xs">{downloadError}</span>
            <button onClick={() => setDownloadError(null)} className="btn btn-ghost btn-xs">
              ✕
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleDownload}
            disabled={downloadMutation.isPending || !nft.tokenPieceCid}
            className="btn btn-primary btn-sm flex-1"
          >
            {downloadMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Downloading...
              </>
            ) : (
              <>💾 Download</>
            )}
          </button>

          <button
            onClick={() => handleCopyToClipboard(nft.tokenPieceCid)}
            className="btn btn-outline btn-sm"
            title="Copy CID"
          >
            📋
          </button>
        </div>
      </div>
    </div>
  );
};
