/**
 * @fileoverview Enhanced Datasets Hook - Simplified for CTF Workshop
 * 
 * This hook provides enhanced dataset functionality for educational purposes.
 * The implementation is simplified to avoid type conflicts during the CTF challenges.
 * 
 * @educational_purpose Demonstrates React Query patterns with graceful fallbacks
 * @author Filecoin Workshop Team
 * @version 2.0.0 - Simplified for workshop compatibility
 */

"use client";

import { useMemo } from "react";
import { useDatasets } from "@/hooks/synapse/useDatasets";
import { type DataSet } from '@/types/synapse';
import { ChallengeType } from '@/types/workshop.types';

// =============================================================================
// SIMPLIFIED TYPE DEFINITIONS
// =============================================================================

/**
 * Provider health status
 */
export enum ProviderHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNAVAILABLE = 'unavailable',
  UNKNOWN = 'unknown'
}

/**
 * Enhanced dataset with basic computed fields
 */
export interface EnhancedDataSet extends DataSet {
  readonly metrics: {
    readonly totalPieces: number;
    readonly estimatedStorage: string;
  };
  readonly providerHealth: ProviderHealthStatus;
  readonly workshop: {
    readonly relatedChallenge?: ChallengeType;
    readonly tags: readonly string[];
    readonly complexityLevel: 1 | 2 | 3 | 4 | 5;
  };
}

/**
 * Enhanced datasets result interface
 */
export interface UseDatasetsEnhanced {
  readonly data?: readonly EnhancedDataSet[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  readonly filtered: {
    readonly byChallenge: (challengeId: ChallengeType) => readonly EnhancedDataSet[];
    readonly byHealth: (status: ProviderHealthStatus) => readonly EnhancedDataSet[];
    readonly byComplexity: (level: 1 | 2 | 3 | 4 | 5) => readonly EnhancedDataSet[];
  };
  readonly statistics: {
    readonly totalDatasets: number;
    readonly totalPieces: number;
    readonly healthyProviders: number;
  };
}

// =============================================================================
// ENHANCEMENT UTILITIES
// =============================================================================

/**
 * Enhance dataset with computed fields
 */
const enhanceDataset = (dataset: DataSet): EnhancedDataSet => {
  const totalPieces = dataset.data?.pieces?.length ?? 0;
  const estimatedSizeGB = Math.max(1, totalPieces) * 1; // 1GB estimate per piece
  
  return {
    ...dataset,
    metrics: {
      totalPieces,
      estimatedStorage: `${estimatedSizeGB} GB`
    },
    providerHealth: dataset.provider 
      ? ProviderHealthStatus.HEALTHY 
      : ProviderHealthStatus.UNKNOWN,
    workshop: {
      relatedChallenge: totalPieces > 0 ? ChallengeType.STORAGE_SENTINEL : undefined,
      tags: [
        ...(dataset.provider ? ['has-provider'] : []),
        ...(totalPieces > 0 ? ['has-data'] : []),
        ...(dataset.isLive ? ['active'] : [])
      ],
      complexityLevel: Math.min(5, Math.max(1, 1 + totalPieces + (dataset.provider ? 1 : 0))) as 1 | 2 | 3 | 4 | 5
    }
  };
};

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Enhanced datasets hook with educational features
 */
export const useDatasetsEnhanced = (): UseDatasetsEnhanced => {
  const baseQuery = useDatasets();
  
  const enhancedData = useMemo(() => {
    if (!baseQuery.data?.datasets) return undefined;
    return baseQuery.data.datasets.map(enhanceDataset);
  }, [baseQuery.data?.datasets]);

  const filtered = useMemo(() => ({
    byChallenge: (challengeId: ChallengeType) => 
      enhancedData?.filter(d => d.workshop.relatedChallenge === challengeId) ?? [],
    
    byHealth: (status: ProviderHealthStatus) => 
      enhancedData?.filter(d => d.providerHealth === status) ?? [],
    
    byComplexity: (level: 1 | 2 | 3 | 4 | 5) => 
      enhancedData?.filter(d => d.workshop.complexityLevel === level) ?? []
  }), [enhancedData]);

  const statistics = useMemo(() => ({
    totalDatasets: enhancedData?.length ?? 0,
    totalPieces: enhancedData?.reduce((sum, d) => sum + d.metrics.totalPieces, 0) ?? 0,
    healthyProviders: enhancedData?.filter(d => d.providerHealth === ProviderHealthStatus.HEALTHY).length ?? 0
  }), [enhancedData]);

  return {
    data: enhancedData,
    isLoading: baseQuery.isLoading,
    isError: baseQuery.isError,
    error: baseQuery.error || null,
    filtered,
    statistics
  };
};