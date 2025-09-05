"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  BugAntIcon,
  CloudArrowUpIcon,
  CubeTransparentIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/fil-frame";
import { PaymentCalculator } from "~~/components/workshop/PaymentCalculator";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <div className="flex items-center flex-col flex-grow pt-10">
          <div className="px-5 mb-12">
            <h1 className="text-center">
              <span className="block text-2xl mb-2">Welcome to the</span>
              <span className="block text-4xl font-bold text-primary">Filecoin Onchain Cloud Workshop</span>
            </h1>
            <p className="text-center text-lg max-w-3xl mx-auto mt-4 text-base-content/70">
              Master decentralized storage, payments, and encrypted NFTs through 5 hands-on challenges. Build the future
              of Web3 data infrastructure!
            </p>
            <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mt-6">
              <p className="my-2 font-medium">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          </div>

          {/* Workshop Challenge 1 - Payment Calculator */}
          <div className="w-full px-4 mb-16">
            <PaymentCalculator />
          </div>

          {/* Workshop Overview */}
          <div className="w-full bg-base-300 px-8 py-12">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">🚀 Workshop Challenges</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Challenge 1 - Active */}
                <div className="bg-primary/10 border-2 border-primary px-6 py-6 text-center items-center rounded-3xl">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                    <CubeTransparentIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Challenge 1: Payments</h3>
                  <p className="text-sm text-base-content/70 mb-4">
                    Calculate and process USDFC payments for Filecoin storage
                  </p>
                  <div className="badge badge-primary">Active</div>
                </div>

                {/* Challenge 2 & 3 */}
                <div className="bg-base-100 px-6 py-6 text-center items-center rounded-3xl shadow-md">
                  <div className="w-12 h-12 mx-auto mb-4 bg-base-300 rounded-full flex items-center justify-center">
                    <CloudArrowUpIcon className="h-6 w-6 text-base-content/50" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Challenge 2 & 3</h3>
                  <p className="text-sm text-base-content/70 mb-4">
                    Upload files to Filecoin and retrieve your stored data
                  </p>
                  <Link href="/synapse" className="badge badge-outline hover:badge-primary">
                    File Storage
                  </Link>
                </div>

                {/* Challenge 4 */}
                <div className="bg-base-100 px-6 py-6 text-center items-center rounded-3xl shadow-md">
                  <div className="w-12 h-12 mx-auto mb-4 bg-base-300 rounded-full flex items-center justify-center">
                    <PhotoIcon className="h-6 w-6 text-base-content/50" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Challenge 4: NFTs</h3>
                  <p className="text-sm text-base-content/70 mb-4">Mint NFTs with Filecoin storage references</p>
                  <Link href="/synapse-nft" className="badge badge-outline hover:badge-secondary">
                    NFT Minting
                  </Link>
                </div>

                {/* Challenge 5 */}
                <div className="bg-base-100 px-6 py-6 text-center items-center rounded-3xl shadow-md md:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 mx-auto mb-4 bg-base-300 rounded-full flex items-center justify-center">
                    <LockClosedIcon className="h-6 w-6 text-base-content/50" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Challenge 5: Encrypted</h3>
                  <p className="text-sm text-base-content/70 mb-4">
                    Create encrypted NFTs with Lit Protocol access control
                  </p>
                  <Link href="/lit-synapse-nft" className="badge badge-outline hover:badge-accent">
                    Encrypted NFTs
                  </Link>
                </div>
              </div>

              {/* Developer Tools */}
              <div className="border-t border-base-content/10 pt-8">
                <h3 className="text-xl font-bold text-center mb-6">🛠️ Developer Tools</h3>
                <div className="flex justify-center items-center gap-8 flex-col sm:flex-row">
                  <div className="flex flex-col bg-base-100 px-8 py-6 text-center items-center max-w-xs rounded-2xl shadow-md">
                    <BugAntIcon className="h-8 w-8 fill-secondary mb-3" />
                    <p className="text-sm">Debug and test your smart contracts</p>
                    <Link href="/debug" className="btn btn-outline btn-sm mt-4">
                      Debug Contracts
                    </Link>
                  </div>
                  <div className="flex flex-col bg-base-100 px-8 py-6 text-center items-center max-w-xs rounded-2xl shadow-md">
                    <MagnifyingGlassIcon className="h-8 w-8 fill-secondary mb-3" />
                    <p className="text-sm">Explore Filecoin Calibration transactions</p>
                    <Link href="/blockexplorer" className="btn btn-outline btn-sm mt-4">
                      Block Explorer
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
