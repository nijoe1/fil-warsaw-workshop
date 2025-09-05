import { LPACC_EVM_CONTRACT } from "@/types/lit";
import {
  //   AuthSig,
  LitAccessControlConditionResource,
  createSiweMessage,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LIT_ABILITY, LIT_NETWORK } from "@lit-protocol/constants";
import { decryptFromJson, encryptToJson } from "@lit-protocol/encryption";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AccessControlConditions, AccsEVMParams, EncryptToJsonPayload, ILitNodeClient } from "@lit-protocol/types";
import { ethers } from "ethers";


export class Lit {
  contractAddress: string;
  litNodeClient: LitNodeClient;
  chain;
  tokenId: number | undefined;
  constructor(chain: string, tokenId?: number, contractAddress?: string) {
    this.chain = chain;
    this.litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
    }) as LitNodeClient;
    this.litNodeClient.disconnect();
    this.tokenId = tokenId;
    this.contractAddress = contractAddress ?? "";
  }

  private accessControlConditions(): AccsEVMParams[] | LPACC_EVM_CONTRACT[] {
    return [
      {
        contractAddress: this.contractAddress,
        chain: this.chain as LPACC_EVM_CONTRACT["chain"],
        functionName: "hasAccess",
        functionParams: [this.tokenId?.toString() ?? "", ":userAddress"],
        functionAbi: {
          name: "hasAccess",
          stateMutability: "view",
          inputs: [
            {
              name: "tokenId",
              type: "uint256",
            },
            {
              name: "account",
              type: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
            },
          ],
        },
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "true",
        },
      },
    ];
  }

  async connect() {
    await this.litNodeClient.disconnect();
    const res = await this.litNodeClient.connect();
    return res;
  }

  async encryptNFT({ message, file }: { message?: string; file?: File }) {
    await this.litNodeClient.disconnect();
    await this.litNodeClient.connect();
    if (!message && !file) {
      throw new Error("Either message or file must be provided");
    }
    if (File) {
      // Encrypt the message
      const encryptedString = await encryptToJson({
        evmContractConditions: this.accessControlConditions(),
        file: file,
        chain: this.chain,
        litNodeClient: this.litNodeClient as unknown as ILitNodeClient,
      });

      // Return the ciphertext and dataToEncryptHash
      return {
        jsonPayload: JSON.parse(encryptedString) as EncryptToJsonPayload,
      };
    } else if (message) {
      // Encrypt the message
      const encryptedString = await encryptToJson({
        evmContractConditions: this.accessControlConditions(),
        string: message,
        chain: this.chain,
        litNodeClient: this.litNodeClient as unknown as ILitNodeClient,
      });

      // Return the ciphertext and dataToEncryptHash
      return {
        jsonPayload: JSON.parse(encryptedString) as EncryptToJsonPayload,
      };
    } else {
      throw new Error("Either message or file must be provided");
    }
  }

  async encrypt(message?: string, file?: File) {
    await this.litNodeClient.disconnect();
    await this.litNodeClient.connect();
    if (!message && !file) {
      throw new Error("Either message or file must be provided");
    }
    if (File) {
      // Encrypt the message
      const encryptedString = await encryptToJson({
        evmContractConditions: this.accessControlConditions() as AccessControlConditions,
        file: file,
        chain: this.chain,
        litNodeClient: this.litNodeClient as unknown as ILitNodeClient,
      });

      // Return the ciphertext and dataToEncryptHash
      return {
        jsonPayload: JSON.parse(encryptedString) as EncryptToJsonPayload,
      };
    } else if (message) {
      // Encrypt the message
      const encryptedString = await encryptToJson({
        // evmContractConditions: this.accessControlConditions(),
        evmContractConditions: this.accessControlConditions() as AccessControlConditions,
        string: message,
        chain: this.chain,
        litNodeClient: this.litNodeClient as unknown as ILitNodeClient,
      });

      // Return the ciphertext and dataToEncryptHash
      return {
        jsonPayload: JSON.parse(encryptedString) as EncryptToJsonPayload,
      };
    }
  }

  async decrypt(
    payload: EncryptToJsonPayload,
    // sessionSigs: SessionSigsMap,
    // authSig?: AuthSig,
  ) {
    await this.litNodeClient.disconnect();
    await this.litNodeClient.connect();
    const sessionSignatures = await this.getSessionSignatures();
    // Get the session signatures
    // Decrypt the message
    try {
      const decryptedString = await decryptFromJson({
        parsedJsonData: payload,
        sessionSigs: sessionSignatures,
        litNodeClient: this.litNodeClient as unknown as ILitNodeClient,
      });

      // Return the decrypted string
      return { decryptedString } as {
        decryptedString: string | File | Blob;
      };
    } catch (e) {
      console.error(e);
    }
  }
  async getSessionSignatures() {
    // authSig: AuthSig
    await this.litNodeClient.disconnect();
    await this.litNodeClient.connect();

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = await provider.getSigner();
    const walletAddress = ethersSigner.address;
    const sessionSignatures = await this.litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      // capabilityAuthSigs: [authSig], // Unnecessary on datil-dev
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({ uri, expiration, resourceAbilityRequests }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress,
          nonce: await this.litNodeClient.getLatestBlockhash(),
          litNodeClient: this.litNodeClient as unknown as ILitNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    return sessionSignatures;
  }
}
