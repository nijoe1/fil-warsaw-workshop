/**
 * SOLUTION: Payment Processing Hook - Challenge 1: Treasury Master
 * 
 * @fileoverview Complete working implementation of USDFC payment processing
 * This solution demonstrates the full workflow for calculating and processing
 * payments for Filecoin storage using the Synapse SDK.
 * 
 * @tutorial LEARNING OBJECTIVES:
 * - Understanding blockchain payment workflows
 * - Working with ERC20 token approvals and deposits
 * - Managing transaction lifecycle with proper error handling
 * - Integrating with Filecoin storage service providers
 * - Handling asynchronous blockchain operations with React hooks
 * 
 * @challenge_flag The successful completion returns a transaction hash
 * that participants can use as their "flag" for Challenge 1
 */

"use client";

import { useState } from "react";
import { useEthersSigner } from "./useEthers";
import { config } from "@/config";
import { DATA_SET_CREATION_FEE, MAX_UINT256 } from "@/utils/synapse/constants";
import { getDataset } from "@/utils/synapse/getDataset";
import { CONTRACT_ADDRESSES, Synapse, TIME_CONSTANTS, TOKENS } from "@filoz/synapse-sdk";
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";

/**
 * Hook to handle payment for storage
 * 
 * @description This hook demonstrates the complete payment workflow for Filecoin storage:
 * 1. Check user's USDFC balance and existing allowances
 * 2. Approve USDFC spending if needed (first-time setup)
 * 3. Deposit USDFC to cover storage costs
 * 4. Approve the storage service to spend tokens at calculated rates
 * 
 * @param lockup - The lockup amount to be used for the storage
 * @param epochRate - The epoch rate to be used for the storage  
 * @param depositAmount - The deposit amount to be used for the storage
 * 
 * @notice IMPORTANT CONCEPTS:
 * - LockUp: Accumulated USDFC locked for storing data over time (security deposit)
 * - DepositAmount: Additional payment needed for new storage requirements
 * - EpochRate: Cost per Filecoin epoch (30 seconds) for ongoing storage
 * - Allowances: ERC20 pattern for delegated spending permissions
 * 
 * @returns Mutation object with payment processing function and status tracking
 * 
 * @example
 * const { mutation, status, transactionHash, success } = usePayment();
 * 
 * // Process payment with calculated metrics
 * await mutation.mutateAsync({
 *   lockupAllowance: metrics.totalLockupNeeded,
 *   epochRateAllowance: metrics.rateNeeded,
 *   depositAmount: metrics.depositNeeded,
 * });
 */
export const usePayment = () => {
  const signer = useEthersSigner();
  const [status, setStatus] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { address } = useAccount();
  
  const mutation = useMutation({
    mutationFn: async ({
      lockupAllowance,
      epochRateAllowance,
      depositAmount,
    }: {
      lockupAllowance: bigint;
      epochRateAllowance: bigint;
      depositAmount: bigint;
    }) => {
      // STEP 1: Validate prerequisites
      if (!signer) throw new Error("Signer not found");
      if (!address) throw new Error("Address not found");

      setStatus("🔄 Preparing transaction...");
      
      // STEP 2: Initialize Synapse SDK connection
      const synapse = await Synapse.create({
        signer,
        disableNonceManager: false,
      });
      const paymentsAddress = synapse.getPaymentsAddress();

      // STEP 3: Check if user already has a dataset (affects fees)
      const { dataset } = await getDataset(synapse, address);
      const hasDataset = !!dataset;
      const fee = hasDataset ? 0n : DATA_SET_CREATION_FEE;
      const amount = depositAmount + fee;

      // STEP 4: Validate user has sufficient balance
      const allowance = await synapse.payments.allowance(paymentsAddress, TOKENS.USDFC);
      const balance = await synapse.payments.walletBalance(TOKENS.USDFC);

      if (balance < amount) {
        throw new Error("Insufficient USDFC balance");
      }

      // STEP 5: Approve USDFC spending if needed (one-time setup)
      if (allowance < MAX_UINT256 / 2n) {
        setStatus("💰 Approving USDFC to cover storage costs...");
        const transaction = await synapse.payments.approve(
          await synapse.getSigner().getAddress(), 
          MAX_UINT256
        );
        await transaction.wait();
        setStatus("💰 Successfully approved USDFC to cover storage costs");
      }
      
      // STEP 6: Deposit USDFC to payments contract
      if (amount > 0n) {
        setStatus("💰 Depositing USDFC to cover storage costs...");
        const transaction = await synapse.payments.deposit(amount);
        await transaction.wait();
        setStatus("💰 Successfully deposited USDFC to cover storage costs");
      }

      // STEP 7: Approve storage service to spend at calculated rates
      setStatus("💰 Approving Filecoin Warm Storage service USDFC spending rates...");
      const transaction = await synapse.payments.approveService(
        synapse.getWarmStorageAddress(),
        epochRateAllowance,
        lockupAllowance + fee,
        TIME_CONSTANTS.EPOCHS_PER_DAY * BigInt(config.persistencePeriod),
      );
      await transaction.wait();
      
      setStatus("💰 Successfully approved Filecoin Warm Storage spending rates");
      setTransactionHash(transaction.hash);
      setSuccess(true);
      setStatus("✅ Payment was successful!");
    },
    onSuccess: () => {
      setStatus("✅ Payment was successful!");
    },
    onError: error => {
      console.error("Payment failed:", error);
      setStatus(`❌ ${error.message || "Transaction failed. Please try again."}`);
    },
  });
  
  return { mutation, status, transactionHash, success };
};

/**
 * CHALLENGE HINTS FOR PARTICIPANTS:
 * 
 * Beginner Level:
 * - Look at the Synapse SDK documentation for payment methods
 * - Remember that blockchain operations are asynchronous
 * - Check the required imports at the top of the file
 * 
 * Intermediate Level:
 * - Understand the difference between lockup and deposit amounts
 * - Consider why we check existing allowances before approving
 * - Think about error handling for blockchain operations
 * 
 * Advanced Level:
 * - Why do we use MAX_UINT256 for approvals?
 * - What is the purpose of the nonce manager in Synapse?
 * - How does the fee calculation work for new vs existing datasets?
 * 
 * COMMON PITFALLS:
 * - Forgetting to wait for transaction confirmation
 * - Not handling insufficient balance errors gracefully  
 * - Missing the dataset fee calculation
 * - Incorrect handling of BigInt arithmetic
 */