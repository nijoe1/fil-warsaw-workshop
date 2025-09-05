"use client";

import { useState, useEffect } from "react";
import { useEthersSigner } from "@/hooks/synapse/useEthers";
import { Synapse } from "@filoz/synapse-sdk";
import { useAccount } from "wagmi";
import { config } from "~~/config";

export interface NFTFileData {
  file: File | null;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  fileSize: number | null;
  fileType: string | null;
}

export const useNFTFile = (commp: string, filename: string): NFTFileData => {
  const [fileData, setFileData] = useState<NFTFileData>({
    file: null,
    imageUrl: null,
    isLoading: false,
    error: null,
    fileSize: null,
    fileType: null,
  });

  const signer = useEthersSigner();
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (!commp || !filename || !signer || !address || !chainId) {
      return;
    }

    const fetchFile = async () => {
      setFileData(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Create Synapse instance
        const synapse = await Synapse.create({
          provider: signer.provider,
          withCDN: config.withCDN,
        });

        // Download file
        const uint8ArrayBytes = await synapse.storage.download(commp);
        const file = new File([uint8ArrayBytes as BlobPart], filename);

        const imageUrl = URL.createObjectURL(file);

        setFileData({
          file,
          imageUrl,
          isLoading: false,
          error: null,
          fileSize: file.size,
          fileType: file.type,
        });
      } catch (error) {
        console.error("Error fetching NFT file:", error);
        setFileData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to fetch file",
        }));
      }
    };

    fetchFile();

    // Cleanup function to revoke object URLs
    return () => {
      if (fileData.imageUrl) {
        URL.revokeObjectURL(fileData.imageUrl);
      }
    };
  }, [commp, filename, signer, address, chainId]);

  return fileData;
};
