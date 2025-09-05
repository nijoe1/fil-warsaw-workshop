/**
 * SOLUTION: File Upload Hook - Challenge 2: File Guardian
 * 
 * @fileoverview Complete working implementation of file upload to Filecoin
 * This solution demonstrates the full workflow for uploading files to the
 * Filecoin network using the Synapse SDK with comprehensive progress tracking.
 * 
 * @tutorial LEARNING OBJECTIVES:
 * - Understanding Filecoin storage workflow and piece generation
 * - Working with file processing (File → ArrayBuffer → Uint8Array)
 * - Managing complex asynchronous workflows with callbacks
 * - Implementing progress tracking for user experience
 * - Dataset management and storage provider interaction
 * - Blockchain transaction lifecycle management
 * 
 * @challenge_flag The successful completion returns a piece CID
 * that participants can use as their "flag" for Challenge 2
 */

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
 * @description Contains metadata about the uploaded file
 */
export type UploadedInfo = {
  /** Original filename */
  fileName?: string;
  /** File size in bytes */
  fileSize?: number;
  /** Generated piece CID (Content Identifier) */
  pieceCid?: string;
  /** Blockchain transaction hash */
  txHash?: string;
};

/**
 * Hook to upload a file to the Filecoin network using Synapse SDK
 * 
 * @description This hook demonstrates the complete file upload workflow:
 * 1. File preprocessing (convert to Uint8Array)
 * 2. Synapse SDK initialization with CDN support
 * 3. Dataset resolution or creation
 * 4. Preflight checks for balance and allowances
 * 5. Storage service creation with callback management
 * 6. File upload with progress tracking
 * 7. Piece addition to dataset with blockchain confirmation
 * 
 * @returns Object containing upload mutation, progress tracking, and status
 * 
 * @example
 * const { uploadFileMutation, progress, uploadedInfo, status } = useFileUpload();
 * 
 * // Upload a file
 * const pieceCid = await uploadFileMutation.mutateAsync(selectedFile);
 * console.log('Flag (Piece CID):', pieceCid);
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
      // STEP 1: Validate prerequisites
      if (!signer) throw new Error("Signer not found");
      if (!address) throw new Error("Address not found");
      if (!chainId) throw new Error("Chain ID not found");
      
      // Reset state for new upload
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing file upload to Filecoin...");

      // STEP 2: Convert file to Uint8Array for processing
      let uint8ArrayBytes: Uint8Array;
      if (data instanceof File) {
        // Convert File → ArrayBuffer → Uint8Array
        const arrayBuffer = await data.arrayBuffer();
        uint8ArrayBytes = new Uint8Array(arrayBuffer);
      } else {
        uint8ArrayBytes = data as Uint8Array;
      }

      // STEP 3: Initialize Synapse SDK with configuration
      const synapse = await Synapse.create({
        signer,
        disableNonceManager: false,
        withCDN: config.withCDN, // Enable CDN for faster retrieval
      });

      // STEP 4: Check for existing dataset or prepare for creation
      const { providerId } = await getDataset(synapse, address);
      const datasetExists = !!providerId;
      const includeDatasetCreationFee = !datasetExists;

      // STEP 5: Preflight checks for payment and allowances
      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        data instanceof File ? data : new File([data], "encryptedFile.json"),
        synapse,
        includeDatasetCreationFee,
        setStatus,
        setProgress,
      );

      setStatus("🔗 Setting up storage service and dataset...");
      setProgress(25);

      // STEP 6: Create storage service with comprehensive callback handling
      const storageService = await synapse.createStorage({
        callbacks: {
          onDataSetResolved: info => {
            console.log("Dataset resolved:", info);
            setStatus("🔗 Existing dataset found and resolved");
            setProgress(30);
          },
          onDataSetCreationStarted: (transactionResponse, statusUrl) => {
            console.log("Dataset creation started:", transactionResponse);
            console.log("Dataset creation status URL:", statusUrl);
            setStatus("🏗️ Creating new dataset on blockchain...");
            setProgress(35);
          },
          onDataSetCreationProgress: status => {
            console.log("Dataset creation progress:", status);
            if (status.transactionSuccess) {
              setStatus(`⛓️ Dataset transaction confirmed on chain`);
              setProgress(45);
            }
            if (status.serverConfirmed) {
              setStatus(`🎉 Dataset ready! (${Math.round(status.elapsedMs / 1000)}s)`);
              setProgress(50);
            }
          },
          onProviderSelected: provider => {
            console.log("Storage provider selected:", provider);
            setStatus(`🏪 Storage provider selected`);
          },
        },
      });

      setStatus("📁 Uploading file to storage provider...");
      setProgress(55);
      
      // STEP 7: Upload file with detailed progress tracking
      const { pieceCid } = await storageService.upload(uint8ArrayBytes, {
        onUploadComplete: piece => {
          setStatus(`📊 File uploaded! Signing msg to add pieces to the dataset`);
          setUploadedInfo(prev => ({
            ...prev,
            fileName: data instanceof File ? data.name : "encryptedFile.json",
            fileSize: data instanceof File ? data.size : 0,
            pieceCid: piece.toV1().toString(),
          }));
          setProgress(80);
        },
        onPieceAdded: transactionResponse => {
          setStatus(
            `🔄 Waiting for transaction to be confirmed on chain${
              transactionResponse ? `(txHash: ${transactionResponse.hash})` : ""
            }`,
          );
          if (transactionResponse) {
            console.log("Transaction response:", transactionResponse);
            setUploadedInfo(prev => ({
              ...prev,
              txHash: transactionResponse?.hash,
            }));
          }
        },
        onPieceConfirmed: () => {
          setStatus("🌳 Data pieces added to dataset successfully");
          setProgress(90);
        },
      });

      // STEP 8: Finalize upload information
      setProgress(95);
      setUploadedInfo(prev => ({
        ...prev,
        fileName: data instanceof File ? data.name : "encryptedFile.json",
        fileSize: data instanceof File ? data.size : 0,
        pieceCid: pieceCid.toV1().toString(),
      }));
      
      return pieceCid.toV1().toString() as string;
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

  /**
   * Reset upload state for new upload attempt
   */
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

/**
 * CHALLENGE HINTS FOR PARTICIPANTS:
 * 
 * Beginner Level:
 * - Study the file conversion process: File → ArrayBuffer → Uint8Array
 * - Understand the purpose of progress tracking in user interfaces
 * - Look at how callbacks are used for asynchronous operations
 * 
 * Intermediate Level:
 * - Understand the dataset creation vs resolution flow
 * - Learn about Filecoin piece generation and CID creation
 * - Study the preflight check system for payment validation
 * 
 * Advanced Level:
 * - Why do we use callbacks instead of promises for progress tracking?
 * - What is the significance of CID v1 vs v0?
 * - How does the CDN integration affect file retrieval performance?
 * 
 * COMMON PITFALLS:
 * - Not handling file conversion properly (missing ArrayBuffer step)
 * - Forgetting to reset state between uploads
 * - Not implementing proper error handling for network failures
 * - Missing the preflight payment checks
 * - Incorrect handling of dataset creation fees
 * 
 * KEY CONCEPTS:
 * - Content Addressing: Files are identified by their content hash (CID)
 * - Piece Generation: Files are processed into standardized "pieces" for Filecoin
 * - Dataset Management: Collections of pieces under a single storage deal
 * - Provider Selection: Automatic selection of storage providers based on criteria
 * - Transaction Lifecycle: From upload → piece generation → blockchain confirmation
 */