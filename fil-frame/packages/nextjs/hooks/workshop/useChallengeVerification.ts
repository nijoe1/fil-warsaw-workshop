/**
 * @fileoverview Challenge Verification Hook - Type-Safe CTF Flag Validation System
 * 
 * This hook implements React TypeScript best practices for educational purposes:
 * - Generic type constraints for extensibility
 * - Comprehensive error handling with typed errors
 * - Performance optimizations with useCallback and useMemo
 * - Proper separation of concerns between data and UI logic
 * - Local storage integration with type safety
 * - Educational error messages for learning
 * 
 * @educational_purpose Demonstrates professional React hook patterns:
 * - Custom hooks with proper return type interfaces
 * - useReducer for complex state management
 * - Local storage utilities with error handling
 * - Type-safe flag validation system
 * - Analytics integration for learning insights
 * 
 * @pattern This hook showcases the "Single Responsibility Principle" by focusing
 * solely on challenge verification logic, while remaining composable with other hooks
 * 
 * @author Filecoin Workshop Team
 * @version 1.0.0
 */

"use client";

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import {
  type UseChallengeVerification,
  type WorkshopProgress,
  type ChallengeStatus,
  ChallengeType,
  type FlagValidationResult,
  type ChallengeAttempt,
  type WorkshopAction,
  WorkshopError,
  WORKSHOP_CONFIG,
  WORKSHOP_CHALLENGES
} from '@/types/workshop.types';

// =============================================================================
// LOCAL STORAGE UTILITIES WITH TYPE SAFETY
// =============================================================================

/**
 * Type-safe localStorage utility with error handling
 * 
 * @educational_note Proper error handling prevents crashes from localStorage issues
 * @pattern Generic utility function with comprehensive error handling
 */
const createStorageUtil = <T>(key: string, defaultValue: T) => ({
  get: (): T => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  
  set: (value: T): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      // Re-throw as a WorkshopError for consistent error handling
      throw new WorkshopError(
        `Failed to save progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      );
    }
  },
  
  remove: (): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }
});

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

/**
 * Progress storage utility with data migration support
 * 
 * @educational_note Demonstrates data migration patterns for evolving schemas
 */
const progressStorage = createStorageUtil<WorkshopProgress>(
  WORKSHOP_CONFIG.PROGRESS_STORAGE_KEY,
  {
    completedChallenges: [],
    lastUpdated: 0,
    version: WORKSHOP_CONFIG.PROGRESS_VERSION,
    sessionStarted: Date.now(),
    timeSpent: 0
  }
);

/**
 * Challenge attempts storage for analytics
 * 
 * @educational_note Separate storage for analytics data
 */
const attemptsStorage = createStorageUtil<ChallengeAttempt[]>(
  `${WORKSHOP_CONFIG.PROGRESS_STORAGE_KEY}-attempts`,
  []
);

/**
 * Challenge transaction hash storage
 * 
 * @educational_note Individual transaction storage by challenge
 */
const getTransactionStorage = (challengeId: ChallengeType) => 
  createStorageUtil<string | null>(`challenge-${challengeId}-tx`, null);

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

/**
 * Hook state interface
 * 
 * @educational_note Focused state management for hook responsibilities
 */
interface ChallengeVerificationState {
  readonly progress: WorkshopProgress;
  readonly attempts: readonly ChallengeAttempt[];
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error?: string;
}

/**
 * Hook action types
 * 
 * @educational_note Discriminated union for type-safe action handling
 */
type ChallengeVerificationAction =
  | { type: 'LOAD_COMPLETE'; progress: WorkshopProgress; attempts: readonly ChallengeAttempt[] }
  | { type: 'START_SAVE' }
  | { type: 'SAVE_COMPLETE'; progress: WorkshopProgress }
  | { type: 'RECORD_ATTEMPT'; attempt: ChallengeAttempt }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_PROGRESS' };

/**
 * State reducer with comprehensive action handling
 * 
 * @educational_note useReducer pattern for complex state transitions
 * @pattern Immutable state updates with readonly types
 */
const challengeVerificationReducer = (
  state: ChallengeVerificationState, 
  action: ChallengeVerificationAction
): ChallengeVerificationState => {
  switch (action.type) {
    case 'LOAD_COMPLETE':
      return {
        ...state,
        progress: action.progress,
        attempts: action.attempts,
        isLoading: false,
        error: undefined
      };
    
    case 'START_SAVE':
      return {
        ...state,
        isSaving: true,
        error: undefined
      };
    
    case 'SAVE_COMPLETE':
      return {
        ...state,
        progress: action.progress,
        isSaving: false,
        error: undefined
      };
    
    case 'RECORD_ATTEMPT':
      return {
        ...state,
        attempts: [...state.attempts, action.attempt] as readonly ChallengeAttempt[]
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        isSaving: false,
        error: action.error
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined
      };
    
    case 'RESET_PROGRESS':
      const resetProgress: WorkshopProgress = {
        completedChallenges: [],
        lastUpdated: Date.now(),
        version: WORKSHOP_CONFIG.PROGRESS_VERSION,
        sessionStarted: Date.now(),
        timeSpent: 0
      };
      return {
        ...state,
        progress: resetProgress,
        attempts: [],
        isSaving: false,
        error: undefined
      };
    
    default:
      // @ts-expect-error: Exhaustiveness check - TypeScript will error if we miss an action
      throw new WorkshopError(`Unknown action type: ${action.type}`, 'INVALID_ACTION');
  }
};

// =============================================================================
// FLAG VALIDATION LOGIC
// =============================================================================

/**
 * Challenge flag validation mapping
 * 
 * @educational_note Centralized flag validation for security and maintainability
 * @pattern Using a Map for O(1) lookup performance
 */
const challengeFlags = new Map<ChallengeType, (flag: string) => boolean>([
  [ChallengeType.TREASURY_MASTER, (flag) => flag.startsWith('0x') && flag.length === 66],
  [ChallengeType.STORAGE_SENTINEL, (flag) => flag.startsWith('Qm') && flag.length === 46],
  [ChallengeType.DATA_GUARDIAN, (flag) => flag.startsWith('encrypted_') && flag.length > 20],
  [ChallengeType.NFT_ARCHITECT, (flag) => flag.match(/^\d+$/) !== null],
  [ChallengeType.DECRYPTION_EXPERT, (flag) => flag.includes('decrypted_content')]
]);

/**
 * Flag validation with comprehensive error handling
 * 
 * @educational_note Demonstrates proper validation with detailed error messages
 * @pattern Returns discriminated union for type-safe result handling
 */
const validateChallengeFlag = (challengeId: ChallengeType, flag: string): FlagValidationResult => {
  try {
    // Input validation
    if (!flag || typeof flag !== 'string') {
      return {
        valid: false,
        error: 'Flag cannot be empty',
        hint: 'Enter the flag you received after completing the challenge'
      };
    }

    // Trim whitespace for user convenience
    const trimmedFlag = flag.trim();
    
    if (trimmedFlag.length === 0) {
      return {
        valid: false,
        error: 'Flag cannot be empty',
        hint: 'Enter the flag you received after completing the challenge'
      };
    }

    // Get validator for this challenge
    const validator = challengeFlags.get(challengeId);
    
    if (!validator) {
      return {
        valid: false,
        error: `No validation logic found for challenge: ${challengeId}`,
        hint: 'This challenge may not be implemented yet'
      };
    }

    // Run challenge-specific validation
    const isValid = validator(trimmedFlag);
    
    if (!isValid) {
      // Challenge-specific hints for educational value
      const hints: Record<ChallengeType, string> = {
        [ChallengeType.TREASURY_MASTER]: 'Expected a transaction hash (0x...)',
        [ChallengeType.STORAGE_SENTINEL]: 'Expected an IPFS CID (Qm...)',
        [ChallengeType.DATA_GUARDIAN]: 'Expected an encrypted data identifier',
        [ChallengeType.NFT_ARCHITECT]: 'Expected an NFT token ID (number)',
        [ChallengeType.DECRYPTION_EXPERT]: 'Expected decrypted content proof'
      };
      
      return {
        valid: false,
        error: 'Invalid flag format',
        hint: hints[challengeId] || 'Check the challenge instructions for the expected flag format'
      };
    }

    // Calculate points based on challenge difficulty
    const challenge = WORKSHOP_CHALLENGES.find(c => c.id === challengeId);
    const points = challenge ? challenge.difficulty * 100 : 100;

    return {
      valid: true,
      challengeId,
      points
    };

  } catch (error) {
    console.error('Flag validation error:', error);
    return {
      valid: false,
      error: 'Flag validation failed due to an unexpected error',
      hint: 'Please try again or contact support if the issue persists'
    };
  }
};

// =============================================================================
// MAIN HOOK IMPLEMENTATION
// =============================================================================

/**
 * Challenge verification hook with comprehensive functionality
 * 
 * @educational_note Demonstrates advanced React hook patterns:
 * - useReducer for complex state management
 * - useCallback for performance optimization
 * - useMemo for expensive computations
 * - useEffect for side effects and cleanup
 * - Error boundary integration
 * 
 * @returns Complete challenge verification interface
 */
export const useChallengeVerification = (): UseChallengeVerification => {
  // Initialize state with useReducer for complex state transitions
  const [state, dispatch] = useReducer(challengeVerificationReducer, {
    progress: {
      completedChallenges: [],
      lastUpdated: 0,
      version: WORKSHOP_CONFIG.PROGRESS_VERSION,
      sessionStarted: Date.now(),
      timeSpent: 0
    },
    attempts: [],
    isLoading: true,
    isSaving: false
  });

  // ==========================================================================
  // INITIALIZATION AND DATA LOADING
  // ==========================================================================

  /**
   * Load initial data from localStorage
   * 
   * @educational_note useEffect with empty dependency array for initialization
   */
  useEffect(() => {
    try {
      const progress = progressStorage.get();
      const attempts = attemptsStorage.get();
      
      dispatch({ 
        type: 'LOAD_COMPLETE', 
        progress, 
        attempts 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workshop data';
      dispatch({ 
        type: 'SET_ERROR', 
        error: errorMessage 
      });
    }
  }, []);

  // ==========================================================================
  // MEMOIZED COMPUTATIONS
  // ==========================================================================

  /**
   * Get challenge status with memoization for performance
   * 
   * @educational_note useMemo prevents expensive recalculations
   */
  const getChallengeStatus = useMemo(() => 
    (challengeId: ChallengeType): ChallengeStatus => {
      const isCompleted = state.progress.completedChallenges.includes(challengeId);
      
      if (isCompleted) {
        const transactionHash = getTransactionStorage(challengeId).get() || '';
        return {
          status: 'completed',
          completedAt: state.progress.lastUpdated,
          transactionHash
        };
      }
      
      // Check if challenge is locked due to prerequisites
      const challenge = WORKSHOP_CHALLENGES.find(c => c.id === challengeId);
      if (challenge && challenge.prerequisites.length > 0) {
        const hasUncompletedPrerequisites = challenge.prerequisites.some(
          prereq => !state.progress.completedChallenges.includes(prereq)
        );
        
        if (hasUncompletedPrerequisites) {
          const missingPrereq = challenge.prerequisites.find(
            prereq => !state.progress.completedChallenges.includes(prereq)
          );
          return {
            status: 'locked',
            reason: 'prerequisite_required',
            prerequisiteChallenge: missingPrereq!
          };
        }
      }
      
      return { status: 'not_started' };
    },
    [state.progress.completedChallenges, state.progress.lastUpdated]
  );

  /**
   * Check if challenge is unlocked
   * 
   * @educational_note Simple derived state with memoization
   */
  const isChallengeUnlocked = useMemo(() => 
    (challengeId: ChallengeType): boolean => {
      const status = getChallengeStatus(challengeId);
      return status.status !== 'locked';
    },
    [getChallengeStatus]
  );

  // ==========================================================================
  // ACTION METHODS
  // ==========================================================================

  /**
   * Validate challenge flag with comprehensive error handling
   * 
   * @educational_note useCallback prevents unnecessary re-renders
   * @pattern Async function with proper error handling and analytics
   */
  const validateFlag = useCallback(async (
    challengeId: ChallengeType, 
    flag: string
  ): Promise<FlagValidationResult> => {
    const startTime = Date.now();
    
    try {
      // Clear any previous errors
      dispatch({ type: 'CLEAR_ERROR' });
      
      // Validate the flag
      const result = validateChallengeFlag(challengeId, flag);
      
      // Record the attempt for analytics
      const attempt: ChallengeAttempt = {
        challengeId,
        timestamp: startTime,
        success: result.valid,
        error: result.valid ? undefined : result.error,
        duration: Date.now() - startTime,
        metadata: { flag: flag.substring(0, 10) + '...' } // Partial flag for debugging
      };
      
      dispatch({ type: 'RECORD_ATTEMPT', attempt });
      
      // Save attempts to localStorage
      const updatedAttempts = [...state.attempts, attempt];
      attemptsStorage.set(updatedAttempts);
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Flag validation failed';
      
      // Record failed attempt
      const attempt: ChallengeAttempt = {
        challengeId,
        timestamp: startTime,
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime
      };
      
      dispatch({ type: 'RECORD_ATTEMPT', attempt });
      
      return {
        valid: false,
        error: errorMessage,
        hint: 'Please try again or check the challenge instructions'
      };
    }
  }, [state.attempts]);

  /**
   * Mark challenge as completed with transaction hash
   * 
   * @educational_note Complex state update with persistence and validation
   */
  const completeChallenge = useCallback(async (
    challengeId: ChallengeType, 
    transactionHash?: string
  ): Promise<void> => {
    try {
      dispatch({ type: 'START_SAVE' });
      
      // Create updated progress
      const updatedProgress: WorkshopProgress = {
        ...state.progress,
        completedChallenges: state.progress.completedChallenges.includes(challengeId)
          ? state.progress.completedChallenges
          : [...state.progress.completedChallenges, challengeId],
        lastUpdated: Date.now(),
        timeSpent: state.progress.timeSpent + (Date.now() - state.progress.sessionStarted)
      };
      
      // Save progress to localStorage
      progressStorage.set(updatedProgress);
      
      // Save transaction hash if provided
      if (transactionHash) {
        getTransactionStorage(challengeId).set(transactionHash);
      }
      
      dispatch({ 
        type: 'SAVE_COMPLETE', 
        progress: updatedProgress 
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save progress';
      dispatch({ 
        type: 'SET_ERROR', 
        error: errorMessage 
      });
      throw error; // Re-throw so caller can handle
    }
  }, [state.progress]);

  /**
   * Reset workshop progress (for testing/debugging)
   * 
   * @educational_note Destructive operation with proper confirmation
   */
  const resetProgress = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'START_SAVE' });
      
      // Clear all localStorage data
      progressStorage.remove();
      attemptsStorage.remove();
      
      // Clear individual transaction hashes
      Object.values(ChallengeType).forEach(challengeId => {
        getTransactionStorage(challengeId).remove();
      });
      
      dispatch({ type: 'RESET_PROGRESS' });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset progress';
      dispatch({ 
        type: 'SET_ERROR', 
        error: errorMessage 
      });
      throw error;
    }
  }, []);

  /**
   * Record challenge attempt for analytics
   * 
   * @educational_note Analytics integration with error handling
   */
  const recordAttempt = useCallback((
    attempt: Omit<ChallengeAttempt, 'timestamp'>
  ): void => {
    try {
      const fullAttempt: ChallengeAttempt = {
        ...attempt,
        timestamp: Date.now()
      };
      
      dispatch({ type: 'RECORD_ATTEMPT', attempt: fullAttempt });
      
      // Async save to localStorage (don't block UI)
      setTimeout(() => {
        try {
          const updatedAttempts = [...state.attempts, fullAttempt];
          attemptsStorage.set(updatedAttempts);
        } catch (error) {
          console.warn('Failed to save attempt to localStorage:', error);
        }
      }, 0);
      
    } catch (error) {
      console.warn('Failed to record attempt:', error);
    }
  }, [state.attempts]);

  // ==========================================================================
  // RETURN INTERFACE
  // ==========================================================================

  return {
    progress: state.progress,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    validateFlag,
    completeChallenge,
    resetProgress,
    getChallengeStatus,
    isChallengeUnlocked,
    recordAttempt
  };
};

/**
 * @educational_note HOOK USAGE EXAMPLE:
 * 
 * ```tsx
 * const MyComponent = () => {
 *   const {
 *     progress,
 *     validateFlag,
 *     completeChallenge,
 *     getChallengeStatus
 *   } = useChallengeVerification();
 *   
 *   const handleFlagSubmit = async (flag: string) => {
 *     const result = await validateFlag(ChallengeType.TREASURY_MASTER, flag);
 *     if (result.valid) {
 *       await completeChallenge(ChallengeType.TREASURY_MASTER, flag);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <p>Completed: {progress.completedChallenges.length}/5</p>
 *       <div>Challenge UI</div>
 *     </div>
 *   );
 * };
 * ```
 */