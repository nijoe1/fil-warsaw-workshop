/**
 * @fileoverview Comprehensive TypeScript type definitions for the Filecoin CTF Workshop
 *
 * This file implements React TypeScript best practices for educational purposes:
 * - Comprehensive JSDoc documentation for learning
 * - Generic type constraints for reusability
 * - Discriminated unions for complex state management
 * - Readonly modifiers for immutable data structures
 * - Error boundary patterns with educational messages
 * - Performance-optimized type definitions
 *
 * @educational_purpose Each type serves as an example of professional TypeScript patterns
 * @author Filecoin Workshop Team
 * @version 1.0.0
 */

// =============================================================================
// CHALLENGE SYSTEM TYPES
// =============================================================================

/**
 * Enumeration of all CTF challenges in the workshop
 *
 * @educational_note Using string enums for better debugging and serialization
 * @pattern String enums provide type safety while remaining serializable to JSON
 */
export enum ChallengeType {
  TREASURY_MASTER = "TREASURY_MASTER",
  STORAGE_SENTINEL = "STORAGE_SENTINEL",
  DATA_GUARDIAN = "DATA_GUARDIAN",
  NFT_ARCHITECT = "NFT_ARCHITECT",
  DECRYPTION_EXPERT = "DECRYPTION_EXPERT",
}

/**
 * Challenge difficulty levels for progressive learning
 *
 * @educational_note Numeric enums for natural ordering and comparison
 * @pattern Use numeric enums when order and comparison operations are needed
 */
export enum ChallengeDifficulty {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
  EXPERT = 4,
}

/**
 * Union type for challenge completion status
 *
 * @educational_note Discriminated union pattern for type-safe state management
 * @pattern Each status includes additional contextual data for better UX
 */
export type ChallengeStatus =
  | { readonly status: "not_started"; readonly reason?: never }
  | { readonly status: "in_progress"; readonly startedAt: number }
  | { readonly status: "completed"; readonly completedAt: number; readonly transactionHash: string }
  | { readonly status: "failed"; readonly reason: string; readonly lastAttemptAt: number }
  | {
      readonly status: "locked";
      readonly reason: "prerequisite_required";
      readonly prerequisiteChallenge: ChallengeType;
    };

/**
 * Comprehensive challenge metadata interface
 *
 * @educational_note Demonstrates proper interface design with optional properties
 * @pattern Generic constraint allows for extensible challenge-specific data
 */
export interface Challenge<TData extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique challenge identifier */
  readonly id: ChallengeType;

  /** Human-readable challenge number for UI display */
  readonly number: number;

  /** Challenge title shown to participants */
  readonly title: string;

  /** Detailed challenge description with learning objectives */
  readonly description: string;

  /** Challenge difficulty level */
  readonly difficulty: ChallengeDifficulty;

  /** Challenge completion status with contextual data */
  readonly status: ChallengeStatus;

  /** Required challenges that must be completed first */
  readonly prerequisites: readonly ChallengeType[];

  /** Next recommended challenge after completion */
  readonly nextChallenge?: ChallengeType;

  /** Navigation path for the challenge */
  readonly path: string;

  /** Challenge-specific data (generic for extensibility) */
  readonly data?: TData;

  /** Learning objectives for educational value */
  readonly learningObjectives: readonly string[];

  /** Hints to help participants when stuck */
  readonly hints: readonly string[];

  /** Flag value for CTF submission (only present when completed) */
  readonly flag?: string;
}

// =============================================================================
// PROGRESS TRACKING TYPES
// =============================================================================

/**
 * Workshop progress tracking interface
 *
 * @educational_note Immutable design pattern with readonly arrays
 * @pattern Version field enables data migration in future workshop updates
 */
export interface WorkshopProgress {
  /** List of completed challenge IDs */
  readonly completedChallenges: readonly ChallengeType[];

  /** Timestamp of last progress update */
  readonly lastUpdated: number;

  /** Progress tracking version for data migration */
  readonly version: number;

  /** Optional participant identifier */
  readonly participantId?: string;

  /** Start time of workshop session */
  readonly sessionStarted: number;

  /** Total time spent in workshop (milliseconds) */
  readonly timeSpent: number;
}

/**
 * Challenge attempt tracking for analytics
 *
 * @educational_note Comprehensive error tracking for learning analytics
 */
export interface ChallengeAttempt {
  /** Challenge that was attempted */
  readonly challengeId: ChallengeType;

  /** Timestamp of the attempt */
  readonly timestamp: number;

  /** Whether the attempt was successful */
  readonly success: boolean;

  /** Error message if attempt failed */
  readonly error?: string;

  /** Time taken for the attempt (milliseconds) */
  readonly duration: number;

  /** Transaction hash if blockchain transaction was involved */
  readonly transactionHash?: string;

  /** Additional attempt metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Flag validation result type
 *
 * @educational_note Discriminated union for type-safe validation results
 */
export type FlagValidationResult =
  | { readonly valid: true; readonly challengeId: ChallengeType; readonly points: number }
  | { readonly valid: false; readonly error: string; readonly hint?: string };

// =============================================================================
// FILECOIN & STORAGE TYPES
// =============================================================================

/**
 * Filecoin storage metrics interface
 *
 * @educational_note BigInt usage for precise blockchain arithmetic
 * @pattern Separate raw values from formatted display values
 */
export interface StorageMetrics {
  /** Current storage usage in bytes (BigInt for precision) */
  readonly currentStorageBytes: bigint;

  /** Current storage usage in GB (number for display) */
  readonly currentStorageGB: number;

  /** Required storage allowance */
  readonly storageAllowanceNeeded: bigint;

  /** Current storage allowance */
  readonly currentStorageAllowance: bigint;

  /** Whether storage allowance is sufficient */
  readonly isSufficient: boolean;

  /** Days remaining until storage expires */
  readonly daysRemaining: number;

  /** Cost per TB per month */
  readonly costPerTBMonth: bigint;
}

/**
 * Payment parameters for Filecoin storage
 *
 * @educational_note Demonstrates proper naming for blockchain payment flows
 */
export interface PaymentParameters {
  /** Security deposit locked for storage duration */
  readonly lockupAllowance: bigint;

  /** Cost per Filecoin epoch (30 seconds) */
  readonly epochRateAllowance: bigint;

  /** Immediate payment for storage services */
  readonly depositAmount: bigint;

  /** USDFC token amount for storage */
  readonly totalAmount: bigint;
}

/**
 * File storage status enumeration
 *
 * @educational_note Progressive status updates for user feedback
 */
export enum FileStorageStatus {
  IDLE = "idle",
  UPLOADING = "uploading",
  PROCESSING = "processing",
  ENCRYPTING = "encrypting",
  STORING = "storing",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * File storage operation result
 *
 * @educational_note Generic interface for different file operations
 */
export interface FileStorageResult<TMetadata extends Record<string, unknown> = Record<string, unknown>> {
  /** Whether the operation was successful */
  readonly success: boolean;

  /** File CID if storage was successful */
  readonly cid?: string;

  /** Transaction hash for blockchain operations */
  readonly transactionHash?: string;

  /** Storage operation status */
  readonly status: FileStorageStatus;

  /** Error message if operation failed */
  readonly error?: string;

  /** Operation-specific metadata */
  readonly metadata?: TMetadata;

  /** File size in bytes */
  readonly fileSize?: number;

  /** Storage cost breakdown */
  readonly cost?: PaymentParameters;
}

// =============================================================================
// NFT & ENCRYPTION TYPES
// =============================================================================

/**
 * NFT metadata following ERC-721 standard
 *
 * @educational_note Standard-compliant metadata interface
 * @pattern Extends base metadata with workshop-specific fields
 */
export interface NFTMetadata {
  /** NFT name */
  readonly name: string;

  /** NFT description */
  readonly description: string;

  /** NFT image URI */
  readonly image: string;

  /** Additional NFT attributes */
  readonly attributes: readonly NFTAttribute[];

  /** External URL for more information */
  readonly external_url?: string;

  /** Animation or video URL */
  readonly animation_url?: string;

  /** Background color (hex without #) */
  readonly background_color?: string;
}

/**
 * NFT attribute interface
 *
 * @educational_note OpenSea-compatible attribute structure
 */
export interface NFTAttribute {
  /** Attribute name/type */
  readonly trait_type: string;

  /** Attribute value */
  readonly value: string | number;

  /** Display type for special formatting */
  readonly display_type?: "boost_number" | "boost_percentage" | "number" | "date";

  /** Maximum value for percentage display */
  readonly max_value?: number;
}

/**
 * Encrypted NFT data structure
 *
 * @educational_note Combines NFT standards with Lit Protocol encryption
 */
export interface EncryptedNFTData {
  /** Standard NFT metadata */
  readonly metadata: NFTMetadata;

  /** Encrypted file CID */
  readonly encryptedCid: string;

  /** Lit Protocol access control conditions */
  readonly accessControlConditions: readonly unknown[];

  /** Encrypted symmetric key */
  readonly encryptedSymmetricKey: string;

  /** Challenge this NFT was minted for */
  readonly challengeId: ChallengeType;

  /** Participant who minted this NFT */
  readonly minter: string;

  /** Minting timestamp */
  readonly mintedAt: number;
}

/**
 * NFT viewing/interaction state
 *
 * @educational_note Component state management with loading patterns
 */
export interface NFTViewState {
  /** Whether NFT data is being loaded */
  readonly isLoading: boolean;

  /** Whether decryption is in progress */
  readonly isDecrypting: boolean;

  /** Whether the current user can decrypt this NFT */
  readonly canDecrypt: boolean;

  /** Decrypted file data (only available after successful decryption) */
  readonly decryptedData?: {
    readonly fileBuffer: ArrayBuffer;
    readonly fileName: string;
    readonly fileType: string;
  };

  /** Error message if loading/decryption failed */
  readonly error?: string;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Base props interface for workshop components
 *
 * @educational_note Common props pattern for consistent component design
 * @pattern Generic className and children props for flexibility
 */
export interface BaseWorkshopProps {
  /** CSS classes for styling */
  readonly className?: string;

  /** Child components */
  readonly children?: React.ReactNode;

  /** Test ID for automated testing */
  readonly "data-testid"?: string;
}

/**
 * Challenge success component props
 *
 * @educational_note Extends base props with challenge-specific data
 */
export interface ChallengeSuccessProps extends BaseWorkshopProps {
  /** Challenge that was completed */
  readonly challenge: Challenge;

  /** Success message to display */
  readonly message: string;

  /** Transaction hash from successful completion */
  readonly transactionHash?: string;

  /** Additional information to display */
  readonly additionalInfo?: React.ReactNode;

  /** Callback when user wants to try again */
  readonly onRetry?: () => void;

  /** Callback when user proceeds to next challenge */
  readonly onNext?: () => void;
}

/**
 * Workshop navigator props
 *
 * @educational_note Navigation component with progress tracking
 */
export interface WorkshopNavigatorProps extends BaseWorkshopProps {
  /** Current challenge being viewed */
  readonly currentChallenge: ChallengeType;

  /** All available challenges */
  readonly challenges: readonly Challenge[];

  /** Workshop progress data */
  readonly progress: WorkshopProgress;

  /** Callback when challenge is selected */
  readonly onChallengeSelect: (challengeId: ChallengeType) => void;

  /** Whether navigation is disabled (during active challenge) */
  readonly disabled?: boolean;
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

/**
 * Challenge verification hook return type
 *
 * @educational_note Comprehensive hook interface with loading states
 * @pattern Includes both data and action methods
 */
export interface UseChallengeVerification {
  /** Current workshop progress */
  readonly progress: WorkshopProgress;

  /** Whether progress is being loaded */
  readonly isLoading: boolean;

  /** Whether progress is being saved */
  readonly isSaving: boolean;

  /** Validate a challenge flag */
  readonly validateFlag: (challengeId: ChallengeType, flag: string) => Promise<FlagValidationResult>;

  /** Mark a challenge as completed */
  readonly completeChallenge: (challengeId: ChallengeType, transactionHash?: string) => Promise<void>;

  /** Reset workshop progress (for testing) */
  readonly resetProgress: () => Promise<void>;

  /** Get challenge completion status */
  readonly getChallengeStatus: (challengeId: ChallengeType) => ChallengeStatus;

  /** Check if a challenge is unlocked */
  readonly isChallengeUnlocked: (challengeId: ChallengeType) => boolean;

  /** Record a challenge attempt for analytics */
  readonly recordAttempt: (attempt: Omit<ChallengeAttempt, "timestamp">) => void;
}

/**
 * Workshop context value type
 *
 * @educational_note Global state management pattern
 */
export interface WorkshopContextValue {
  /** Current workshop state */
  readonly state: WorkshopState;

  /** Workshop action dispatcher */
  readonly dispatch: React.Dispatch<WorkshopAction>;

  /** Available challenges */
  readonly challenges: readonly Challenge[];

  /** Current active challenge */
  readonly currentChallenge?: Challenge;

  /** Workshop utilities */
  readonly utils: {
    readonly navigateToChallenge: (challengeId: ChallengeType) => void;
    readonly formatStorageSize: (bytes: bigint) => string;
    readonly formatCurrency: (amount: bigint, decimals?: number) => string;
    readonly formatDuration: (milliseconds: number) => string;
  };
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

/**
 * Workshop global state
 *
 * @educational_note Central state management with React useReducer pattern
 */
export interface WorkshopState {
  /** Workshop progress data */
  readonly progress: WorkshopProgress;

  /** Available challenges */
  readonly challenges: readonly Challenge[];

  /** Current active challenge */
  readonly currentChallenge?: ChallengeType;

  /** UI state */
  readonly ui: {
    readonly isLoading: boolean;
    readonly isSaving: boolean;
    readonly error?: string;
    readonly theme: "light" | "dark" | "system";
  };

  /** Challenge attempts for analytics */
  readonly attempts: readonly ChallengeAttempt[];
}

/**
 * Workshop action types for state management
 *
 * @educational_note Discriminated union pattern for type-safe action handling
 */
export type WorkshopAction =
  | { readonly type: "LOAD_PROGRESS"; readonly progress: WorkshopProgress }
  | { readonly type: "UPDATE_CHALLENGE_STATUS"; readonly challengeId: ChallengeType; readonly status: ChallengeStatus }
  | { readonly type: "NAVIGATE_TO_CHALLENGE"; readonly challengeId: ChallengeType }
  | { readonly type: "RECORD_ATTEMPT"; readonly attempt: ChallengeAttempt }
  | { readonly type: "SET_LOADING"; readonly isLoading: boolean }
  | { readonly type: "SET_ERROR"; readonly error: string | undefined }
  | { readonly type: "RESET_PROGRESS" }
  | { readonly type: "SET_THEME"; readonly theme: "light" | "dark" | "system" };

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Workshop-specific error types
 *
 * @educational_note Typed error handling for better debugging
 */
export class WorkshopError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly challengeId?: ChallengeType,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "WorkshopError";
  }
}

/**
 * Error boundary state interface
 *
 * @educational_note Error boundary pattern with educational messaging
 */
export interface ErrorBoundaryState {
  /** Whether an error has occurred */
  readonly hasError: boolean;

  /** Error information */
  readonly error?: Error;

  /** Error metadata */
  readonly errorInfo?: React.ErrorInfo;

  /** Challenge context when error occurred */
  readonly challengeContext?: ChallengeType;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Type guard for checking if value is defined
 *
 * @educational_note Utility type for null/undefined checks
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Extract component props type
 *
 * @educational_note Advanced TypeScript utility for component introspection
 */
export type ComponentPropsWithoutRef<T extends keyof JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T>;

/**
 * Make all properties of T optional recursively
 *
 * @educational_note Advanced mapped type for deep partial conversion
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties of T required recursively
 *
 * @educational_note Opposite of DeepPartial for ensuring complete data
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Workshop configuration constants
 *
 * @educational_note Centralized configuration with proper typing
 */
export const WORKSHOP_CONFIG = {
  /** Total number of challenges */
  TOTAL_CHALLENGES: 5,

  /** Local storage key for progress */
  PROGRESS_STORAGE_KEY: "fil-workshop-progress",

  /** Progress data version for migration */
  PROGRESS_VERSION: 1,

  /** Maximum attempts per challenge */
  MAX_ATTEMPTS: 10,

  /** Session timeout in milliseconds */
  SESSION_TIMEOUT: 3600000, // 1 hour

  /** Default theme */
  DEFAULT_THEME: "system" as const,

  /** Filecoin block explorer base URL */
  BLOCK_EXPLORER_URL: "https://calibration.filfox.info/en/message/",
} as const;

/**
 * Workshop challenge definitions
 *
 * @educational_note Comprehensive challenge metadata
 */
export const WORKSHOP_CHALLENGES: readonly Challenge[] = [
  {
    id: ChallengeType.TREASURY_MASTER,
    number: 1,
    title: "Treasury Master",
    description: "Learn USDFC payment processing for Filecoin storage",
    difficulty: ChallengeDifficulty.BEGINNER,
    status: { status: "not_started" },
    prerequisites: [],
    nextChallenge: ChallengeType.STORAGE_SENTINEL,
    path: "/synapse",
    learningObjectives: [
      "Understand ERC20 token approval patterns",
      "Learn blockchain transaction lifecycle",
      "Master async error handling in React hooks",
    ],
    hints: [
      "Check the solution file for guidance",
      "Study the Synapse SDK documentation",
      "Remember BigInt arithmetic for precision",
    ],
  },
  {
    id: ChallengeType.STORAGE_SENTINEL,
    number: 2,
    title: "Storage Sentinel",
    description: "Master decentralized file storage with Filecoin",
    difficulty: ChallengeDifficulty.INTERMEDIATE,
    status: { status: "locked", reason: "prerequisite_required", prerequisiteChallenge: ChallengeType.TREASURY_MASTER },
    prerequisites: [ChallengeType.TREASURY_MASTER],
    nextChallenge: ChallengeType.DATA_GUARDIAN,
    path: "/synapse",
    learningObjectives: [
      "Implement file upload to IPFS",
      "Understand Filecoin storage deals",
      "Learn data persistence patterns",
    ],
    hints: [
      "Files are uploaded to IPFS first",
      "Storage deals ensure long-term persistence",
      "Check file size limits and formats",
    ],
  },
  {
    id: ChallengeType.DATA_GUARDIAN,
    number: 3,
    title: "Data Guardian",
    description: "Secure datasets with advanced encryption",
    difficulty: ChallengeDifficulty.INTERMEDIATE,
    status: {
      status: "locked",
      reason: "prerequisite_required",
      prerequisiteChallenge: ChallengeType.STORAGE_SENTINEL,
    },
    prerequisites: [ChallengeType.STORAGE_SENTINEL],
    nextChallenge: ChallengeType.NFT_ARCHITECT,
    path: "/synapse",
    learningObjectives: [
      "Implement client-side encryption",
      "Understand key management",
      "Learn secure data practices",
    ],
    hints: ["Encryption happens before upload", "Keys must be managed securely", "Consider access control patterns"],
  },
  {
    id: ChallengeType.NFT_ARCHITECT,
    number: 4,
    title: "NFT Architect",
    description: "Create encrypted NFTs with Lit Protocol",
    difficulty: ChallengeDifficulty.ADVANCED,
    status: { status: "locked", reason: "prerequisite_required", prerequisiteChallenge: ChallengeType.DATA_GUARDIAN },
    prerequisites: [ChallengeType.DATA_GUARDIAN],
    nextChallenge: ChallengeType.DECRYPTION_EXPERT,
    path: "/synapse-nft",
    learningObjectives: [
      "Mint NFTs with encrypted content",
      "Implement access control conditions",
      "Learn NFT metadata standards",
    ],
    hints: [
      "NFTs contain references to encrypted data",
      "Access conditions control who can decrypt",
      "Follow ERC-721 metadata standards",
    ],
  },
  {
    id: ChallengeType.DECRYPTION_EXPERT,
    number: 5,
    title: "Decryption Expert",
    description: "Master NFT decryption and content access",
    difficulty: ChallengeDifficulty.EXPERT,
    status: { status: "locked", reason: "prerequisite_required", prerequisiteChallenge: ChallengeType.NFT_ARCHITECT },
    prerequisites: [ChallengeType.NFT_ARCHITECT],
    path: "/lit-synapse-nft",
    learningObjectives: [
      "Decrypt encrypted NFT content",
      "Verify access control conditions",
      "Complete the workshop journey",
    ],
    hints: [
      "Decryption requires proper authorization",
      "Check access control conditions first",
      "Celebrate your achievement!",
    ],
  },
] as const;
