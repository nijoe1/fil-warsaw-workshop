/**
 * @fileoverview Workshop Context Provider - Global State Management with React TypeScript Best Practices
 * 
 * This context implementation demonstrates advanced React TypeScript patterns for educational purposes:
 * - Type-safe context creation with proper default values
 * - useReducer for complex state management with discriminated unions
 * - Context composition patterns for scalable architecture
 * - Performance optimizations with useMemo and useCallback
 * - Error boundary integration with educational error messages
 * - Utility functions for common operations (formatting, navigation)
 * - Local storage persistence with automatic data migration
 * 
 * @educational_purpose Showcases React Context best practices:
 * - Proper context typing with generic constraints
 * - State management with useReducer and discriminated unions
 * - Context composition for separation of concerns
 * - Performance optimization with selective memoization
 * - Integration with custom hooks for reusable logic
 * - Error handling and recovery strategies
 * 
 * @pattern This context follows the "Provider Pattern" with the "State/Action Pattern" 
 * for predictable state updates and easy debugging
 * 
 * @author Filecoin Workshop Team
 * @version 1.0.0
 */

"use client";

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useCallback, 
  useMemo, 
  useEffect,
  type FC, 
  type PropsWithChildren 
} from 'react';
import {
  type WorkshopState,
  type WorkshopAction,
  type WorkshopContextValue,
  type WorkshopProgress,
  type Challenge,
  type ChallengeType,
  type ChallengeAttempt,
  WorkshopError,
  WORKSHOP_CONFIG,
  WORKSHOP_CHALLENGES
} from '@/types/workshop.types';
import { useChallengeVerification } from '@/hooks/workshop/useChallengeVerification';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format storage size from bytes to human-readable format
 * 
 * @educational_note Pure utility function with proper typing
 * @param bytes - Size in bytes as BigInt for precision
 * @returns Formatted string with appropriate unit
 */
const formatStorageSize = (bytes: bigint): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = Number(bytes);
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`;
};

/**
 * Format currency amount with proper decimal handling
 * 
 * @educational_note BigInt arithmetic for precision in financial calculations
 * @param amount - Amount in smallest unit (wei, for example)
 * @param decimals - Number of decimal places (default 18 for ETH-like tokens)
 * @returns Formatted currency string
 */
const formatCurrency = (amount: bigint, decimals: number = 18): string => {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
};

/**
 * Format duration from milliseconds to human-readable format
 * 
 * @educational_note Duration formatting with proper pluralization
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 */
const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
};

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

/**
 * Initial workshop state with sensible defaults
 * 
 * @educational_note Proper initialization prevents undefined state issues
 */
const initialWorkshopState: WorkshopState = {
  progress: {
    completedChallenges: [],
    lastUpdated: 0,
    version: WORKSHOP_CONFIG.PROGRESS_VERSION,
    sessionStarted: Date.now(),
    timeSpent: 0
  },
  challenges: WORKSHOP_CHALLENGES,
  currentChallenge: undefined,
  ui: {
    isLoading: false,
    isSaving: false,
    error: undefined,
    theme: WORKSHOP_CONFIG.DEFAULT_THEME
  },
  attempts: []
};

/**
 * Workshop state reducer with comprehensive action handling
 * 
 * @educational_note Demonstrates useReducer pattern with discriminated unions
 * @pattern Each action type has specific payload structure for type safety
 */
const workshopReducer = (state: WorkshopState, action: WorkshopAction): WorkshopState => {
  switch (action.type) {
    case 'LOAD_PROGRESS':
      return {
        ...state,
        progress: action.progress,
        ui: { ...state.ui, isLoading: false, error: undefined }
      };
    
    case 'UPDATE_CHALLENGE_STATUS':
      // Update challenge status in the challenges array
      const updatedChallenges = state.challenges.map(challenge => 
        challenge.id === action.challengeId 
          ? { ...challenge, status: action.status }
          : challenge
      );
      
      return {
        ...state,
        challenges: updatedChallenges,
        ui: { ...state.ui, isSaving: false }
      };
    
    case 'NAVIGATE_TO_CHALLENGE':
      return {
        ...state,
        currentChallenge: action.challengeId,
        ui: { ...state.ui, error: undefined }
      };
    
    case 'RECORD_ATTEMPT':
      return {
        ...state,
        attempts: [...state.attempts, action.attempt] as readonly ChallengeAttempt[]
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, isLoading: action.isLoading }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        ui: { 
          ...state.ui, 
          isLoading: false, 
          isSaving: false, 
          error: action.error 
        }
      };
    
    case 'RESET_PROGRESS':
      return {
        ...state,
        progress: initialWorkshopState.progress,
        attempts: [],
        ui: { ...state.ui, isSaving: false, error: undefined }
      };
    
    case 'SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.theme }
      };
    
    default:
      // @ts-expect-error: Exhaustiveness check - TypeScript will error if we miss an action
      throw new WorkshopError(`Unknown action type: ${action.type}`, 'INVALID_ACTION');
  }
};

// =============================================================================
// CONTEXT CREATION
// =============================================================================

/**
 * Workshop Context with proper typing
 * 
 * @educational_note Context creation with null check pattern
 */
const WorkshopContext = createContext<WorkshopContextValue | null>(null);

/**
 * Custom hook for consuming workshop context with error handling
 * 
 * @educational_note Proper context consumption with helpful error messages
 * @throws WorkshopError when used outside provider
 * @returns Workshop context value with type safety
 */
export const useWorkshopContext = (): WorkshopContextValue => {
  const context = useContext(WorkshopContext);
  
  if (!context) {
    throw new WorkshopError(
      'useWorkshopContext must be used within a WorkshopProvider',
      'CONTEXT_ERROR',
      undefined,
      {
        hint: 'Wrap your component tree with <WorkshopProvider>',
        documentation: 'See the WorkshopContext.tsx file for usage examples'
      }
    );
  }
  
  return context;
};

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

/**
 * Workshop Provider component props
 * 
 * @educational_note Simple props interface for provider component
 */
interface WorkshopProviderProps extends PropsWithChildren {
  /** Initial challenge to navigate to (optional) */
  readonly initialChallenge?: ChallengeType;
}

/**
 * Workshop Context Provider with comprehensive state management
 * 
 * @educational_note Provider component demonstrates:
 * - State management with useReducer
 * - Integration with custom hooks
 * - Performance optimization with useMemo and useCallback
 * - Error handling and recovery
 * - Context value creation and memoization
 * 
 * @param props - Provider props with children and optional initial challenge
 * @returns Provider component wrapping children with workshop context
 */
export const WorkshopProvider: FC<WorkshopProviderProps> = ({ 
  children, 
  initialChallenge 
}) => {
  // State management with useReducer
  const [state, dispatch] = useReducer(workshopReducer, {
    ...initialWorkshopState,
    currentChallenge: initialChallenge
  });

  // Integration with challenge verification hook
  const challengeVerification = useChallengeVerification();

  /**
   * Initialize workshop data on mount
   * 
   * @educational_note useEffect for side effects with cleanup
   */
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    
    try {
      // Load progress from challenge verification hook
      const progress = challengeVerification.progress;
      dispatch({ type: 'LOAD_PROGRESS', progress });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize workshop';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
    }
  }, [challengeVerification.progress]);

  /**
   * Navigate to specific challenge with validation
   * 
   * @educational_note useCallback for performance optimization
   */
  const navigateToChallenge = useCallback((challengeId: ChallengeType): void => {
    try {
      // Validate challenge exists
      const challenge = WORKSHOP_CHALLENGES.find(c => c.id === challengeId);
      if (!challenge) {
        throw new WorkshopError(`Challenge not found: ${challengeId}`, 'CHALLENGE_NOT_FOUND');
      }
      
      // Check if challenge is unlocked
      if (!challengeVerification.isChallengeUnlocked(challengeId)) {
        throw new WorkshopError(
          `Challenge ${challengeId} is locked. Complete prerequisites first.`,
          'CHALLENGE_LOCKED',
          challengeId
        );
      }
      
      dispatch({ type: 'NAVIGATE_TO_CHALLENGE', challengeId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Navigation failed';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
    }
  }, [challengeVerification.isChallengeUnlocked]);

  /**
   * Workshop utilities with memoization
   * 
   * @educational_note useMemo for expensive utility object creation
   */
  const utils = useMemo(() => ({
    navigateToChallenge,
    formatStorageSize,
    formatCurrency,
    formatDuration
  }), [navigateToChallenge]);

  /**
   * Current active challenge with derived state
   * 
   * @educational_note useMemo for derived state computation
   */
  const currentChallenge = useMemo((): Challenge | undefined => {
    if (!state.currentChallenge) return undefined;
    return state.challenges.find(c => c.id === state.currentChallenge);
  }, [state.currentChallenge, state.challenges]);

  /**
   * Context value with performance optimization
   * 
   * @educational_note useMemo prevents unnecessary re-renders of consumers
   */
  const contextValue = useMemo((): WorkshopContextValue => ({
    state,
    dispatch,
    challenges: state.challenges,
    currentChallenge,
    utils
  }), [state, currentChallenge, utils]);

  return (
    <WorkshopContext.Provider value={contextValue}>
      {children}
    </WorkshopContext.Provider>
  );
};

WorkshopProvider.displayName = 'WorkshopProvider';

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook for accessing workshop progress with computed values
 * 
 * @educational_note Custom hook for specific context slice
 * @returns Progress data with computed statistics
 */
export const useWorkshopProgress = () => {
  const { state } = useWorkshopContext();
  
  return useMemo(() => {
    const progress = state.progress;
    const completionPercentage = (progress.completedChallenges.length / WORKSHOP_CONFIG.TOTAL_CHALLENGES) * 100;
    const remainingChallenges = WORKSHOP_CONFIG.TOTAL_CHALLENGES - progress.completedChallenges.length;
    
    return {
      ...progress,
      completionPercentage,
      remainingChallenges,
      isComplete: progress.completedChallenges.length === WORKSHOP_CONFIG.TOTAL_CHALLENGES
    };
  }, [state.progress]);
};

/**
 * Hook for accessing current challenge with navigation utilities
 * 
 * @educational_note Specialized hook for current challenge context
 * @returns Current challenge data and navigation functions
 */
export const useCurrentChallenge = () => {
  const { currentChallenge, utils } = useWorkshopContext();
  
  const navigateNext = useCallback(() => {
    if (currentChallenge?.nextChallenge) {
      utils.navigateToChallenge(currentChallenge.nextChallenge);
    }
  }, [currentChallenge, utils]);
  
  const navigatePrevious = useCallback(() => {
    if (currentChallenge) {
      const currentIndex = WORKSHOP_CHALLENGES.findIndex(c => c.id === currentChallenge.id);
      if (currentIndex > 0) {
        utils.navigateToChallenge(WORKSHOP_CHALLENGES[currentIndex - 1].id);
      }
    }
  }, [currentChallenge, utils]);
  
  return {
    currentChallenge,
    navigateNext,
    navigatePrevious,
    hasNext: Boolean(currentChallenge?.nextChallenge),
    hasPrevious: currentChallenge ? WORKSHOP_CHALLENGES.findIndex(c => c.id === currentChallenge.id) > 0 : false
  };
};

/**
 * Hook for accessing workshop UI state
 * 
 * @educational_note UI-specific context slice with actions
 * @returns UI state and related actions
 */
export const useWorkshopUI = () => {
  const { state, dispatch } = useWorkshopContext();
  
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', theme });
  }, [dispatch]);
  
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: undefined });
  }, [dispatch]);
  
  return {
    ui: state.ui,
    setTheme,
    clearError
  };
};

/**
 * @educational_note CONTEXT USAGE EXAMPLES:
 * 
 * ```tsx
 * // 1. Wrap your app with the provider
 * function App() {
 *   return (
 *     <WorkshopProvider initialChallenge={ChallengeType.TREASURY_MASTER}>
 *       <MyWorkshopApp />
 *     </WorkshopProvider>
 *   );
 * }
 * 
 * // 2. Use the main context hook
 * function MyComponent() {
 *   const { state, challenges, utils } = useWorkshopContext();
 *   
 *   return (
 *     <div>
 *       <h1>Workshop Progress: {state.progress.completedChallenges.length}/5</h1>
 *       <button onClick={() => utils.navigateToChallenge(ChallengeType.TREASURY_MASTER)}>
 *         Go to Challenge 1
 *       </button>
 *     </div>
 *   );
 * }
 * 
 * // 3. Use specialized hooks
 * function ProgressComponent() {
 *   const { completionPercentage, isComplete } = useWorkshopProgress();
 *   
 *   return (
 *     <div>
 *       <div>Progress: {completionPercentage.toFixed(1)}%</div>
 *       {isComplete && <div>🎉 Workshop Complete!</div>}
 *     </div>
 *   );
 * }
 * 
 * // 4. Current challenge navigation
 * function NavigationComponent() {
 *   const { currentChallenge, navigateNext, navigatePrevious, hasNext } = useCurrentChallenge();
 *   
 *   return (
 *     <div>
 *       <h2>{currentChallenge?.title}</h2>
 *       <button onClick={navigatePrevious}>Previous</button>
 *       {hasNext && <button onClick={navigateNext}>Next</button>}
 *     </div>
 *   );
 * }
 * ```
 */