import { SensayAPI } from '../../../sensay-sdk';
import type { replicaUUID_parameter } from '../../../sensay-sdk/models/replicaUUID_parameter';

/**
 * Sensay API client configuration
 * This client can be imported and used throughout the application
 */

// Get environment variables with type safety
const SENSAY_API_KEY = process.env.SENSAY_API_KEY || '';
const SENSAY_REPLICA_API = process.env.SENSAY_REPLICA_API || 'https://api.sensay.io/v1/replicas';
const SENSAY_ORG_ID = process.env.SENSAY_ORG_ID || '';

// Extract base URL from the replica API URL
const BASE_URL = SENSAY_REPLICA_API.split('/v1/replicas')[0] || 'https://api.sensay.io';

// Initialize the Sensay client with configuration
export const sensayClient = new SensayAPI({
  // Use the base URL from environment if available
  BASE: BASE_URL,
  
  // Set appropriate credentials mode for API requests
  WITH_CREDENTIALS: false,
  CREDENTIALS: 'include',
  
  // Add any custom headers if needed
  HEADERS: {
    'Content-Type': 'application/json',
    'X-ORGANIZATION-SECRET': SENSAY_API_KEY,
    'X-API-Version': '2025-03-25',
  },
});

/**
 * Helper function to get a configured Sensay client instance
 * This is useful for components that need to access the Sensay API
 */
export function getSensayClient() {
  return sensayClient;
}

/**
 * Interface for chat completion message
 */
interface ChatMessage {
  role: 'assistant' | 'developer' | 'system' | 'tool' | 'user';
  content: string;
  name?: string;
}

/**
 * Get Sensay chat completions using the OpenAI-compatible API
 * @param replicaUuid - The UUID of the replica to use
 * @param messages - The messages to send to the Sensay API
 * @param options - Additional options for the chat completion
 */
export async function getSensayChatCompletion(
  replicaUuid: replicaUUID_parameter,
  messages: ChatMessage[],
  options?: {
    store?: boolean;
    source?: 'discord' | 'embed' | 'web';
  }
) {
  try {
    // Using the OpenAI-compatible experimental endpoint
    const response = await sensayClient.chatCompletions.postV1ExperimentalReplicasChatCompletions(
      replicaUuid,
      {
        messages,
        store: options?.store,
        source: options?.source,
      }
    );
    
    return response;
  } catch (error) {
    console.error('Error getting chat completion from Sensay:', error);
    throw error;
  }
}

/**
 * Send a simple message to a Sensay replica
 * @param replicaUuid - The UUID of the replica to use
 * @param content - The message content to send
 * @param skipChatHistory - Whether to skip saving the message in chat history
 */
export async function sendMessageToReplica(
  replicaUuid: replicaUUID_parameter,
  content: string,
  skipChatHistory?: boolean
) {
  try {
    const response = await sensayClient.chatCompletions.postV1ReplicasChatCompletions(
      replicaUuid,
      '2025-03-25',
      {
        content,
        skip_chat_history: skipChatHistory,
        source: 'web'
      }
    );
    
    return response;
  } catch (error) {
    console.error('Error sending message to Sensay replica:', error);
    throw error;
  }
}
