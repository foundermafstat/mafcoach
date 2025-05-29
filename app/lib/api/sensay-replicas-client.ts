/**
 * Client-side service for managing replicas through Sensay API via server API routes
 * Provides full CRUD functionality for replicas
 * This avoids exposing API keys in the browser
 */

export interface SensayReplicaLLM {
  model: string;
  tools: string[];
  memoryMode: string;
  systemMessage: string;
}

export interface SensayReplicaIntegration {
  token: string;
  is_active?: boolean;
  service_name: string;
}

export interface SensayReplica {
  llm: SensayReplicaLLM;
  name: string;
  slug: string;
  tags: string[];
  type: string;
  uuid: string;
  ownerID: string;
  private: boolean;
  purpose: string;
  greeting: string;
  created_at: string;
  owner_uuid: string;
  elevenLabsID?: string;
  introduction?: string;
  profileImage?: string;
  profile_image?: string;
  video_enabled: boolean;
  voice_enabled: boolean;
  system_message: string;
  whitelistEmails?: string[];
  shortDescription?: string;
  short_description?: string;
  chat_history_count: number;
  suggestedQuestions?: string[];
  discord_integration?: SensayReplicaIntegration;
  telegram_integration?: SensayReplicaIntegration;
}

interface SensayReplicasResponse {
  success: boolean;
  type: string;
  items: SensayReplica[];
  total: number;
  message?: string; // Optional error message
}

export interface ReplicaCreateUpdateData {
  name: string;
  purpose: string;
  shortDescription: string;
  greeting: string;
  type: string;
  ownerID: string;
  private: boolean;
  whitelistEmails?: string[];
  slug?: string;
  tags?: string[];
  profileImage?: string;
  suggestedQuestions?: string[];
  llm?: {
    model: string;
    memoryMode: string;
    systemMessage: string;
    tools?: string[];
  };
  voicePreviewText?: string;
}

/**
 * Fetch all replicas from the server API route
 * @returns Promise<SensayReplica[]> Array of replicas
 */
export async function fetchReplicas(): Promise<SensayReplica[]> {
  try {
    console.log('Fetching replicas from server API route...');

    const response = await fetch('/api/sensay/replicas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response received with status:', response.status);

    if (!response.ok) {
      // Try to get error details if available
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.message || '';
      } catch (e) {
        // Ignore JSON parsing error and just use status text
      }

      throw new Error(
        `Failed to fetch replicas: ${response.status} ${response.statusText} ${errorDetails}`.trim()
      );
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} replicas from server`);

    return data as SensayReplica[];
  } catch (error) {
    console.error('Error in fetchReplicas client function:', error);
    throw error; // Re-throw for caller to handle
  }
}

/**
 * Fetch a specific replica by ID
 * @param id The replica UUID
 * @returns Promise<SensayReplica> The requested replica
 */
export async function fetchReplicaById(id: string): Promise<SensayReplica> {
  try {
    console.log(`Fetching replica details for ID: ${id}`);

    const response = await fetch(`/api/sensay/replicas/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.message || '';
      } catch (e) {
        // Ignore JSON parsing error
      }

      throw new Error(
        `Failed to fetch replica: ${response.status} ${response.statusText} ${errorDetails}`.trim()
      );
    }

    const data = await response.json();
    console.log(`Retrieved replica details for ${id}`);

    return data as SensayReplica;
  } catch (error) {
    console.error('Error in fetchReplicaById client function:', error);
    throw error;
  }
}

/**
 * Create a new replica
 * @param replicaData The data for creating a new replica
 * @returns Promise<SensayReplica> The created replica
 */
export async function createReplica(replicaData: ReplicaCreateUpdateData): Promise<SensayReplica> {
  try {
    console.log('Creating new replica...');

    const response = await fetch('/api/sensay/replicas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replicaData),
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.message || '';
      } catch (e) {
        // Ignore JSON parsing error
      }

      throw new Error(
        `Failed to create replica: ${response.status} ${response.statusText} ${errorDetails}`.trim()
      );
    }

    const data = await response.json();
    console.log('Replica created successfully');

    return data as SensayReplica;
  } catch (error) {
    console.error('Error in createReplica client function:', error);
    throw error;
  }
}

/**
 * Update an existing replica
 * @param id The replica UUID to update
 * @param replicaData The updated replica data
 * @returns Promise<SensayReplica> The updated replica
 */
export async function updateReplica(id: string, replicaData: ReplicaCreateUpdateData): Promise<SensayReplica> {
  try {
    console.log(`Updating replica with ID: ${id}`);

    const response = await fetch(`/api/sensay/replicas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replicaData),
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.message || '';
      } catch (e) {
        // Ignore JSON parsing error
      }

      throw new Error(
        `Failed to update replica: ${response.status} ${response.statusText} ${errorDetails}`.trim()
      );
    }

    const data = await response.json();
    console.log(`Replica ${id} updated successfully`);

    return data as SensayReplica;
  } catch (error) {
    console.error('Error in updateReplica client function:', error);
    throw error;
  }
}

/**
 * Delete a replica
 * @param id The replica UUID to delete
 * @returns Promise<{success: boolean, message: string}> Success status
 */
export async function deleteReplica(id: string): Promise<{success: boolean, message: string}> {
  try {
    console.log(`Deleting replica with ID: ${id}`);

    const response = await fetch(`/api/sensay/replicas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.message || '';
      } catch (e) {
        // Ignore JSON parsing error
      }

      throw new Error(
        `Failed to delete replica: ${response.status} ${response.statusText} ${errorDetails}`.trim()
      );
    }

    const data = await response.json();
    console.log(`Replica ${id} deleted successfully`);

    return data as {success: boolean, message: string};
  } catch (error) {
    console.error('Error in deleteReplica client function:', error);
    throw error;
  }
}
