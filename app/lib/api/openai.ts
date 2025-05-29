import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates replica content based on a basic description
 * @param description - Basic description of the replica
 * @returns Object containing generated name, purpose, short description, greeting, and system message
 */
export async function generateReplicaContent(description: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates content for AI replicas based on basic descriptions. Generate comprehensive, creative, engaging, and appropriate content. Your responses must follow strict character limits and include all required fields.'
        },
        {
          role: 'user',
          content: `You are an AI assistant helping to create a Replica (AI character).
  Based on the user's description, generate a complete configuration for a new Replica with the following fields:
  - name: A catchy name for the replica (required)
  - purpose: A clear purpose statement with maximum 200 characters (required)
  - shortDescription: A brief description with maximum 50 characters (required)
  - greeting: A friendly greeting for the replica (required)
  - systemMessage: A system message that guides the replica's behavior (required)
  - type: MUST be one of ONLY these three exact values: 'individual', 'character', or 'brand' (required)
  - tags: An array of relevant tags (required)
  - suggestedQuestions: An array of example questions users might ask (required)
  - profileImageDescription: A description for an appropriate profile image (required)
  - modelName: The model to use, one of 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku' (required)
  - slug: A URL-friendly version of the name (required)

  IMPORTANT: For the 'type' field, you MUST ONLY use one of these three exact values: 'individual', 'character', or 'brand'. 
  Any other value like 'assistant', 'tutor', or other variations will cause an error.

  Always return a complete JSON object with ALL fields filled.

  Create complete content for an AI replica based on this basic description: "${description}".
          
          Return a JSON object with the following fields:
          - name: A catchy name for the replica (1-3 words)
          - purpose: A clear purpose statement (STRICT MAXIMUM: 200 characters)
          - shortDescription: A very brief description (STRICT MAXIMUM: 50 characters)
          - greeting: A friendly greeting the replica will use (1 sentence)
          - systemMessage: A system message that guides the replica's behavior (2-3 sentences)
          - type: IMPORTANT! Must be EXACTLY one of these three options: "individual", "character", or "brand"
          - tags: An array of 3-5 relevant tags/keywords for this replica
          - suggestedQuestions: An array of 3-5 example questions users might ask this replica
          - profileImageDescription: A brief description of what would make an appropriate profile image
          - modelName: IMPORTANT! Must be EXACTLY one of these options: "gpt-4o", "claude-3-5-haiku-latest", "claude-3-7-sonnet-latest", "claude-4-sonnet-20250514", "grok-2-latest", "grok-3-beta", "deepseek-chat", "o3-mini", "gpt-4o-mini", "huggingface-eva", "huggingface-dolphin-llama"
          - slug: A URL-friendly version of the name (lowercase, no spaces, use hyphens instead)
          
          IMPORTANT: The length limits are STRICT requirements from the API:
          - purpose must be 200 characters or less
          - shortDescription must be 50 characters or less
          - All fields must be generated and non-empty`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating replica content:', error);
    throw new Error('Failed to generate replica content');
  }
}
