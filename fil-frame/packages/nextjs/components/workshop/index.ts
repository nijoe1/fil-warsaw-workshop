// Original workshop components
export { ChallengeSuccess, getWorkshopProgress, isChallengeCompleted, getChallengeTransaction } from "./ChallengeSuccess";
export { NFTDecryptor } from "./NFTDecryptor";
export { NFTViewer } from "./NFTViewer";
export { NFTCard } from "./NFTCard";

// Enhanced components with React TypeScript best practices
export { ChallengeSuccessEnhanced } from "./ChallengeSuccessEnhanced";

// Re-export hooks for convenience
export { useFileUploadEnhanced } from "../../hooks/workshop/useFileUploadEnhanced";
export { useDatasetsEnhanced } from "../../hooks/workshop/useDatasetsEnhanced";
export { useChallengeVerification } from "../../hooks/workshop/useChallengeVerification";

// Re-export context for convenience
export { WorkshopProvider, useWorkshopContext, useWorkshopProgress, useCurrentChallenge, useWorkshopUI } from "../../contexts/WorkshopContext";

// Re-export types for convenience
export type {
  Challenge,
  ChallengeType,
  ChallengeStatus,
  WorkshopProgress,
  ChallengeSuccessProps,
  UseChallengeVerification,
  WorkshopContextValue,
  FileStorageResult,
  FileStorageStatus,
  PaymentParameters
} from "../../types/workshop.types";