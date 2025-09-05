"use client";

import { useAccount } from "wagmi";
import { useAllRegularNFTs } from "@/hooks/workshop/useAllNFTs";
import { NFTCard } from "./NFTCard";

interface NFTViewerProps {
  showTitle?: boolean;
  showUserOnly?: boolean;
}

export const NFTViewer = ({ showTitle = true, showUserOnly = false }: NFTViewerProps) => {
  const { address } = useAccount();
  const { nfts, isLoading, error, refetch } = useAllRegularNFTs();

  // Filter NFTs if showUserOnly is true
  const displayNFTs = showUserOnly 
    ? nfts.filter(nft => nft.owner?.toLowerCase() === address?.toLowerCase())
    : nfts;

  const handleRefresh = () => {
    refetch();
  };

  if (!address) {
    return (
      <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
        {showTitle && (
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-primary mb-2">🖼️ NFT Gallery</h3>
            <p className="text-base-content/70">View and download your regular NFTs</p>
          </div>
        )}
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
          <p className="text-base-content/50">Connect your wallet to view NFTs</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
        {showTitle && (
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-primary mb-2">🖼️ NFT Gallery</h3>
            <p className="text-base-content/70">View and download your regular NFTs</p>
          </div>
        )}
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/70">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
      {showTitle && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-primary mb-2">🖼️ NFT Gallery</h3>
          <p className="text-base-content/70">View and download your regular NFTs</p>
        </div>
      )}

      {/* Header with stats and refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-value text-2xl text-primary">{displayNFTs.length}</div>
            <div className="stat-title text-xs">{showUserOnly ? "My NFTs" : "Total NFTs"}</div>
          </div>
          {showUserOnly && nfts.length > displayNFTs.length && (
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-value text-2xl text-base-content/70">{nfts.length}</div>
              <div className="stat-title text-xs">All NFTs</div>
            </div>
          )}
        </div>
        <button 
          onClick={handleRefresh} 
          className="btn btn-outline btn-sm"
          disabled={isLoading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
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
          <span>{error.message}</span>
        </div>
      )}

      {/* No NFTs Found */}
      {displayNFTs.length === 0 && !isLoading && (
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
          <h4 className="text-lg font-semibold mb-2">
            {showUserOnly ? "No NFTs owned" : "No NFTs found"}
          </h4>
          <p className="text-base-content/70">
            {showUserOnly 
              ? "You don't own any regular NFTs yet"
              : "No regular NFTs have been minted yet"
            }
          </p>
        </div>
      )}

      {/* NFTs Grid */}
      {displayNFTs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayNFTs.map((nft) => (
            <NFTCard
              key={`${nft.contractAddress}-${nft.tokenId}`}
              nft={nft}
              showOwnerInfo={!showUserOnly}
            />
          ))}
        </div>
      )}


      {/* Help Section */}
      {displayNFTs.length > 0 && (
        <div className="mt-8 p-4 bg-info/10 rounded-xl">
          <h4 className="font-semibold mb-2 text-info">💡 About Regular NFTs</h4>
          <div className="text-sm space-y-1 text-base-content/70">
            <p>• <strong>Public Access:</strong> All regular NFTs are publicly viewable and downloadable</p>
            <p>• <strong>Filecoin Storage:</strong> Files are stored on the decentralized Filecoin network</p>
            <p>• <strong>Persistent:</strong> Content is preserved through blockchain-based storage deals</p>
          </div>
        </div>
      )}
    </div>
  );
};