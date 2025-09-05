import { Hex } from "viem";
/*
    This is the configuration for the upload dApp using Synapse.
    It is used to configure the storage capacity, the persistence period, and the minimum number of days of lockup needed so the app can notify to pay for more storage.
*/

export const config = {
  // The number of GB of storage capacity needed to be sufficient
  storageCapacity: 10,
  // The number of days of lockup needed to be sufficient
  persistencePeriod: 30,
  // The minimum number of days of lockup needed to be sufficient
  minDaysThreshold: 10,
  // Whether to use CDN for the storage for faster retrieval
  withCDN: true,

  ENCRYPTED_NFT_CONTRACT_ADDRESS: "0xb25D327D6B85Af28Fd4935bddcd2f66bd01c1C2F",
  NFT_CONTRACT_ADDRESS: "0x5582656a81C68F055177a83f88fe5087025D0842",
  LIT_NETWORK: "filecoinCalibrationTestnet",
} satisfies {
  storageCapacity: number;
  persistencePeriod: number;
  minDaysThreshold: number;
  withCDN: boolean;
  ENCRYPTED_NFT_CONTRACT_ADDRESS: Hex;
  NFT_CONTRACT_ADDRESS: Hex;
  LIT_NETWORK: string;
};
