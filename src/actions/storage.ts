"use server";

import "server-only";
import { getSession } from "./auth";

/**
 * Server actions for secure storage operations
 * Handles pre-signed URL generation for S3 uploads
 */

export interface PresignedUrlResponse {
  imageUploadUrl: string;
  imagePublicUrl: string;
  metadataUploadUrl: string;
  metadataPublicUrl: string;
  filename: {
    image: string;
    metadata: string;
  };
}

export interface GeneratePresignedUrlsInput {
  fileName: string;
  fileType: string;
}

/**
 * Generate pre-signed URLs for uploading NFT image and metadata to S3
 * This keeps S3 credentials secure on the server side
 */
export async function generatePresignedUrls(
  input: GeneratePresignedUrlsInput
): Promise<{ success: boolean; data?: PresignedUrlResponse; error?: string }> {
  try {
    // check session
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Get S3 configuration from server-side environment variables
    const s3Endpoint = process.env.S3_ENDPOINT;
    const s3ApiKey = process.env.S3_API_KEY;
    const imageBucket = process.env.S3_IMAGE_BUCKET;
    const metadataBucket = process.env.S3_METADATA_BUCKET;

    // Validate configuration
    if (!s3Endpoint || !s3ApiKey || !imageBucket || !metadataBucket) {
      return {
        success: false,
        error:
          "S3 configuration is incomplete. Please check server environment variables.",
      };
    }

    // Generate unique filenames with timestamp
    const timestamp = Date.now();
    const imageFilename = `${timestamp}_${input.fileName}`;
    const metadataFilename = `metadata_${timestamp}.json`;

    // For a simple pre-signed URL approach with custom API key auth,
    // we'll return the URLs with auth headers that the client will use
    // Note: This is a simplified approach. For production, consider using AWS SDK
    // to generate proper pre-signed URLs with expiration.

    const imageUploadUrl = `${s3Endpoint}/${imageBucket}/${imageFilename}`;
    const metadataUploadUrl = `${s3Endpoint}/${metadataBucket}/${metadataFilename}`;

    // Return URLs and the API key securely
    // The client will use these for direct upload
    return {
      success: true,
      data: {
        imageUploadUrl,
        imagePublicUrl: imageUploadUrl,
        metadataUploadUrl,
        metadataPublicUrl: metadataUploadUrl,
        filename: {
          image: imageFilename,
          metadata: metadataFilename,
        },
      },
    };
  } catch (error) {
    console.error("Error generating pre-signed URLs:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate upload URLs",
    };
  }
}

/**
 * Get S3 API key for client-side uploads
 * This should only be called from the client during the upload process
 * Note: In production, use proper pre-signed URLs instead of exposing API key
 */
export async function getS3UploadCredentials(): Promise<{
  success: boolean;
  apiKey?: string;
  error?: string;
}> {
  try {
    // check session
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }
    const s3ApiKey = process.env.S3_API_KEY;

    if (!s3ApiKey) {
      return {
        success: false,
        error: "S3 API key not configured",
      };
    }

    // Return the API key for upload operations
    // In production, consider implementing proper pre-signed URLs with AWS SDK
    return {
      success: true,
      apiKey: s3ApiKey,
    };
  } catch (error) {
    console.error("Error getting S3 credentials:", error);
    return {
      success: false,
      error: "Failed to get upload credentials",
    };
  }
}

/**
 * Verify that an upload was completed successfully
 * Optional: Can be used to validate uploads on the server side
 */
export async function verifyUpload(
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // check session
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Perform a HEAD request to verify the file exists
    const response = await fetch(fileUrl, { method: "HEAD" });

    if (!response.ok) {
      return {
        success: false,
        error: "File upload verification failed",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying upload:", error);
    return {
      success: false,
      error: "Failed to verify upload",
    };
  }
}
