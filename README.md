# FILECOIN ONCHAIN CLOUD WORKSHOP 🚀

Welcome to the **Filecoin Onchain Cloud Workshop**! Master decentralized storage, payments, and encrypted NFTs through 5 hands-on challenges. Build the future of Web3 data infrastructure!

## 🎯 Workshop Overview

This workshop teaches you how to build a complete decentralized storage application using:

- **Filecoin** - Decentralized storage network
- **Synapse SDK** - Simplified Filecoin integration
- **Lit Protocol** - Decentralized encryption and access control
- **Smart Contracts** - NFTs with storage references
- **Next.js & TypeScript** - Modern web development

## 🏗️ Prerequisites

1. **Node.js** (v18.17.0+)
2. **Wallet** (MetaMask or similar) connected to Filecoin Calibration testnet
3. **USDFC Tokens** - Get testnet tokens from the USDFC [faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)
4. **FIL Tokens** - Get tFIL tokens from the Filecoin [Faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html)
5. **Git** and **pnpm** installed

## 🚀 Getting Started

1. **Clone and Setup**:

   ```bash
   cd fil-frame
   pnpm install
   pnpm dev
   ```

2. **Connect Wallet**: Visit `http://localhost:3000` and connect your wallet

3. **Start Challenge 1**: Begin with the payment calculator on the home page

---

## 🧩 WORKSHOP CHALLENGES

### 🧮 Challenge 1: SynapseSDK Payment System

**Objective**: Calculate USDFC costs for Filecoin storage and process payment

**Location**: Home page (`/`)

**What You'll Learn**:

- Filecoin storage cost calculation
- USDFC token allowances and deposits
- WarmStorage service pricing
- Payment processing with Synapse SDK

**Tasks**:

1. **Calculate Storage Costs**: Use the calculator to determine costs for 10TB/YEAR storage
2. **Understand Payment Components**:
   - `lockupAllowance` - Security deposit required
   - `epochRateAllowance` - Rate per storage epoch
   - `depositAmount` - Total cost for storage period
3. **Process Payment**: Execute payment transaction with calculated values

**Success Criteria**: ✅ Payment transaction completes successfully

**Key Components**:

- `PaymentCalculator` component (`/components/workshop/PaymentCalculator.tsx`)
- `calculateStorageMetrics` utility (`/workshop-helpers/synapse/utils/calculateStorageMetrics.ts`)
- `usePayment` hook (`/workshop-helpers/synapse/hooks/usePayment.ts`)

---

### 📤 Challenge 2: File Upload to Filecoin

**Objective**: Upload files to the Filecoin network using Synapse

**Location**: File Storage page (`/synapse`)

**What You'll Learn**:

- File upload to decentralized storage
- Progress tracking and error handling
- Piece CID generation
- Storage deal creation

**Tasks**:

1. **Select File**: Choose any file (max 100MB)
2. **Upload Process**: Watch real-time progress as file is:
   - Validated and prepared
   - Uploaded to Filecoin network
   - Processed into storage deals
3. **Get Piece CID**: Receive unique content identifier

**Success Criteria**: ✅ File uploaded successfully with Piece CID returned

**Key Components**:

- `FileUpload` component (`/components/workshop/FileUpload.tsx`)
- `useFileUpload` hook (`/workshop-helpers/synapse/hooks/useFileUpload.ts`)

---

### 📥 Challenge 3: File Retrieval from Filecoin

**Objective**: Retrieve and download your stored files

**Location**: File Storage page (`/synapse`) - "Your Files" tab

**What You'll Learn**:

- Dataset management and querying
- File metadata retrieval
- Download from decentralized storage
- Provider network interaction

**Tasks**:

1. **View Stored Files**: See all your uploaded files with:
   - File size and upload date
   - Piece CID and storage status
   - Provider information
2. **Download Files**: Retrieve files from Filecoin network
3. **Verify Integrity**: Confirm downloaded files match originals

**Success Criteria**: ✅ File downloaded successfully from Filecoin

**Key Components**:

- `StoredFiles` component (`/components/workshop/StoredFiles.tsx`)
- `useDatasets` hook (`/workshop-helpers/synapse/hooks/useDatasets.ts`)
- `useDownloadPiece` hook (`/workshop-helpers/synapse/hooks/useDownloadPiece.ts`)

---

### 🎨 Challenge 4: NFT Minting with Filecoin Storage

**Objective**: Create NFTs with Filecoin storage references

**Location**: NFT Minting page (`/synapse-nft`)

**What You'll Learn**:

- Smart contract interaction
- NFT minting with metadata
- Filecoin CID as token URI
- ERC721 standard implementation

**Tasks**:

1. **Upload File**: Select and upload file to Filecoin
2. **Get Storage CID**: Receive Piece CID from upload
3. **Mint NFT**: Create NFT with CID as metadata using deployed contract
4. **Verify NFT**: Confirm NFT creation and view details

**Success Criteria**: ✅ NFT minted successfully with Filecoin CID

**Smart Contract**: `NFTContract.sol`

- **Address**: `0x29c85e7eF3b6f34d80d30BDa0a816aeAC9bDe7a9`
- **Network**: Filecoin Calibration (Chain ID: 314159)

**Key Components**:

- `NFTMinter` component (`/components/workshop/NFTMinter.tsx`)
- `useScaffoldWriteContract` hook for contract interaction

---

### 🔐 Challenge 5: Encrypted NFTs with Lit Protocol

**Objective**: Create access-controlled NFTs with encrypted content

**Location**: Encrypted NFTs page (`/lit-synapse-nft`)

**What You'll Learn**:

- File encryption with Lit Protocol
- Access control conditions
- Threshold cryptography
- Decrypt-to-view functionality

**Tasks**:

1. **Choose Access Type**:
   - **Public**: Anyone can decrypt content
   - **Private**: Only specified addresses can decrypt
2. **Set Access Control** (for private NFTs): Add authorized wallet addresses
3. **Encrypt & Upload**: File is encrypted then stored on Filecoin
4. **Mint Encrypted NFT**: Create NFT with encrypted content CID
5. **Test Decryption**: Switch to decrypt tab and verify access control works

**Success Criteria**: ✅ Encrypted NFT created and decryption working based on access control

**Smart Contract**: `LitEncryptedNFT.sol`

- **Address**: `0x3388FAfA77f2b42b27550F515bb332359A37FB91`
- **Network**: Filecoin Calibration (Chain ID: 314159)

**Key Components**:

- `EncryptedNFTMinter` component (`/components/workshop/EncryptedNFTMinter.tsx`)
- `NFTDecryptor` component (`/components/workshop/NFTDecryptor.tsx`)
- `Lit` class (`/workshop-helpers/lit/lit.ts`)

---

## 🎉 Workshop Completion

**Congratulations!** 🎊 You've mastered the Filecoin Onchain Cloud Workshop!

**You've learned how to**:

- ✅ Calculate and process storage payments
- ✅ Upload files to decentralized storage
- ✅ Retrieve files from Filecoin network
- ✅ Mint NFTs with storage references
- ✅ Create encrypted NFTs with access control

**Next Steps**:

- Deploy your own version to mainnet
- Integrate these patterns into your dApps
- Explore advanced Filecoin features
- Build on the decentralized web!

---

## 🛠️ Technical Architecture

### Storage Layer

- **Filecoin Network**: Decentralized storage with cryptographic proofs
- **Synapse SDK**: Simplified integration with storage providers
- **Content Addressing**: IPFS-style CIDs for data integrity

### Smart Contracts

- **NFTContract**: ERC721 with Filecoin CID metadata
- **LitEncryptedNFT**: Advanced NFT with access control
- **Network**: Filecoin Calibration testnet

### Encryption & Access Control

- **Lit Protocol**: Decentralized key management
- **Threshold Cryptography**: No single point of failure
- **Condition-based Access**: Wallet address verification

### Frontend Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **wagmi**: Ethereum wallet integration

---

## 📚 Resources

- **Synapse SDK Docs**: Complete API reference
- **Filecoin Docs**: Network and protocol details
- **Lit Protocol Docs**: Encryption and access control
- **Smart Contract Source**: View contracts in `/packages/hardhat/contracts/`

## 🐛 Troubleshooting

### Common Issues:

1. **Payment Fails**:

   - Ensure wallet has USDFC tokens
   - Check allowances are sufficient
   - Verify network connection

2. **Upload Fails**:

   - File size must be < 100MB
   - Check network connectivity
   - Verify balance for storage costs

3. **NFT Minting Fails**:

   - Ensure file uploaded successfully first
   - Check wallet has FIL for gas
   - Verify contract address is correct

4. **Decryption Fails**:
   - Check wallet address has access
   - Verify NFT exists and is encrypted
   - Ensure Lit Protocol connection

### Need Help?

- Check browser console for error details
- Verify wallet connection and network
- Review transaction status on block explorer

---

**Built with ❤️ for the Filecoin ecosystem**
