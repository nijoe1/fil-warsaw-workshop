"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { useDeployedContractInfo } from "@/hooks/fil-frame";

export interface NFTTokenDetails {
  tokenId: number;
  tokenPieceCid: string;
  hasAccess: boolean;
  isEncrypted: boolean;
  contractAddress: string;
  owner?: string;
}

export interface AllNFTsResult {
  nfts: NFTTokenDetails[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAllNFTs = (): AllNFTsResult => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: nftContractData } = useDeployedContractInfo("NFTContract");
  const { data: litEncryptedNFTData } = useDeployedContractInfo("LitEncryptedNFT");

  const {
    data: nfts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allNFTs", address, nftContractData?.address, litEncryptedNFTData?.address],
    queryFn: async (): Promise<NFTTokenDetails[]> => {
      if (!publicClient || !address) return [];

      const allNFTs: NFTTokenDetails[] = [];

      // Fetch regular NFTs from NFTContract
      if (nftContractData?.address && nftContractData.abi) {
        try {
          // Get all token URIs from NFTContract
          const tokenURIs = (await publicClient.readContract({
            address: nftContractData.address,
            abi: nftContractData.abi,
            functionName: "getAllTokensDetails",
          })) as string[];

          // Get total supply for proper indexing
          const totalSupply = (await publicClient.readContract({
            address: nftContractData.address,
            abi: nftContractData.abi,
            functionName: "getTotalSupply",
          })) as bigint;

          // Create NFT objects for each token
          for (let i = 0; i < tokenURIs.length && i < Number(totalSupply); i++) {
            // Check ownership
            let owner = undefined;
            try {
              owner = (await publicClient.readContract({
                address: nftContractData.address,
                abi: nftContractData.abi,
                functionName: "ownerOf",
                args: [BigInt(i + 1)], // Tokens are 1-indexed in the contract
              })) as string;
            } catch (error) {
              console.warn(`Failed to get owner for NFT token ${i + 1}:`, error);
            }

            allNFTs.push({
              tokenId: i + 1, // Tokens are 1-indexed
              tokenPieceCid: tokenURIs[i],
              hasAccess: true, // Regular NFTs have open access
              isEncrypted: false,
              contractAddress: nftContractData.address,
              owner,
            });
          }
        } catch (error) {
          console.error("Error fetching regular NFTs:", error);
        }
      }

      // Fetch encrypted NFTs from LitEncryptedNFT
      if (litEncryptedNFTData?.address && litEncryptedNFTData.abi) {
        try {
          // Get all token details for the current account
          const tokenDetails = (await publicClient.readContract({
            address: litEncryptedNFTData.address,
            abi: litEncryptedNFTData.abi,
            functionName: "getAllTokensDetails",
            args: [address],
          })) as Array<{ tokenPieceCid: string; hasAccess: boolean }>;

          // Get total supply for proper indexing
          const totalSupply = (await publicClient.readContract({
            address: litEncryptedNFTData.address,
            abi: litEncryptedNFTData.abi,
            functionName: "getTotalSupply",
          })) as bigint;

          // Create encrypted NFT objects
          for (let i = 0; i < tokenDetails.length && i < Number(totalSupply); i++) {
            // Check ownership
            let owner = undefined;
            try {
              owner = (await publicClient.readContract({
                address: litEncryptedNFTData.address,
                abi: litEncryptedNFTData.abi,
                functionName: "ownerOf",
                args: [BigInt(i + 1)], // Tokens are 1-indexed in the contract
              })) as string;
            } catch (error) {
              console.warn(`Failed to get owner for encrypted NFT token ${i + 1}:`, error);
            }

            allNFTs.push({
              tokenId: i + 1, // Tokens are 1-indexed
              tokenPieceCid: tokenDetails[i].tokenPieceCid,
              hasAccess: tokenDetails[i].hasAccess,
              isEncrypted: true,
              contractAddress: litEncryptedNFTData.address,
              owner,
            });
          }
        } catch (error) {
          console.error("Error fetching encrypted NFTs:", error);
        }
      }

      return allNFTs;
    },
    enabled: !!(publicClient && address && (nftContractData?.address || litEncryptedNFTData?.address)),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  return {
    nfts,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};

export const useAllRegularNFTs = () => {
  const { nfts, isLoading, error, refetch } = useAllNFTs();
  return {
    nfts: nfts.filter(nft => !nft.isEncrypted),
    isLoading,
    error,
    refetch,
  };
};

export const useAllEncryptedNFTs = () => {
  const { nfts, isLoading, error, refetch } = useAllNFTs();
  return {
    nfts: nfts.filter(nft => nft.isEncrypted),
    isLoading,
    error,
    refetch,
  };
};