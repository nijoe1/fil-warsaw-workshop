"use client";

import { useState } from "react";
import { ChallengeSuccess } from "./ChallengeSuccess";
import { config } from "@/config";
import { useBalances } from "@/hooks/synapse/useBalances";
import { useEthersProvider } from "@/hooks/synapse/useEthers";
import { usePayment } from "@/hooks/synapse/usePayment";
import { calculateStorageMetrics } from "@/utils/synapse/calculateStorageMetrics";
import { Synapse } from "@filoz/synapse-sdk";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export const PaymentCalculator = () => {
  const { address } = useAccount();
  const [storageSize, setStorageSize] = useState<number>(0.5); // TB
  const [persistencePeriod, setPersistencePeriod] = useState<number>(10); // days
  const [isCalculating, setIsCalculating] = useState(false);
  const provider = useEthersProvider();
  const [error, setError] = useState<string | null>(null);

  const { mutation: processPayment, status: isProcessing, transactionHash } = usePayment();

  const { data: balances } = useBalances();

  const metricsQuery = useQuery({
    queryKey: ["metrics", storageSize, persistencePeriod],
    queryFn: async () => {
      return await calculateMetrics();
    },
    enabled: !!storageSize && !!persistencePeriod && !!provider && !!address,
  });

  const { metrics, storagePricing } = metricsQuery.data || { metrics: undefined, storagePricing: undefined };

  const calculateMetrics = async () => {
    if (!storageSize || storageSize <= 0 || !provider) {
      setError("Please enter a valid storage size");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Convert TB to bytes
      const sizeInBytes = storageSize * 1024 * 1024 * 1024 * 1024;

      const synapse = await Synapse.create({
        provider: provider,
        withCDN: config.withCDN,
      });

      const storagePricing = await synapse.storage.getStorageInfo();

      const result = await calculateStorageMetrics(synapse, persistencePeriod, sizeInBytes, config.minDaysThreshold);

      return { metrics: result, storagePricing };
    } catch (err) {
      console.error("Calculation error:", err);
      setError("Failed to calculate storage metrics. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePayment = async () => {
    if (!metrics || !address) return;

    try {
      await processPayment.mutateAsync({
        lockupAllowance: metrics.totalLockupNeeded,
        epochRateAllowance: metrics.rateNeeded,
        depositAmount: metrics.depositNeeded,
      });
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  // Show success component if payment completed
  if (processPayment.isSuccess) {
    return (
      <ChallengeSuccess
        challengeNumber={1}
        title="Payment System Mastered!"
        message="You successfully calculated storage costs and processed payment for the Filecoin Onchain Cloud!"
        transactionHash={transactionHash || undefined}
        nextChallenge="/synapse"
        nextChallengeTitle="File Upload & Retrieval"
      />
    );
  }

  return (
    <div className="bg-base-100 p-8 rounded-3xl shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">🧮 Challenge 1: Payment Calculator</h2>
        <p className="text-base-content/70">Calculate USDFC costs for Filecoin storage and process payment</p>
      </div>

      {/* Calculator Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="label">
            <span className="label-text font-semibold">Storage Size (TB)</span>
          </label>
          <input
            type="number"
            min="0.5"
            max="1000"
            step="0.5"
            value={storageSize}
            onChange={e => setStorageSize(parseFloat(e.target.value) || 0)}
            className="input input-bordered w-full"
            placeholder="10"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">Persistence (days)</span>
          </label>
          <input
            type="number"
            min="1"
            max="3650"
            value={persistencePeriod}
            onChange={e => setPersistencePeriod(parseInt(e.target.value) || 365)}
            className="input input-bordered w-full"
            placeholder="365"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Payment Error Display */}
      {processPayment.isError && (
        <div className="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{processPayment.error?.message}</span>
        </div>
      )}

      {/* Storage Metrics Results */}
      {metrics && (
        <div className="bg-base-200 p-6 rounded-2xl mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">💰 Storage Cost Breakdown</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stat bg-base-100 rounded-xl p-4">
              <div className="stat-title">Rate per Epoch</div>
              <div className="stat-value text-lg text-primary">
                {Number(formatUnits(metrics.rateNeeded, 18)).toFixed(5)} USDFC
              </div>
              <div className="stat-desc">Per storage epoch</div>
            </div>
            <div className="stat bg-base-100 rounded-xl p-4">
              <div className="stat-title">Lockup Required</div>
              <div className="stat-value text-lg text-primary">
                {Number(formatUnits(metrics.totalLockupNeeded, 18)).toFixed(5)} USDFC
              </div>
              <div className="stat-desc">Security deposit</div>
            </div>
            <div className="stat bg-base-100 rounded-xl p-4 md:col-span-2">
              <div className="stat-title">Total Cost</div>
              <div className="stat-value text-xl text-primary">
                {Number(formatUnits(metrics.depositNeeded, 18)).toFixed(5)} USDFC
              </div>
              <div className="stat-desc">
                For {storageSize} TB stored for {persistencePeriod} days
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl p-4">
              <div className="stat-title">Storage Pricing (CDN) TiB per month</div>
              <div className="stat-value text-lg text-primary">
                {Number(formatUnits(storagePricing?.pricing.withCDN.perTiBPerMonth, 18)).toFixed(5)} USDFC
              </div>
            </div>{" "}
            <div className="stat bg-base-100 rounded-xl p-4">
              <div className="stat-title">Storage Pricing (noCDN) TiB per month</div>
              <div className="stat-value text-lg text-primary">
                {Number(formatUnits(storagePricing?.pricing.noCDN.perTiBPerMonth, 18)).toFixed(5)} USDFC
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Balance & Allowances */}
      {address && balances?.usdfcBalance !== null && (
        <div className="bg-base-200 p-4 rounded-xl mb-6">
          <h4 className="font-semibold mb-2">💳 Your Account Status</h4>
          <div className="text-sm space-y-1">
            <div>
              Balance: <span className="font-mono">{formatUnits(balances.usdfcBalance, 18)} USDFC</span>
            </div>
            {balances && (
              <>
                <div>
                  Lockup Allowance:{" "}
                  <span className="font-mono">{formatUnits(balances.currentLockupAllowance, 18)} USDFC</span>
                </div>
                <div>
                  Rate Allowance: <span className="font-mono">{balances.currentRateAllowanceGB} GB</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={calculateMetrics}
          disabled={isCalculating || !storageSize}
          className="btn btn-outline btn-primary"
        >
          {isCalculating && <span className="loading loading-spinner loading-sm"></span>}
          🧮 Recalculate
        </button>

        <button onClick={handlePayment} disabled={!metrics || !address || !!isProcessing} className="btn btn-primary">
          {isProcessing && <span className="loading loading-spinner loading-sm"></span>}
          💳 Process Payment
        </button>
      </div>

      {/* Help Text */}
      {!address && (
        <div className="text-center mt-4">
          <p className="text-base-content/50 text-sm">Connect your wallet to proceed with payment</p>
        </div>
      )}
    </div>
  );
};
