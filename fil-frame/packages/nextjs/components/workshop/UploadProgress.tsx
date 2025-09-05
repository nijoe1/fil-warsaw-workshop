"use client";

interface UploadProgressProps {
  progress: number;
  status: string;
}

export const UploadProgress = ({ progress, status }: UploadProgressProps) => {
  // Determine progress color based on status
  const getProgressColor = () => {
    if (status.toLowerCase().includes("error") || status.toLowerCase().includes("failed")) {
      return "progress-error";
    }
    if (status.toLowerCase().includes("complete") || status.toLowerCase().includes("success")) {
      return "progress-success";
    }
    return "progress-primary";
  };

  // Get appropriate icon based on status
  const getStatusIcon = () => {
    if (status.toLowerCase().includes("initializing")) return "🔄";
    if (status.toLowerCase().includes("checking")) return "🔍";
    if (status.toLowerCase().includes("uploading")) return "📤";
    if (status.toLowerCase().includes("processing")) return "⚙️";
    if (status.toLowerCase().includes("complete") || status.toLowerCase().includes("success")) return "✅";
    if (status.toLowerCase().includes("error") || status.toLowerCase().includes("failed")) return "❌";
    return "⏳";
  };

  return (
    <div className="bg-base-200 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg">Upload Progress</h4>
        <span className="text-2xl">{getStatusIcon()}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <progress className={`progress w-full ${getProgressColor()}`} value={progress} max={100} />
      </div>

      {/* Status Message */}
      <div className="bg-base-100 p-3 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="loading loading-spinner loading-sm"></div>
          <span className="text-sm font-medium">{status}</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-base-content/60">
          <span className={progress >= 10 ? "text-primary font-semibold" : ""}>Initializing</span>
          <span className={progress >= 25 ? "text-primary font-semibold" : ""}>Validating</span>
          <span className={progress >= 50 ? "text-primary font-semibold" : ""}>Uploading</span>
          <span className={progress >= 80 ? "text-primary font-semibold" : ""}>Processing</span>
          <span className={progress >= 100 ? "text-success font-semibold" : ""}>Complete</span>
        </div>
      </div>

      {/* Helpful Tips */}
      {progress < 100 && (
        <div className="mt-4 p-3 bg-info/10 rounded-lg">
          <p className="text-sm text-info">
            💡 <strong>Tip:</strong> Your file is being processed and stored on the Filecoin network. This may take a
            few moments depending on file size and network conditions.
          </p>
        </div>
      )}
    </div>
  );
};
