"use client";

import { useState } from "react";
import { FileUpload } from "@/components/workshop/FileUpload";
import { StoredFiles } from "@/components/workshop/StoredFiles";
import type { NextPage } from "next";

export const dynamic = "force-dynamic";

const SynapsePage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "files">("upload");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Handle successful upload
  const handleUploadSuccess = (pieceCid: string) => {
    setUploadSuccess(pieceCid);
    // Auto-switch to files tab to see the uploaded file
    setTimeout(() => {
      setActiveTab("files");
    }, 3000);
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {/* Header */}
      <div className="px-5 mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Filecoin File Storage</h1>
        <p className="text-lg max-w-3xl mx-auto text-base-content/70">
          Upload files to decentralized storage and retrieve them from the Filecoin network. Master Challenges 2 & 3 of
          the Filecoin Onchain Cloud Workshop!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="w-full max-w-4xl px-4 mb-8">
        <div className="tabs tabs-boxed bg-base-200 p-1">
          <button
            className={`tab tab-lg flex-1 ${activeTab === "upload" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <span className="mr-2">📤</span>
            Upload Files
            <span className="ml-2 badge badge-sm">Challenge 2</span>
          </button>
          <button
            className={`tab tab-lg flex-1 ${activeTab === "files" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            <span className="mr-2">📦</span>
            Your Files
            <span className="ml-2 badge badge-sm">Challenge 3</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-4xl px-4 mb-16">
        {activeTab === "upload" && (
          <FileUpload
            onSuccess={handleUploadSuccess}
            showSuccess={!uploadSuccess} // Don't show success if we're managing it here
          />
        )}

        {activeTab === "files" && <StoredFiles />}
      </div>

      {/* Success Banner for Upload */}
      {uploadSuccess && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <div className="alert alert-success shadow-lg">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Upload Successful!</h3>
              <div className="text-xs">File stored on Filecoin</div>
            </div>
            <button onClick={() => setUploadSuccess(null)} className="btn btn-sm btn-ghost">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="w-full bg-base-300 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">💡 How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-base-100 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-primary">Challenge 2: Upload</h3>
                <ol className="text-sm space-y-2 text-left">
                  <li>1. Select a file (max 100MB)</li>
                  <li>2. File is processed and prepared</li>
                  <li>3. Uploaded to Filecoin network</li>
                  <li>4. Receive unique Piece CID</li>
                </ol>
              </div>

              <div className="bg-base-100 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-secondary">Challenge 3: Retrieve</h3>
                <ol className="text-sm space-y-2 text-left">
                  <li>1. Browse your stored files</li>
                  <li>2. View file metadata & CIDs</li>
                  <li>3. Download from Filecoin</li>
                  <li>4. File retrieved to your device</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num} className={`w-3 h-3 rounded-full ${num <= 3 ? "bg-success" : "bg-base-300"}`} />
              ))}
            </div>
            <p className="text-sm text-base-content/50">Complete Challenges 2 & 3 to unlock NFT minting</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynapsePage;
