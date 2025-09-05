"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ChallengeSuccessProps {
  challengeNumber: number;
  title: string;
  message: string;
  transactionHash?: string;
  nextChallenge?: string;
  nextChallengeTitle?: string;
  additionalInfo?: React.ReactNode;
}

const WORKSHOP_PROGRESS_KEY = "fil-workshop-progress";

interface WorkshopProgress {
  completedChallenges: number[];
  lastUpdated: number;
}

const saveProgress = (challengeNumber: number, transactionHash?: string) => {
  try {
    const existingProgress = localStorage.getItem(WORKSHOP_PROGRESS_KEY);
    const progress: WorkshopProgress = existingProgress 
      ? JSON.parse(existingProgress)
      : { completedChallenges: [], lastUpdated: 0 };

    if (!progress.completedChallenges.includes(challengeNumber)) {
      progress.completedChallenges.push(challengeNumber);
    }
    
    progress.lastUpdated = Date.now();
    
    if (transactionHash) {
      const challengeKey = `challenge-${challengeNumber}-tx`;
      localStorage.setItem(challengeKey, transactionHash);
    }

    localStorage.setItem(WORKSHOP_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("Failed to save workshop progress:", error);
  }
};

export const getWorkshopProgress = (): WorkshopProgress => {
  try {
    const stored = localStorage.getItem(WORKSHOP_PROGRESS_KEY);
    return stored ? JSON.parse(stored) : { completedChallenges: [], lastUpdated: 0 };
  } catch (error) {
    console.warn("Failed to load workshop progress:", error);
    return { completedChallenges: [], lastUpdated: 0 };
  }
};

export const isChallengeCompleted = (challengeNumber: number): boolean => {
  const progress = getWorkshopProgress();
  return progress.completedChallenges.includes(challengeNumber);
};

export const getChallengeTransaction = (challengeNumber: number): string | null => {
  try {
    return localStorage.getItem(`challenge-${challengeNumber}-tx`);
  } catch (error) {
    console.warn("Failed to get challenge transaction:", error);
    return null;
  }
};

export const ChallengeSuccess = ({
  challengeNumber,
  title,
  message,
  transactionHash,
  nextChallenge,
  nextChallengeTitle,
  additionalInfo,
}: ChallengeSuccessProps) => {
  useEffect(() => {
    saveProgress(challengeNumber, transactionHash);
  }, [challengeNumber, transactionHash]);
  const blockExplorerUrl = transactionHash ? `https://filfox.info/en/message/${transactionHash}` : undefined;

  return (
    <div className="bg-gradient-to-br from-success/20 to-primary/20 p-8 rounded-3xl shadow-lg max-w-2xl mx-auto text-center">
      {/* Success Animation */}
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto bg-success rounded-full flex items-center justify-center animate-bounce">
          <span className="text-4xl">🎉</span>
        </div>
      </div>

      {/* Challenge Number Badge */}
      <div className="badge badge-success badge-lg mb-4 text-white font-bold">
        Challenge {challengeNumber} Complete!
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-success mb-4">{title}</h2>

      {/* Message */}
      <p className="text-lg text-base-content/80 mb-6 leading-relaxed">{message}</p>

      {/* Transaction Hash */}
      {transactionHash && (
        <div className="bg-base-100 p-4 rounded-xl mb-6">
          <h3 className="font-semibold mb-2">📋 Transaction Details</h3>
          <div className="text-sm">
            <p className="text-base-content/70 mb-2">Transaction Hash:</p>
            <code className="bg-base-200 px-3 py-1 rounded text-xs break-all">{transactionHash}</code>
            {blockExplorerUrl && (
              <div className="mt-3">
                <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  🔍 View on Filfox
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Info */}
      {additionalInfo && <div className="mb-6">{additionalInfo}</div>}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => window.location.reload()} className="btn btn-outline">
          🔄 Try Again
        </button>

        {nextChallenge && (
          <Link href={nextChallenge} className="btn btn-primary">
            ➡️ {nextChallengeTitle || "Next Challenge"}
          </Link>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 pt-6 border-t border-base-300">
        <div className="flex justify-center items-center space-x-2">
          {[1, 2, 3, 4, 5].map(num => {
            const isCompleted = typeof window !== 'undefined' ? isChallengeCompleted(num) : num <= challengeNumber;
            return (
              <div
                key={num}
                className={`w-3 h-3 rounded-full ${isCompleted ? "bg-success" : "bg-base-300"}`}
              />
            );
          })}
        </div>
        <p className="text-sm text-base-content/50 mt-2">
          Challenge {challengeNumber} of 5 completed
        </p>
        {typeof window !== 'undefined' && (
          <p className="text-xs text-base-content/40 mt-1">
            Total completed: {getWorkshopProgress().completedChallenges.length}/5
          </p>
        )}
      </div>
    </div>
  );
};
