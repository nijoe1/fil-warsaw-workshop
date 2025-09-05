"use client";

import { useState } from "react";
import { config } from "@/config";
import { useEthersSigner } from "@/hooks/synapse/useEthers";
import { getDataset } from "@/utils/synapse/getDataset";
import { preflightCheck } from "@/utils/synapse/preflightCheck";
import { Synapse } from "@filoz/synapse-sdk";
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";

/**
 * Type definition for upload result information
 * @interface UploadedInfo
 * @description Contains metadata about the uploaded file and its storage details
 */
export type UploadedInfo = {
  /** Original filename */
  fileName?: string;
  /** File size in bytes */
  fileSize?: number;
  /** Generated piece CID (Content Identifier) - this is your flag! */
  pieceCid?: string;
  /** Blockchain transaction hash */
  txHash?: string;
};

/**
 * 🎯 CHALLENGE 2: File Guardian - File Upload Implementation
 *
 * @challenge_objective Upload files to the Filecoin network using Synapse SDK
 * @challenge_flag Successfully upload a file and return its piece CID
 * @difficulty Intermediate - Learn distributed storage concepts
 *
 * @fileoverview This hook manages the complete file upload workflow:
 * 1. File preprocessing (convert File to Uint8Array)
 * 2. Synapse SDK initialization with CDN support
 * 3. Dataset resolution or creation on first upload
 * 4. Preflight checks for balance and allowances
 * 5. Storage service creation with progress callbacks
 * 6. File upload with real-time progress tracking
 * 7. Piece addition to dataset with blockchain confirmation
 *
 * @tutorial LEARNING OBJECTIVES:
 * - Understand Filecoin storage workflow and piece generation
 * - Master file processing in browser environments
 * - Learn callback-based progress tracking patterns
 * - Implement complex async workflows with proper error handling
 * - Understand dataset management and provider selection
 *
 * @hint IMPLEMENTATION HINTS:
 * - Solution: /workshop-solutions/hooks/useFileUpload.solution.ts
 * - Study file conversion: File → ArrayBuffer → Uint8Array
 * - Understand the callback pattern for progress tracking
 * - Learn about Filecoin piece generation and CID creation
 *
 * @returns Hook object with upload functionality and comprehensive state tracking
 */
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);

  const signer = useEthersSigner();
  const { address, chainId } = useAccount();
  const mutation = useMutation({
    mutationKey: ["file-upload", address, chainId],
    mutationFn: async (data: File | Uint8Array) => {
      // CHALLENGE_SOLUTION_START - Complete working implementation preserved in /workshop-solutions/
      /*
      WORKING SOLUTION REMOVED FOR CTF CHALLENGE  
      See /workshop-solutions/hooks/useFileUpload.solution.ts for the complete implementation
      */
      // CHALLENGE_SOLUTION_END

      // 🎯 CHALLENGE TODO: Implement file upload workflow
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🎯 Challenge: Implement file upload to Filecoin...");

      // TODO: Step 1 - Validate prerequisites
      if (!signer) throw new Error("Signer not found");
      if (!address) throw new Error("Address not found");
      if (!chainId) throw new Error("Chain ID not found");

      // TODO: Step 2 - Convert file to Uint8Array
      // HINT: Handle both File and Uint8Array inputs
      // For File: arrayBuffer() → new Uint8Array()

      // TODO: Step 3 - Initialize Synapse SDK
      // HINT: await Synapse.create({ signer, disableNonceManager: false, withCDN: config.withCDN })

      // TODO: Step 4 - Check for existing dataset
      // HINT: Use getDataset(synapse, address) and check providerId

      // TODO: Step 5 - Run preflight checks
      // HINT: Use preflightCheck() to validate balance and allowances

      // TODO: Step 6 - Create storage service with callbacks
      // HINT: await synapse.createStorage({ callbacks: { ... } })
      // Set up progress tracking callbacks for dataset creation

      // TODO: Step 7 - Upload file with progress tracking
      // HINT: await storageService.upload(uint8ArrayBytes, { callbacks })
      // Handle onUploadComplete, onPieceAdded, onPieceConfirmed callbacks

      // TODO: Step 8 - Return piece CID as string
      // HINT: piece.toV1().toString() gives you the flag!

      // 🚨 CHALLENGE ERROR: Return placeholder CID for UI compatibility
      return "bafkreiexample123456789abcdefghijk"; // Placeholder piece CID

      // Note: This error would normally be thrown, but we return placeholder data
      // to keep the UI functional while participants implement the challenge
      /* throw new Error(`
        🎯 CHALLENGE 2: File Guardian
        
        ❌ File upload workflow not implemented!
        
        📚 Learning Resources:
        • Solution: /workshop-solutions/hooks/useFileUpload.solution.ts
        • File Processing: File → ArrayBuffer → Uint8Array conversion
        • Synapse SDK: Storage service and upload methods
        • Callbacks: Progress tracking and dataset lifecycle events
        
        🔍 Key Concepts:
        • Piece CID: Content-addressed identifier for your file (this is your flag!)
        • Dataset: Collection of pieces under a storage deal
        • Storage Service: Manages provider selection and upload process
        • Progress Tracking: Real-time feedback via callback functions
        
        💡 Next Steps:
        1. Study the file conversion process in the solution
        2. Understand the callback pattern for progress updates  
        3. Learn about Filecoin piece generation
        4. Implement each step with proper error handling
        5. Test with a small file first
        
        Keep uploading, File Guardian! 📁
      `); */
    },
    onSuccess: () => {
      setStatus("🎉 File successfully stored on Filecoin!");
      setProgress(100);
      return uploadedInfo?.pieceCid as string;
    },
    onError: error => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
      return null;
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
  };

  return {
    uploadFileMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
};
