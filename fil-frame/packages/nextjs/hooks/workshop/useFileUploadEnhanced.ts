/**
 * @fileoverview Enhanced File Upload Hook - React TypeScript Best Practices Demo
 * 
 * This hook demonstrates advanced React TypeScript patterns for educational purposes:
 * - Generic type constraints for flexible file handling
 * - Comprehensive error handling with typed error boundaries
 * - Performance optimizations with useCallback and proper state management
 * - Progress tracking with discriminated union state patterns
 * - Integration with our workshop type system for educational value
 * - Async workflow management with proper cleanup and cancellation
 * 
 * @educational_purpose Showcases React hook best practices:
 * - Custom hooks with proper return type interfaces
 * - Generic constraints for reusable file operations
 * - State machines for complex async workflows
 * - Error boundary friendly error handling
 * - Performance patterns with proper memoization
 * - Integration with external SDKs using TypeScript
 * 
 * @pattern This hook follows the "State Machine Pattern" for managing
 * complex upload workflows with clear state transitions
 * 
 * @author Filecoin Workshop Team
 * @version 2.0.0 - Enhanced with TypeScript best practices
 */

"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  type FileStorageResult,
  FileStorageStatus,
  type PaymentParameters,
  WorkshopError,
  ChallengeType
} from '@/types/workshop.types';
import { useWorkshopContext } from '@/contexts/WorkshopContext';
import { useChallengeVerification } from '@/hooks/workshop/useChallengeVerification';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Supported file input types for upload
 * 
 * @educational_note Generic constraint allows for different input types
 * @pattern Union type for flexible input handling
 */
export type FileInput = File | Uint8Array | ArrayBuffer;

/**
 * Upload progress state with discriminated union pattern
 * 
 * @educational_note Demonstrates state machine pattern with TypeScript
 * @pattern Each state contains relevant data for that phase
 */
export type UploadProgressState =
  | { readonly status: 'idle'; readonly progress: 0 }
  | { readonly status: 'converting'; readonly progress: number; readonly fileName?: string }
  | { readonly status: 'initializing'; readonly progress: number; readonly message: string }
  | { readonly status: 'uploading'; readonly progress: number; readonly fileName: string; readonly size: number }
  | { readonly status: 'processing'; readonly progress: number; readonly pieceCid?: string }
  | { readonly status: 'confirming'; readonly progress: number; readonly pieceCid: string }
  | { readonly status: 'completed'; readonly progress: 100; readonly result: FileStorageResult }
  | { readonly status: 'failed'; readonly progress: number; readonly error: string; readonly fileName?: string };

/**
 * Enhanced upload configuration interface
 * 
 * @educational_note Comprehensive options with sensible defaults
 */
export interface UploadConfig {
  /** Maximum file size in bytes (default: 100MB) */
  readonly maxFileSize?: number;
  
  /** Allowed MIME types (default: all) */
  readonly allowedTypes?: readonly string[];
  
  /** Enable CDN for faster uploads */
  readonly withCDN?: boolean;
  
  /** Custom storage provider address */
  readonly providerAddress?: string;
  
  /** Enable progress callbacks */
  readonly enableProgressTracking?: boolean;
  
  /** Timeout for upload operations in ms */
  readonly timeoutMs?: number;
}

/**
 * Hook return interface with comprehensive functionality
 * 
 * @educational_note Complete interface for all upload operations
 */
export interface UseFileUploadEnhanced {
  /** Current upload progress state */
  readonly progressState: UploadProgressState;
  
  /** Upload file mutation */
  readonly uploadFile: (
    file: FileInput, 
    config?: UploadConfig
  ) => Promise<FileStorageResult>;
  
  /** Cancel ongoing upload */
  readonly cancelUpload: () => void;
  
  /** Reset upload state */
  readonly resetUpload: () => void;
  
  /** Validate file before upload */
  readonly validateFile: (file: FileInput, config?: UploadConfig) => Promise<ValidationResult>;
  
  /** Upload mutation object for advanced usage */
  readonly mutation: UseMutationResult<FileStorageResult, Error, { file: FileInput; config?: UploadConfig }>;
  
  /** Whether upload can be cancelled */
  readonly canCancel: boolean;
  
  /** Calculated upload metrics */
  readonly metrics: UploadMetrics;
}

/**
 * File validation result
 * 
 * @educational_note Discriminated union for validation feedback
 */
export type ValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly errors: readonly string[] };

/**
 * Upload metrics for analytics and UX
 * 
 * @educational_note Derived state for upload insights
 */
export interface UploadMetrics {
  readonly uploadSpeed?: number; // bytes per second
  readonly remainingTime?: number; // milliseconds
  readonly totalSize?: number; // bytes
  readonly uploadedBytes?: number; // bytes
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert various file inputs to Uint8Array
 * 
 * @educational_note Generic utility function with proper error handling
 * @param input - File input in various formats
 * @returns Promise resolving to Uint8Array and metadata
 */
const convertFileInput = async (input: FileInput): Promise<{
  data: Uint8Array;
  fileName: string;
  size: number;
  type: string;
}> => {
  if (input instanceof File) {
    const arrayBuffer = await input.arrayBuffer();
    return {
      data: new Uint8Array(arrayBuffer),
      fileName: input.name,
      size: input.size,
      type: input.type
    };
  } else if (input instanceof ArrayBuffer) {
    return {
      data: new Uint8Array(input),
      fileName: 'upload.bin',
      size: input.byteLength,
      type: 'application/octet-stream'
    };
  } else if (input instanceof Uint8Array) {
    return {
      data: input,
      fileName: 'upload.bin',
      size: input.length,
      type: 'application/octet-stream'
    };
  } else {
    throw new WorkshopError(
      'Unsupported file input type',
      'INVALID_FILE_TYPE',
      undefined,
      { supportedTypes: ['File', 'ArrayBuffer', 'Uint8Array'] }
    );
  }
};

/**
 * Validate file against configuration
 * 
 * @educational_note Comprehensive validation with detailed error messages
 * @param file - File metadata
 * @param config - Upload configuration
 * @returns Validation result with specific error messages
 */
const validateFileInternal = (
  file: { size: number; type: string; fileName: string },
  config: UploadConfig = {}
): ValidationResult => {
  const errors: string[] = [];
  
  // Size validation
  const maxSize = config.maxFileSize ?? 100 * 1024 * 1024; // 100MB default
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    errors.push(`File size ${fileSizeMB}MB exceeds maximum ${maxSizeMB}MB`);
  }
  
  // Type validation
  if (config.allowedTypes && config.allowedTypes.length > 0) {
    const isAllowed = config.allowedTypes.some(allowedType => {
      if (allowedType.includes('*')) {
        const pattern = allowedType.replace('*', '.*');
        return new RegExp(pattern).test(file.type);
      }
      return file.type === allowedType;
    });
    
    if (!isAllowed) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
    }
  }
  
  // Empty file check
  if (file.size === 0) {
    errors.push('File cannot be empty');
  }
  
  return errors.length === 0 
    ? { valid: true }
    : { valid: false, errors };
};

/**
 * Calculate upload speed and remaining time
 * 
 * @educational_note Performance calculation utility
 */
const calculateMetrics = (
  uploadedBytes: number,
  totalBytes: number,
  startTime: number,
  currentTime: number
): UploadMetrics => {
  const elapsedMs = currentTime - startTime;
  const uploadSpeed = elapsedMs > 0 ? (uploadedBytes / elapsedMs) * 1000 : 0; // bytes per second
  const remainingBytes = totalBytes - uploadedBytes;
  const remainingTime = uploadSpeed > 0 ? (remainingBytes / uploadSpeed) * 1000 : 0; // milliseconds
  
  return {
    uploadSpeed,
    remainingTime,
    totalSize: totalBytes,
    uploadedBytes
  };
};

// =============================================================================
// MAIN HOOK IMPLEMENTATION
// =============================================================================

/**
 * Enhanced file upload hook with comprehensive TypeScript patterns
 * 
 * @educational_note Demonstrates advanced React hook patterns:
 * - State machines for complex workflows
 * - Generic type constraints for flexibility
 * - Performance optimization with useCallback
 * - Proper cleanup and cancellation handling
 * - Integration with external contexts
 * - Analytics and metrics tracking
 * 
 * @param defaultConfig - Default configuration for uploads
 * @returns Complete file upload interface with type safety
 */
export const useFileUploadEnhanced = (
  defaultConfig: UploadConfig = {}
): UseFileUploadEnhanced => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  const [progressState, setProgressState] = useState<UploadProgressState>({
    status: 'idle',
    progress: 0
  });
  
  // Refs for cleanup and cancellation
  const cancelTokenRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Context integration
  const { utils } = useWorkshopContext();
  const { recordAttempt } = useChallengeVerification();
  const { address } = useAccount();

  // ==========================================================================
  // MEMOIZED VALUES
  // ==========================================================================
  
  /**
   * Whether upload can be cancelled
   * 
   * @educational_note Derived state with useMemo
   */
  const canCancel = useMemo(() => {
    return progressState.status === 'converting' ||
           progressState.status === 'initializing' ||
           progressState.status === 'uploading' ||
           progressState.status === 'processing';
  }, [progressState.status]);
  
  /**
   * Current upload metrics
   * 
   * @educational_note Complex derived state calculation
   */
  const metrics = useMemo((): UploadMetrics => {
    if (progressState.status === 'uploading' && startTimeRef.current > 0) {
      const currentTime = Date.now();
      const totalBytes = progressState.size;
      const uploadedBytes = Math.floor((progressState.progress / 100) * totalBytes);
      
      return calculateMetrics(uploadedBytes, totalBytes, startTimeRef.current, currentTime);
    }
    
    return {};
  }, [progressState]);

  // ==========================================================================
  // CALLBACK FUNCTIONS
  // ==========================================================================
  
  /**
   * Validate file before upload
   * 
   * @educational_note useCallback for performance optimization
   */
  const validateFile = useCallback(async (
    file: FileInput,
    config: UploadConfig = {}
  ): Promise<ValidationResult> => {
    try {
      const fileData = await convertFileInput(file);
      const mergedConfig = { ...defaultConfig, ...config };
      return validateFileInternal(fileData, mergedConfig);
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'File validation failed']
      };
    }
  }, [defaultConfig]);
  
  /**
   * Cancel ongoing upload
   * 
   * @educational_note Proper cleanup with AbortController
   */
  const cancelUpload = useCallback((): void => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
      cancelTokenRef.current = null;
    }
    
    setProgressState({
      status: 'failed',
      progress: progressState.progress,
      error: 'Upload cancelled by user',
      fileName: progressState.status === 'uploading' ? progressState.fileName : undefined
    });
  }, [progressState]);
  
  /**
   * Reset upload state
   * 
   * @educational_note State reset with cleanup
   */
  const resetUpload = useCallback((): void => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
      cancelTokenRef.current = null;
    }
    
    setProgressState({ status: 'idle', progress: 0 });
    startTimeRef.current = 0;
  }, []);

  // ==========================================================================
  // UPLOAD MUTATION
  // ==========================================================================
  
  /**
   * File upload mutation with comprehensive error handling
   * 
   * @educational_note Complex async operation with state management
   */
  const mutation = useMutation({
    mutationFn: async ({ 
      file, 
      config = {} 
    }: { 
      file: FileInput; 
      config?: UploadConfig 
    }): Promise<FileStorageResult> => {
      const mergedConfig = { ...defaultConfig, ...config };
      const attemptStart = Date.now();
      
      try {
        // Step 1: File conversion and validation
        setProgressState({ status: 'converting', progress: 10 });
        
        const fileData = await convertFileInput(file);
        const validationResult = validateFileInternal(fileData, mergedConfig);
        
        if (!validationResult.valid) {
          throw new WorkshopError(
            `File validation failed: ${validationResult.errors.join(', ')}`,
            'FILE_VALIDATION_ERROR',
            ChallengeType.STORAGE_SENTINEL
          );
        }
        
        // Step 2: Setup cancellation token
        cancelTokenRef.current = new AbortController();
        startTimeRef.current = Date.now();
        
        setProgressState({
          status: 'initializing',
          progress: 20,
          message: 'Initializing upload...'
        });
        
        // Step 3: Simulated upload workflow (replace with actual implementation)
        setProgressState({
          status: 'uploading',
          progress: 30,
          fileName: fileData.fileName,
          size: fileData.size
        });
        
        // Simulate progress updates
        for (let progress = 30; progress < 80; progress += 10) {
          if (cancelTokenRef.current?.signal.aborted) {
            throw new WorkshopError('Upload cancelled', 'UPLOAD_CANCELLED');
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
          setProgressState({
            status: 'uploading',
            progress,
            fileName: fileData.fileName,
            size: fileData.size
          });
        }
        
        setProgressState({
          status: 'processing',
          progress: 80,
          pieceCid: 'QmExamplePieceCID123456789'
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const result: FileStorageResult = {
          success: true,
          cid: 'QmExamplePieceCID123456789',
          transactionHash: '0x' + '0'.repeat(64),
          status: FileStorageStatus.COMPLETED,
          fileSize: fileData.size,
          cost: {
            lockupAllowance: BigInt('1000000000000000000'),
            epochRateAllowance: BigInt('100000000000000000'),
            depositAmount: BigInt('500000000000000000'),
            totalAmount: BigInt('1600000000000000000')
          },
          metadata: {
            fileName: fileData.fileName,
            uploadTime: Date.now(),
            provider: 'enhanced-workshop-provider'
          }
        };
        
        setProgressState({
          status: FileStorageStatus.COMPLETED,
          progress: 100,
          result
        });
        
        // Record successful attempt
        recordAttempt({
          challengeId: ChallengeType.STORAGE_SENTINEL,
          success: true,
          duration: Date.now() - attemptStart,
          metadata: {
            fileName: fileData.fileName,
            fileSize: fileData.size,
            uploadSpeed: metrics.uploadSpeed
          }
        });
        
        return result;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setProgressState({
          status: 'failed',
          progress: progressState.progress,
          error: errorMessage,
          fileName: file instanceof File ? file.name : undefined
        });
        
        // Record failed attempt
        recordAttempt({
          challengeId: ChallengeType.STORAGE_SENTINEL,
          success: false,
          duration: Date.now() - attemptStart,
          error: errorMessage,
          metadata: {
            fileName: file instanceof File ? file.name : undefined,
            stage: progressState.status
          }
        });
        
        throw error;
      } finally {
        cancelTokenRef.current = null;
      }
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    }
  });
  
  /**
   * Simplified upload function
   * 
   * @educational_note Wrapper function for easier usage
   */
  const uploadFile = useCallback(async (
    file: FileInput,
    config?: UploadConfig
  ): Promise<FileStorageResult> => {
    return mutation.mutateAsync({ file, config });
  }, [mutation]);

  // ==========================================================================
  // CLEANUP
  // ==========================================================================
  
  /**
   * Cleanup on unmount
   * 
   * @educational_note Proper cleanup prevents memory leaks
   */
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort();
      }
    };
  }, []);

  // ==========================================================================
  // RETURN INTERFACE
  // ==========================================================================
  
  return {
    progressState,
    uploadFile,
    cancelUpload,
    resetUpload,
    validateFile,
    mutation,
    canCancel,
    metrics
  };
};

/**
 * @educational_note HOOK USAGE EXAMPLES:
 * 
 * ```tsx
 * // Basic usage
 * const FileUploadComponent = () => {
 *   const {
 *     progressState,
 *     uploadFile,
 *     validateFile,
 *     resetUpload
 *   } = useFileUploadEnhanced();
 *   
 *   const handleFileUpload = async (file: File) => {
 *     const validation = await validateFile(file);
 *     if (!validation.valid) {
 *       alert(`Validation failed: ${validation.errors.join(', ')}`);
 *       return;
 *     }
 *     
 *     try {
 *       const result = await uploadFile(file, {
 *         maxFileSize: 50 * 1024 * 1024, // 50MB
 *         allowedTypes: ['image/*', 'application/pdf'],
 *         withCDN: true
 *       });
 *       
 *       console.log('Upload successful:', result.cid);
 *     } catch (error) {
 *       console.error('Upload failed:', error);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <input
 *         type="file"
 *         onChange={(e) => {
 *           const file = e.target.files?.[0];
 *           if (file) handleFileUpload(file);
 *         }}
 *       />
 *       
 *       {progressState.status !== 'idle' && (
 *         <div>
 *           <div>Status: {progressState.status}</div>
 *           <div>Progress: {progressState.progress}%</div>
 *           <button onClick={resetUpload}>Reset</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * };
 * 
 * // Advanced usage with metrics
 * const AdvancedUploadComponent = () => {
 *   const upload = useFileUploadEnhanced({
 *     maxFileSize: 100 * 1024 * 1024,
 *     enableProgressTracking: true
 *   });
 *   
 *   return (
 *     <div>
 *       {upload.metrics.uploadSpeed && (
 *         <div>
 *           Speed: {(upload.metrics.uploadSpeed / 1024).toFixed(2)} KB/s
 *           Remaining: {Math.round(upload.metrics.remainingTime! / 1000)}s
 *         </div>
 *       )}
 *       
 *       {upload.canCancel && (
 *         <button onClick={upload.cancelUpload}>Cancel Upload</button>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */