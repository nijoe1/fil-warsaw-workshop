/**
 * SOLUTION: Datasets Hook - Challenge 3: Data Detective 
 * 
 * @fileoverview Complete working implementation of dataset retrieval and management
 * This solution demonstrates how to fetch, process, and manage user datasets
 * from the Filecoin network with comprehensive provider information.
 * 
 * @tutorial LEARNING OBJECTIVES:
 * - Understanding dataset management in distributed storage systems
 * - Working with parallel async operations and Promise.all patterns
 * - Managing complex data transformations and relationships
 * - Implementing robust error handling for network operations
 * - React Query integration for caching and background updates
 * - Provider-dataset relationship mapping
 * 
 * @challenge_flag The successful completion returns dataset information
 * with piece CIDs that participants can use as their "flag" for Challenge 3
 */

"use client";

import { useEthersSigner } from "@/hooks/synapse/useEthers";
import { config } from "@/config";
import { DataSet } from "@/types/synapse";
import { EnhancedDataSetInfo, PDPServer, Synapse } from "@filoz/synapse-sdk";
import { WarmStorageService } from "@filoz/synapse-sdk/warm-storage";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

/**
 * Hook to fetch and manage user datasets from Filecoin storage
 * 
 * @description This hook demonstrates a complex data fetching workflow:
 * 1. Initialize Synapse and WarmStorage services
 * 2. Fetch approved providers and user datasets in parallel
 * 3. Map provider relationships and fetch provider details
 * 4. Enrich datasets with provider information and PDP data
 * 5. Handle errors gracefully while maintaining data integrity
 * 6. Implement caching and background refresh strategies
 * 
 * @returns React Query result containing enriched datasets with provider info
 * 
 * @example
 * const { data, isLoading, error } = useDatasets();
 * 
 * if (data?.datasets?.length > 0) {
 *   const firstPieceCid = data.datasets[0]?.data?.pieces[0]?.pieceCid;
 *   console.log('Flag (First Piece CID):', firstPieceCid);
 * }
 */
export const useDatasets = () => {
  const signer = useEthersSigner();
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryKey: ["datasets", address],
    queryFn: async () => {
      // STEP 1: Validate prerequisites
      if (!signer) throw new Error("Signer not found");
      if (!address) throw new Error("Address not found");

      // STEP 2: Initialize core services
      const synapse = await Synapse.create({
        signer,
        disableNonceManager: false,
      });

      // Initialize WarmStorage service for dataset management
      const warmStorageService = await WarmStorageService.create(
        synapse.getProvider(),
        synapse.getWarmStorageAddress(),
      );

      // STEP 3: Fetch providers and datasets in parallel for efficiency
      const [providerIds, datasets] = await Promise.all([
        warmStorageService.getApprovedProviderIds(),
        warmStorageService.getClientDataSetsWithDetails(address),
      ]);

      // STEP 4: Create provider ID to address mapping from datasets
      const providerIdToAddressMap = datasets.reduce((acc, dataset) => {
        acc[dataset.providerId] = dataset.payee;
        return acc;
      }, {} as Record<number, string>);
      
      // STEP 5: Fetch provider information with error handling
      const providers = await Promise.all(
        providerIds.map(async providerId => {
          const providerAddress = providerIdToAddressMap[providerId];
          if (!providerAddress) {
            return null; // Skip if no address mapping exists
          }
          try {
            return await synapse.getProviderInfo(providerId);
          } catch (error) {
            console.warn(`Failed to fetch provider ${providerId}:`, error);
            return null; // Continue with other providers
          }
        }),
      );
      
      // Filter out failed provider requests
      const filteredProviders = providers.filter(provider => provider !== null);

      // STEP 6: Create provider ID to service URL mapping
      const providerIdToServiceUrlMap = filteredProviders.reduce((acc, provider) => {
        acc[provider.id] = provider.products.PDP?.data.serviceURL || "";
        return acc;
      }, {} as Record<string, string>);

      // STEP 7: Fetch detailed dataset information with PDP data
      const datasetDetailsPromises = datasets.map(async (dataset: EnhancedDataSetInfo) => {
        const serviceURL = providerIdToServiceUrlMap[dataset.providerId];
        const provider = filteredProviders.find(p => p.id === dataset.providerId);
        
        try {
          // Connect to PDP server to get piece information
          const pdpServer = new PDPServer(null, serviceURL || "");
          const data = await pdpServer.getDataSet(dataset.pdpVerifierDataSetId);
          
          return {
            ...dataset,
            provider: provider,
            serviceURL: serviceURL,
            data, // Contains pieces array with CIDs
          } as DataSet;
        } catch (error) {
          console.warn(`Failed to fetch dataset details for ${dataset.pdpVerifierDataSetId}:`, error);
          // Return dataset without detailed data but preserve basic info
          return {
            ...dataset,
            provider: provider,
            serviceURL: serviceURL,
          } as DataSet;
        }
      });

      // STEP 8: Wait for all dataset details to resolve
      const datasetDataResults = await Promise.all(datasetDetailsPromises);

      // STEP 9: Map results back to original dataset order
      const datasetsWithDetails = datasets.map(dataset => {
        const dataResult = datasetDataResults.find(
          result => result.pdpVerifierDataSetId === dataset.pdpVerifierDataSetId,
        );
        return dataResult;
      });
      
      return { datasets: datasetsWithDetails };
    },
    // Query configuration for optimal user experience
    retry: false, // Don't retry on errors to avoid cascading failures
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: true, // Always fetch fresh data on component mount
    refetchOnReconnect: false, // Don't refetch on network reconnection
  });
};

/**
 * CHALLENGE HINTS FOR PARTICIPANTS:
 * 
 * Beginner Level:
 * - Understand the relationship between providers, datasets, and pieces
 * - Study how Promise.all is used for parallel operations
 * - Look at the error handling patterns (try/catch with fallbacks)
 * 
 * Intermediate Level:
 * - Learn about the PDP (Piece Data Provider) server concept
 * - Understand the data mapping and transformation patterns
 * - Study React Query configuration options and their purposes
 * 
 * Advanced Level:
 * - Why do we use parallel fetching for providers and datasets?
 * - How does the provider-to-address mapping work?
 * - What is the purpose of the PDP server in the Filecoin ecosystem?
 * 
 * COMMON PITFALLS:
 * - Not handling null/undefined providers gracefully
 * - Forgetting to filter out failed provider requests
 * - Missing error handling in async operations
 * - Not understanding the dataset-provider relationship
 * - Incorrectly configuring React Query options
 * 
 * KEY CONCEPTS:
 * - Dataset: A collection of pieces under a storage deal
 * - Provider: Storage provider offering Filecoin storage services
 * - PDP Server: Service that provides piece data and metadata
 * - Piece: A standardized unit of data in the Filecoin network
 * - Warm Storage: Active, readily accessible storage tier
 * - Service URL: Endpoint for provider's data services
 * 
 * DATA FLOW:
 * 1. User address → Client datasets (what you've stored)
 * 2. Provider IDs → Provider details (who's storing it)
 * 3. Dataset IDs → PDP data (what pieces exist)
 * 4. Combine all → Rich dataset information for display
 */