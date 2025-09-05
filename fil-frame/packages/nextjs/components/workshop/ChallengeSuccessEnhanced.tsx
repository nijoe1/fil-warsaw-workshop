/**
 * @fileoverview Enhanced Challenge Success Component - React TypeScript Best Practices Demo
 * 
 * This component demonstrates professional React TypeScript patterns for educational purposes:
 * - Comprehensive prop interfaces with JSDoc documentation
 * - Performance optimizations with React.memo and useCallback
 * - Proper error boundary integration with educational messages
 * - Type-safe integration with our challenge verification system
 * - Accessibility features with proper ARIA labels
 * - Responsive design with mobile-first approach
 * 
 * @educational_purpose Showcases React TypeScript best practices:
 * - Interface design with optional and required properties
 * - Performance optimization patterns (memoization)
 * - Integration with custom hooks for state management
 * - Proper event handling with type safety
 * - Error handling with user-friendly messages
 * - Progressive enhancement for better UX
 * 
 * @pattern This component follows the "Single Responsibility Principle" by focusing
 * solely on displaying challenge completion status and navigation
 * 
 * @author Filecoin Workshop Team
 * @version 2.0.0 - Enhanced with TypeScript best practices
 */

"use client";

import React, { useEffect, useCallback, useMemo, type FC } from "react";
import Link from "next/link";
import {
  type ChallengeSuccessProps,
  type ChallengeType,
  type Challenge,
  WORKSHOP_CONFIG,
  WORKSHOP_CHALLENGES
} from '@/types/workshop.types';
import { useChallengeVerification } from '@/hooks/workshop/useChallengeVerification';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format transaction hash for display with ellipsis
 * 
 * @educational_note Pure function for formatting - easy to test and reuse
 * @param hash - Transaction hash to format
 * @param prefixLength - Characters to show at start
 * @param suffixLength - Characters to show at end
 * @returns Formatted hash string
 */
const formatTransactionHash = (
  hash: string, 
  prefixLength = 8, 
  suffixLength = 6
): string => {
  if (hash.length <= prefixLength + suffixLength) {
    return hash;
  }
  return `${hash.slice(0, prefixLength)}...${hash.slice(-suffixLength)}`;
};

/**
 * Get block explorer URL for transaction
 * 
 * @educational_note Configuration-based URL generation
 * @param transactionHash - Hash to create explorer link for
 * @returns Complete block explorer URL
 */
const getBlockExplorerUrl = (transactionHash: string): string => 
  `${WORKSHOP_CONFIG.BLOCK_EXPLORER_URL}${transactionHash}`;

// =============================================================================
// CHILD COMPONENTS
// =============================================================================

/**
 * Success animation component with accessibility
 * 
 * @educational_note Separate component for better testing and reusability
 */
const SuccessAnimation: FC<{ 'data-testid'?: string }> = React.memo(({ 'data-testid': testId }) => (
  <div className="mb-6" data-testid={testId}>
    <div 
      className="w-20 h-20 mx-auto bg-success rounded-full flex items-center justify-center animate-bounce"
      role="img"
      aria-label="Celebration animation"
    >
      <span className="text-4xl" aria-hidden="true">🎉</span>
    </div>
  </div>
));

SuccessAnimation.displayName = 'SuccessAnimation';

/**
 * Challenge badge component
 * 
 * @educational_note Props interface demonstrates optional vs required properties
 */
interface ChallengeBadgeProps {
  readonly challengeNumber: number;
  readonly 'data-testid'?: string;
}

const ChallengeBadge: FC<ChallengeBadgeProps> = React.memo(({ 
  challengeNumber, 
  'data-testid': testId 
}) => (
  <div 
    className="badge badge-success badge-lg mb-4 text-white font-bold"
    data-testid={testId}
    role="status"
    aria-live="polite"
  >
    Challenge {challengeNumber} Complete!
  </div>
));

ChallengeBadge.displayName = 'ChallengeBadge';

/**
 * Transaction details component with copy functionality
 * 
 * @educational_note Complex component with multiple responsibilities
 */
interface TransactionDetailsProps {
  readonly transactionHash: string;
  readonly 'data-testid'?: string;
}

const TransactionDetails: FC<TransactionDetailsProps> = React.memo(({ 
  transactionHash, 
  'data-testid': testId 
}) => {
  const blockExplorerUrl = useMemo(() => 
    getBlockExplorerUrl(transactionHash), 
    [transactionHash]
  );
  
  const formattedHash = useMemo(() => 
    formatTransactionHash(transactionHash), 
    [transactionHash]
  );

  /**
   * Copy transaction hash to clipboard with user feedback
   * 
   * @educational_note Async function with error handling and user feedback
   */
  const handleCopyHash = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(transactionHash);
      // TODO: Add toast notification for better UX
      console.log('Transaction hash copied to clipboard');
    } catch (error) {
      console.warn('Failed to copy transaction hash:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = transactionHash;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [transactionHash]);

  return (
    <div className="bg-base-100 p-4 rounded-xl mb-6" data-testid={testId}>
      <h3 className="font-semibold mb-2">📋 Transaction Details</h3>
      <div className="text-sm">
        <p className="text-base-content/70 mb-2">Transaction Hash:</p>
        <div className="flex items-center gap-2 mb-3">
          <code 
            className="bg-base-200 px-3 py-1 rounded text-xs break-all flex-1"
            title={transactionHash}
          >
            {formattedHash}
          </code>
          <button
            onClick={handleCopyHash}
            className="btn btn-ghost btn-xs"
            title="Copy full hash"
            aria-label="Copy transaction hash to clipboard"
          >
            📋
          </button>
        </div>
        <div className="flex gap-2">
          <a 
            href={blockExplorerUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-outline btn-sm flex-1"
            aria-label="View transaction on Filfox block explorer"
          >
            🔍 View on Filfox
          </a>
        </div>
      </div>
    </div>
  );
});

TransactionDetails.displayName = 'TransactionDetails';

/**
 * Progress indicator with dynamic completion tracking
 * 
 * @educational_note Demonstrates integration with our challenge verification system
 */
interface ProgressIndicatorProps {
  readonly currentChallenge: number;
  readonly 'data-testid'?: string;
}

const ProgressIndicator: FC<ProgressIndicatorProps> = React.memo(({ 
  currentChallenge, 
  'data-testid': testId 
}) => {
  const { progress, getChallengeStatus } = useChallengeVerification();

  /**
   * Get completion status for each challenge
   * 
   * @educational_note useMemo prevents expensive recalculations on re-render
   */
  const challengeStatuses = useMemo(() => 
    WORKSHOP_CHALLENGES.map(challenge => ({
      id: challenge.id,
      number: challenge.number,
      isCompleted: getChallengeStatus(challenge.id).status === 'completed'
    })),
    [getChallengeStatus]
  );

  const totalCompleted = useMemo(() => 
    challengeStatuses.filter(status => status.isCompleted).length,
    [challengeStatuses]
  );

  return (
    <div className="mt-8 pt-6 border-t border-base-300" data-testid={testId}>
      <div 
        className="flex justify-center items-center space-x-2"
        role="progressbar"
        aria-label="Workshop progress"
        aria-valuenow={totalCompleted}
        aria-valuemin={0}
        aria-valuemax={WORKSHOP_CONFIG.TOTAL_CHALLENGES}
      >
        {challengeStatuses.map(({ number, isCompleted }) => (
          <div
            key={number}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              isCompleted ? "bg-success" : "bg-base-300"
            }`}
            title={`Challenge ${number} ${isCompleted ? 'completed' : 'not completed'}`}
            aria-label={`Challenge ${number} ${isCompleted ? 'completed' : 'not completed'}`}
          />
        ))}
      </div>
      <p className="text-sm text-base-content/50 mt-2">
        Challenge {currentChallenge} of {WORKSHOP_CONFIG.TOTAL_CHALLENGES} completed
      </p>
      <p className="text-xs text-base-content/40 mt-1">
        Total completed: {totalCompleted}/{WORKSHOP_CONFIG.TOTAL_CHALLENGES}
      </p>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Enhanced Challenge Success Component
 * 
 * @educational_note This component demonstrates:
 * - React.memo for performance optimization
 * - Comprehensive prop validation with TypeScript
 * - Integration with custom hooks
 * - Accessibility best practices
 * - Error boundary friendly design
 * 
 * @param props - Component properties with full type safety
 * @returns Challenge success UI with enhanced functionality
 */
export const ChallengeSuccessEnhanced: FC<ChallengeSuccessProps> = React.memo(({
  challenge,
  message,
  transactionHash,
  additionalInfo,
  onRetry,
  onNext,
  className = "",
  children,
  'data-testid': testId
}) => {
  const { completeChallenge } = useChallengeVerification();

  /**
   * Save challenge completion on component mount
   * 
   * @educational_note useEffect with proper dependency array
   */
  useEffect(() => {
    const saveCompletion = async (): Promise<void> => {
      try {
        await completeChallenge(challenge.id, transactionHash);
      } catch (error) {
        console.error('Failed to save challenge completion:', error);
        // Note: In a production app, you might want to show a toast notification
        // or trigger error boundary here
      }
    };

    saveCompletion();
  }, [challenge.id, transactionHash, completeChallenge]);

  /**
   * Handle retry button click with type safety
   * 
   * @educational_note useCallback prevents unnecessary re-renders
   */
  const handleRetry = useCallback((): void => {
    if (onRetry) {
      onRetry();
    } else {
      // Fallback behavior
      window.location.reload();
    }
  }, [onRetry]);

  /**
   * Handle next challenge navigation
   * 
   * @educational_note Type-safe navigation with fallback
   */
  const handleNext = useCallback((): void => {
    if (onNext) {
      onNext();
    }
  }, [onNext]);

  /**
   * Get next challenge information
   * 
   * @educational_note Derived state with null safety
   */
  const nextChallenge = useMemo((): Challenge | null => {
    if (!challenge.nextChallenge) return null;
    return WORKSHOP_CHALLENGES.find(c => c.id === challenge.nextChallenge) || null;
  }, [challenge.nextChallenge]);

  return (
    <div 
      className={`bg-gradient-to-br from-success/20 to-primary/20 p-8 rounded-3xl shadow-lg max-w-2xl mx-auto text-center ${className}`}
      data-testid={testId}
      role="dialog"
      aria-labelledby="challenge-success-title"
      aria-describedby="challenge-success-message"
    >
      <SuccessAnimation data-testid="success-animation" />
      
      <ChallengeBadge 
        challengeNumber={challenge.number}
        data-testid="challenge-badge"
      />

      <h2 
        id="challenge-success-title"
        className="text-3xl font-bold text-success mb-4"
      >
        {challenge.title}
      </h2>

      <p 
        id="challenge-success-message"
        className="text-lg text-base-content/80 mb-6 leading-relaxed"
      >
        {message}
      </p>

      {transactionHash && (
        <TransactionDetails 
          transactionHash={transactionHash}
          data-testid="transaction-details"
        />
      )}

      {additionalInfo && (
        <div className="mb-6" data-testid="additional-info">
          {additionalInfo}
        </div>
      )}

      {children && (
        <div className="mb-6" data-testid="children-content">
          {children}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={handleRetry}
          className="btn btn-outline"
          data-testid="retry-button"
          aria-label="Try this challenge again"
        >
          🔄 Try Again
        </button>

        {nextChallenge && (
          <Link 
            href={nextChallenge.path} 
            className="btn btn-primary"
            data-testid="next-challenge-button"
            aria-label={`Continue to ${nextChallenge.title}`}
          >
            ➡️ {nextChallenge.title}
          </Link>
        )}
      </div>

      <ProgressIndicator 
        currentChallenge={challenge.number}
        data-testid="progress-indicator"
      />
    </div>
  );
});

ChallengeSuccessEnhanced.displayName = 'ChallengeSuccessEnhanced';

/**
 * @educational_note COMPONENT USAGE EXAMPLES:
 * 
 * ```tsx
 * // Basic usage with required props
 * <ChallengeSuccessEnhanced
 *   challenge={WORKSHOP_CHALLENGES[0]}
 *   message="Congratulations! You've completed the Treasury Master challenge!"
 * />
 * 
 * // Advanced usage with all optional props
 * <ChallengeSuccessEnhanced
 *   challenge={WORKSHOP_CHALLENGES[0]}
 *   message="Payment processing implemented successfully!"
 *   transactionHash="0x1234567890abcdef..."
 *   additionalInfo={
 *     <div>
 *       <p>You earned 100 points!</p>
 *       <p>Next: Learn about file storage with IPFS</p>
 *     </div>
 *   }
 *   onRetry={() => console.log('Retrying challenge')}
 *   onNext={() => console.log('Moving to next challenge')}
 *   className="custom-success-styling"
 *   data-testid="challenge-1-success"
 * >
 *   <div>Additional child content</div>
 * </ChallengeSuccessEnhanced>
 * ```
 */