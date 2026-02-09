"use server";

import "server-only";

import { db } from "../db";
import { contracts, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "./auth";

export type ContractType = "DRC20" | "DRC721" | "DRC1155" | "ERC20" | "ERC721" | "ERC1155" | "RWA";

export interface ContractInfo {
  address: string;
  transactionHash: string;
  contractName: string;
  type: ContractType;
  network: {
    chainId: number;
    name: string;
  };
  createdAt: number;
  ownerAddress: string;
  isVerified?: string; // "false", "verifying", "true", "failed"
  verifiedAt?: number;
}

export interface SaveContractInput {
  address: string;
  transactionHash: string;
  contractName: string;
  type: ContractType;
  chainId: number;
  networkName: string;
}

/**
 * Save a new contract to the database
 * Can work with or without session - uses wallet address if provided
 */
export async function saveContract(
  input: SaveContractInput,
  walletAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let session = await getSession();

    // If no session but wallet address provided, use wallet address directly
    if (!session && walletAddress) {
      const userAddress = walletAddress.toLowerCase();

      // Ensure user exists in database
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.walletAddress, userAddress))
        .limit(1);

      if (existingUser.length === 0) {
        await db.insert(users).values({
          walletAddress: userAddress,
          nonce: crypto.randomUUID(),
        });
      }

      // Create a temporary session object for this operation
      session = { address: userAddress, iat: 0, exp: 0 };
    }

    if (!session) {
      return { success: false, error: "Wallet not connected" };
    }

    // Check if contract already exists
    const existing = await db
      .select()
      .from(contracts)
      .where(eq(contracts.address, input.address.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      // Update existing contract
      await db
        .update(contracts)
        .set({
          transactionHash: input.transactionHash,
          contractName: input.contractName,
          type: input.type,
          chainId: input.chainId,
          networkName: input.networkName,
        })
        .where(eq(contracts.address, input.address.toLowerCase()));
    } else {
      // Insert new contract
      await db.insert(contracts).values({
        address: input.address.toLowerCase(),
        transactionHash: input.transactionHash,
        contractName: input.contractName,
        type: input.type,
        chainId: input.chainId,
        networkName: input.networkName,
        ownerAddress: session.address,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving contract:", error);
    return { success: false, error: "Failed to save contract" };
  }
}

/**
 * Get all contracts for a specific user
 * Public - no authentication required for reading
 */
export async function getUserContracts(address: string): Promise<ContractInfo[]> {
  try {
    const userContracts = await db
      .select()
      .from(contracts)
      .where(eq(contracts.ownerAddress, address.toLowerCase()))
      .orderBy(desc(contracts.createdAt));

    return userContracts.map((contract) => ({
      address: contract.address,
      transactionHash: contract.transactionHash,
      contractName: contract.contractName,
      type: contract.type as ContractType,
      network: {
        chainId: contract.chainId,
        name: contract.networkName,
      },
      createdAt: contract.createdAt?.getTime() || Date.now(),
      ownerAddress: contract.ownerAddress,
      isVerified: contract.isVerified || "false",
      verifiedAt: contract.verifiedAt?.getTime(),
    }));
  } catch (error) {
    console.error("Error getting user contracts:", error);
    return [];
  }
}

/**
 * Get contracts for the currently authenticated user
 * Requires valid session
 */
export async function getMyContracts(): Promise<ContractInfo[]> {
  try {
    const session = await getSession();

    if (!session) {
      return [];
    }

    return getUserContracts(session.address);
  } catch (error) {
    console.error("Error getting my contracts:", error);
    return [];
  }
}

/**
 * Delete a contract
 * Requires valid session and ownership
 */
export async function deleteContract(
  contractAddress: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Check ownership
    const contract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.address, contractAddress.toLowerCase()))
      .limit(1);

    if (contract.length === 0) {
      return { success: false, error: "Contract not found" };
    }

    if (contract[0].ownerAddress.toLowerCase() !== session.address.toLowerCase()) {
      return { success: false, error: "Not authorized to delete this contract" };
    }

    // Delete the contract
    await db
      .delete(contracts)
      .where(
        and(
          eq(contracts.address, contractAddress.toLowerCase()),
          eq(contracts.ownerAddress, session.address)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error deleting contract:", error);
    return { success: false, error: "Failed to delete contract" };
  }
}

/**
 * Get a specific contract by address
 */
export async function getContract(contractAddress: string): Promise<ContractInfo | null> {
  try {
    const result = await db
      .select()
      .from(contracts)
      .where(eq(contracts.address, contractAddress.toLowerCase()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const contract = result[0];
    return {
      address: contract.address,
      transactionHash: contract.transactionHash,
      contractName: contract.contractName,
      type: contract.type as ContractType,
      network: {
        chainId: contract.chainId,
        name: contract.networkName,
      },
      createdAt: contract.createdAt?.getTime() || Date.now(),
      ownerAddress: contract.ownerAddress,
      isVerified: contract.isVerified || "false",
      verifiedAt: contract.verifiedAt?.getTime(),
    };
  } catch (error) {
    console.error("Error getting contract:", error);
    return null;
  }
}

/**
 * Verify a contract on the blockchain explorer
 * Requires authentication and ownership
 */
export async function verifyContract(
  contractAddress: string
): Promise<{ success: boolean; error?: string; status?: string }> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated. Please sign in first." };
    }

    // Get contract and check ownership
    const result = await db
      .select()
      .from(contracts)
      .where(eq(contracts.address, contractAddress.toLowerCase()))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Contract not found" };
    }

    const contract = result[0];

    if (contract.ownerAddress.toLowerCase() !== session.address.toLowerCase()) {
      return { success: false, error: "Not authorized to verify this contract" };
    }

    // Check if already verified
    if (contract.isVerified === "true") {
      return { success: true, status: "true", error: "Contract already verified" };
    }

    // Set status to verifying
    await db
      .update(contracts)
      .set({ isVerified: "verifying" })
      .where(eq(contracts.address, contractAddress.toLowerCase()));

    // Determine contract source and name based on type
    let flattenPath = "";
    let contractName = "";
    const compilerVersion = "0.8.17+commit.8df45f5f";
    const licenseType = "mit";

    if (contract.type === "DRC20" || contract.type === "ERC20") {
      flattenPath = "/contracts/drc20/contract-flattened.sol";
      contractName = "CustomToken";
    } else if (contract.type === "DRC721" || contract.type === "ERC721") {
      flattenPath = "/contracts/drc721/contract-flattened.sol";
      contractName = "CustomNFT";
    } else if (contract.type === "DRC1155" || contract.type === "ERC1155") {
      flattenPath = "/contracts/drc1155/contract-flattened.sol";
      contractName = "DynamicERC1155";
    } else if (contract.type === "RWA") {
      flattenPath = "/contracts/rwa/contract-flattened.sol";
      contractName = "RWAToken";
    } else {
      await db
        .update(contracts)
        .set({ isVerified: "failed" })
        .where(eq(contracts.address, contractAddress.toLowerCase()));
      return { success: false, error: "Unsupported contract type" };
    }

    // Read the flattened source code
    const sourceCodeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${flattenPath}`);
    if (!sourceCodeResponse.ok) {
      await db
        .update(contracts)
        .set({ isVerified: "failed" })
        .where(eq(contracts.address, contractAddress.toLowerCase()));
      return { success: false, error: "Failed to read contract source code" };
    }
    const sourceCode = await sourceCodeResponse.text();

    // Get Blockscout API URL
    const { getBlockscoutApiUrl } = await import("../services/utils");
    let apiBase = getBlockscoutApiUrl(contract.chainId);

    // If no API base found, use the environment variable as fallback
    if (!apiBase) {
      const customExplorer = process.env.NEXT_PUBLIC_DRACONIS_TESTNET_EXPLORER_URL;
      apiBase = customExplorer ? `${customExplorer}/api/v2` : process.env.NEXT_PUBLIC_BLOCKSCOUT_API || '';
    }

    // Submit verification request
    const body = {
      compiler_version: compilerVersion,
      license_type: licenseType,
      source_code: sourceCode,
      is_optimization_enabled: true,
      optimization_runs: 200,
      contract_name: contractName,
      libraries: {},
      evm_version: "default",
      autodetect_constructor_args: true,
    };

    const url = `${apiBase}/smart-contracts/${contractAddress}/verification/via/flattened-code`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      await db
        .update(contracts)
        .set({ isVerified: "failed" })
        .where(eq(contracts.address, contractAddress.toLowerCase()));
      return {
        success: false,
        error: responseData.message || "Verification submission failed"
      };
    }

    // Poll for verification status
    let pollCount = 0;
    const maxPoll = 10;
    const pollInterval = 1000;

    while (pollCount < maxPoll) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      pollCount++;

      try {
        const statusUrl = `${apiBase}/smart-contracts/${contractAddress}`;
        const statusResponse = await fetch(statusUrl);

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();

          if (statusData.is_verified) {
            // Update database with verified status
            await db
              .update(contracts)
              .set({
                isVerified: "true",
                verifiedAt: new Date()
              })
              .where(eq(contracts.address, contractAddress.toLowerCase()));

            return { success: true, status: "true" };
          }
        }
      } catch (error) {
        console.error("Error polling verification status:", error);
      }
    }

    // Verification timed out
    await db
      .update(contracts)
      .set({ isVerified: "false" })
      .where(eq(contracts.address, contractAddress.toLowerCase()));

    return {
      success: false,
      error: "Verification is processing. Please check back later.",
      status: "verifying"
    };
  } catch (error) {
    console.error("Error verifying contract:", error);

    // Update status to failed
    try {
      await db
        .update(contracts)
        .set({ isVerified: "failed" })
        .where(eq(contracts.address, contractAddress.toLowerCase()));
    } catch (dbError) {
      console.error("Error updating contract status:", dbError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed"
    };
  }
}
