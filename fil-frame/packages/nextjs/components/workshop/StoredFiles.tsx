"use client";

import { useDatasets } from "@/hooks/synapse/useDatasets";
import { useDownloadPiece } from "@/hooks/synapse/useDownloadPiece";
import { DataSet } from "@/types/synapse";
import { DataSetPieceData } from "@filoz/synapse-sdk";
import { useAccount } from "wagmi";

export const StoredFiles = () => {
  const { isConnected } = useAccount();
  const { data, isLoading: isLoadingDatasets } = useDatasets();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg max-h-[900px] overflow-y-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-primary mb-2">📁 Your Storage Datasets</h3>
        <p className="text-base-content/70">View and manage your stored files on the Filecoin network</p>
      </div>

      {isLoadingDatasets ? (
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70 ml-4">Loading datasets...</p>
        </div>
      ) : data && data.datasets && data.datasets.length > 0 ? (
        <div className="space-y-6">
          {data.datasets.map(
            (dataset: DataSet | undefined) =>
              dataset && (
                <div key={dataset.clientDataSetId} className="bg-base-200 rounded-xl p-6 border-2 border-base-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-base-content">📦 Dataset #{dataset.pdpVerifierDataSetId}</h4>
                      <p className="text-sm text-base-content/70 mt-1">
                        Status:{" "}
                        <span className={`font-bold ${dataset.isLive ? "text-success" : "text-error"}`}>
                          {dataset.isLive ? "🟢 Live" : "🔴 Inactive"}
                        </span>
                      </p>
                      <p className="text-sm text-base-content/70 mt-1">
                        With CDN: <span className="font-medium">{dataset.withCDN ? "⚡ Yes ⚡" : "❌ No"}</span>
                      </p>
                      <p className="text-sm text-base-content/70 mt-1">
                        PDP URL:{" "}
                        <span
                          className="cursor-pointer hover:text-primary transition-colors font-mono text-xs bg-base-300 px-2 py-1 rounded"
                          onClick={() => {
                            navigator.clipboard.writeText(dataset.provider?.products.PDP?.data.serviceURL || "");
                            window.alert("PDP URL copied to clipboard");
                          }}
                        >
                          📋 Click to copy
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="stat bg-base-100 rounded-xl p-3">
                        <div className="stat-title text-xs">Commission</div>
                        <div className="stat-value text-sm text-primary">{dataset.commissionBps / 100}%</div>
                      </div>
                      <p className="text-sm text-base-content/70 mt-2">
                        Managed: {dataset.isManaged ? "✅ Yes" : "❌ No"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h5 className="text-lg font-bold text-base-content mb-4">🧩 Piece Details</h5>
                    <div className="bg-base-100 rounded-xl p-4 border border-base-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="stat bg-base-200 rounded-xl p-4">
                          <div className="stat-title">Current Pieces</div>
                          <div className="stat-value text-primary">{dataset.data?.pieces.length}</div>
                          <div className="stat-desc">Files stored</div>
                        </div>
                        <div className="stat bg-base-200 rounded-xl p-4">
                          <div className="stat-title">Next Piece ID</div>
                          <div className="stat-value text-primary">{dataset.nextPieceId}</div>
                          <div className="stat-desc">For new uploads</div>
                        </div>
                      </div>

                      {dataset.data?.pieces && (
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-4">
                            <h6 className="text-lg font-bold text-base-content">📋 Available Pieces</h6>
                            <div className="badge badge-primary badge-outline">
                              Next Challenge: Epoch {dataset.data.nextChallengeEpoch}
                            </div>
                          </div>
                          <div className="space-y-3">
                            {dataset.data.pieces.map(piece => (
                              <PieceDetails key={piece.pieceId} piece={piece} dataset={dataset} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
            <span className="text-4xl">📁</span>
          </div>
          <h3 className="text-xl font-bold text-base-content mb-2">No Datasets Found</h3>
          <p className="text-base-content/70">Upload some files to see your storage datasets here</p>
        </div>
      )}
    </div>
  );
};

/**
 * Component to display a piece and a download button
 */
const PieceDetails = ({ piece, dataset }: { piece: DataSetPieceData; dataset: DataSet }) => {
  const filename = `piece-${piece.pieceCid}.png`;
  const { downloadMutation } = useDownloadPiece(piece.pieceCid.toString(), filename);

  return (
    <div
      key={piece.pieceId.toString()}
      className="flex items-center justify-between p-4 bg-base-200 rounded-xl border-2 border-base-300 hover:border-primary/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🧩</span>
          <p className="text-sm font-bold text-base-content">Piece #{piece.pieceId}</p>
        </div>
        <p className="text-xs text-base-content/70 font-mono bg-base-300 px-2 py-1 rounded truncate">
          {piece.pieceCid.toString()}
        </p>
      </div>
      <button
        onClick={() => downloadMutation.mutate()}
        disabled={downloadMutation.isPending}
        className="btn btn-primary btn-sm ml-4"
      >
        {downloadMutation.isPending && <span className="loading loading-spinner loading-xs"></span>}
        {downloadMutation.isPending ? "📥 Downloading..." : "📥 Download"}
      </button>
    </div>
  );
};
