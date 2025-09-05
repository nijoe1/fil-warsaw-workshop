"use client";

import { useFileUpload } from "./useFileUpload";
import { Lit } from "@/utils/lit";
import { useMutation } from "@tanstack/react-query";
import { Hex } from "viem";
import { config } from "@/config";

const encryptFile = async ({
  file,
  tokenId,
  address,
  chain,
}: {
  file: File;
  tokenId: number;
  address: Hex;
  chain: string;
}) => {
  try {
    const lit = new Lit(chain, tokenId, address);
    const encryptedPayload = JSON.stringify(
      (
        await lit.encryptNFT({
          file,
        })
      ).jsonPayload,
    );
    return encryptedPayload;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const useEncryptedFileUpload = () => {
  const { uploadFileMutation } = useFileUpload();

  return useMutation({
    mutationFn: async ({ file, tokenId }: { file: File; tokenId: number }) => {
      const encryptedPayload = await encryptFile({
        file,
        tokenId: tokenId,
        address: config.ENCRYPTED_NFT_CONTRACT_ADDRESS,
        chain: config.LIT_NETWORK,
      });
      const commp = await uploadFileMutation.mutateAsync(new TextEncoder().encode(encryptedPayload));
      return commp;
    },
  });
};
