"use client";

import { useCallback, useState } from "react";
import { ChallengeSuccess } from "./ChallengeSuccess";
import { UploadProgress } from "./UploadProgress";
import { useFileUpload } from "@/hooks/synapse/useFileUpload";
import { useAccount } from "wagmi";

interface FileUploadProps {
  onSuccess?: (pieceCid: string, transactionHash?: string) => void;
  showSuccess?: boolean;
}

export const FileUpload = ({ onSuccess, showSuccess = true }: FileUploadProps) => {
  const { address } = useAccount();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { uploadFileMutation, progress, uploadedInfo, handleReset, status } = useFileUpload();

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      // Basic file validation
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        alert("File size must be less than 100MB");
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect],
  );

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !address) return;

    try {
      const pieceCid = await uploadFileMutation.mutateAsync(selectedFile);
      if (pieceCid && onSuccess) {
        onSuccess(pieceCid, uploadedInfo?.txHash);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // Handle retry
  const handleRetry = () => {
    handleReset();
    setSelectedFile(null);
  };

  // Show success component if upload completed and showSuccess is true
  if (showSuccess && uploadedInfo?.pieceCid && uploadedInfo?.txHash) {
    return (
      <ChallengeSuccess
        challengeNumber={2}
        title="File Upload Successful! 🚀"
        message="Your file has been successfully uploaded and stored on the Filecoin network!"
        transactionHash={uploadedInfo.txHash}
        additionalInfo={
          <div className="bg-base-100 p-4 rounded-xl">
            <h4 className="font-semibold mb-2">📁 File Details</h4>
            <div className="text-sm space-y-1">
              <div>
                Name: <span className="font-mono">{selectedFile?.name}</span>
              </div>
              <div>
                Size:{" "}
                <span className="font-mono">{selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB</span>
              </div>
              <div>
                Piece CID: <span className="font-mono text-xs break-all">{uploadedInfo.pieceCid}</span>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-primary mb-2">📁 Challenge 2: File Upload</h3>
        <p className="text-base-content/70">Upload your file to the Filecoin network using Synapse</p>
      </div>

      {/* Error Display */}
      {uploadFileMutation?.error && (
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
          <span>{uploadFileMutation.error.message}</span>
        </div>
      )}

      {/* Upload Progress */}
      {uploadFileMutation.isPending && (
        <div className="mb-6">
          <UploadProgress progress={progress} status={status} />
        </div>
      )}

      {/* File Drop Zone */}
      {!selectedFile && !uploadFileMutation.isPending && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/50"
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2">Drop your file here</h4>
          <p className="text-base-content/70 mb-4">or click to browse (max 100MB)</p>
          <input type="file" onChange={handleFileInputChange} className="hidden" id="file-upload" accept="*/*" />
          <label htmlFor="file-upload" className="btn btn-outline btn-primary cursor-pointer">
            Browse Files
          </label>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !uploadFileMutation.isPending && (
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!uploadFileMutation.isPending && selectedFile && (
          <>
            <button onClick={() => setSelectedFile(null)} className="btn btn-outline">
              📁 Choose Different File
            </button>
            <button onClick={handleUpload} disabled={!address} className="btn btn-primary">
              🚀 Upload to Filecoin
            </button>
          </>
        )}

        {uploadFileMutation.isPending && (
          <button
            onClick={() => {
              /* Cancel functionality could be added here */
            }}
            disabled
            className="btn btn-ghost"
          >
            ⏸ Uploading...
          </button>
        )}

        {uploadFileMutation.error && (
          <button onClick={handleRetry} className="btn btn-primary">
            🔄 Try Again
          </button>
        )}
      </div>

      {/* Wallet Connection Notice */}
      {!address && (
        <div className="text-center mt-4">
          <p className="text-base-content/50 text-sm">Connect your wallet to upload files</p>
        </div>
      )}
    </div>
  );
};
