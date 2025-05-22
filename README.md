# MAF Coach - Sensay AI Integration

A Next.js application that integrates with the Sensay AI platform to provide conversational AI capabilities, training data management, and chat history tracking.

## Project Overview

MAF Coach is a web application built with Next.js that leverages the Sensay AI platform to create and manage AI-powered conversations. The application allows users to:

- Chat with AI replicas
- Upload and manage training data
- View and manage chat history
- Monitor and improve AI performance

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **AI Platform**: Sensay AI

## Project Structure

```
mafcoach/
├── app/                       # Next.js App Router
│   ├── api/                   # API Routes
│   │   └── sensay/            # Sensay API integration endpoints
│   │       ├── chat-history/  # Chat history management
│   │       └── training/      # Training data management
│   ├── chat-history/          # Chat history page
│   ├── training/              # Training data management page
│   └── lib/                   # Shared utilities and API clients
│       └── api/               # API client implementations
│           ├── sensay.ts                  # Sensay SDK wrapper
│           ├── sensay-chat-history-sdk.ts # Chat history client
│           ├── sensay-direct.ts           # Direct API implementation
│           └── sensay-training.ts         # Training data client
├── components/                # Reusable UI components
├── prisma/                    # Prisma ORM schema and migrations
├── public/                    # Static assets
├── sensay-sdk/                # Sensay SDK integration
├── .env                       # Environment variables
└── README.md                  # Project documentation
```

## Sensay API Integration

The application integrates with the Sensay AI platform through multiple approaches:

### Authentication Methods

The Sensay API supports several authentication methods, with the following being used in this project:

1. **Organization Secret Authentication**:
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'X-ORGANIZATION-SECRET': SENSAY_API_KEY
   }
   ```

2. **User Authentication** (for chat completions and other endpoints):
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'X-ORGANIZATION-SECRET': SENSAY_API_KEY,
     'X-USER-ID': SENSAY_USER_ID,
     'X-API-Version': '2025-03-25'
   }
   ```

3. **Bearer Token Authentication** (alternative method):
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${SENSAY_API_KEY}`,
     'x-organization-id': SENSAY_ORG_ID
   }
   ```

### Key Components

#### 1. Sensay SDK Integration

The project uses a customized Sensay SDK located in the `/sensay-sdk/` directory. This provides typed access to the Sensay API.

```typescript
import { SensayAPI } from '../sensay-sdk';

// Initialize the SDK with configuration
export const sensayClient = new SensayAPI({
  BASE: 'https://api.sensay.io',
  HEADERS: {
    'Content-Type': 'application/json',
    'X-ORGANIZATION-SECRET': SENSAY_API_KEY,
    'X-API-Version': '2025-03-25',
  },
});
```

#### 2. Direct API Implementation

For more control, the project also includes direct API implementations:

```typescript
// app/lib/api/sensay-direct.ts
export const sendMessageToReplicaDirect = async (
  content: string,
  replicaUuid: string,
  skipChatHistory = false
) => {
  const apiUrl = `${BASE_URL}/v1/replicas/${replicaUuid}/chat/completions`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'X-ORGANIZATION-SECRET': SENSAY_API_KEY,
      'X-USER-ID': SENSAY_USER_ID,
      'Content-Type': 'application/json',
      'X-API-Version': '2025-03-25',
    },
    body: JSON.stringify({
      content,
      skip_chat_history: skipChatHistory,
      source: 'web',
    }),
  });
  
  // Process response...
};
```

#### 3. Server-Side API Routes

The application provides server-side API routes that proxy requests to the Sensay API:

```typescript
// app/api/sensay/training/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const url = id 
    ? `https://api.sensay.io/v1/training/${id}` 
    : "https://api.sensay.io/v1/training";
    
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
      "Content-Type": "application/json",
    },
  });
  
  // Process and return response...
}
```

### Key Sensay API Endpoints

The application interacts with the following Sensay API endpoints:

#### Chat Completions

```
POST /v1/replicas/{replicaUUID}/chat/completions
```

This endpoint is used to send messages to the AI replica and receive responses.

#### Chat History

```
GET /v1/replicas/{replicaUUID}/chat/history
POST /v1/replicas/{replicaUUID}/chat/history
DELETE /v1/replicas/{replicaUUID}/chat/history/{chatId}
```

These endpoints are used to manage chat history for a specific replica.

#### Training Data

```
GET /v1/training
POST /v1/training
GET /v1/training/{id}
DELETE /v1/training/{id}
```

These endpoints are used to manage training data for replicas.

#### File Uploads

```
GET /v1/upload/url?filename={filename}
PUT {signedUrl} (with file content)
```

These endpoints are used for file uploads, using a two-step process with signed URLs.

## Environment Variables

The application requires the following environment variables:

```
# Server-side variables
SENSAY_API_KEY="your-api-key"
SENSAY_REPLICA_API="https://api.sensay.io/v1/replicas"
SENSAY_ORG_ID="your-organization-id"
SENSAY_USER_ID="your-user-id"
SENSAY_REPLICA_UUID="your-default-replica-uuid"

# Client-side accessible variables
NEXT_PUBLIC_SENSAY_API_KEY="your-api-key"
NEXT_PUBLIC_SENSAY_USER_ID="your-user-id"
NEXT_PUBLIC_SENSAY_ORG_ID="your-organization-id"
NEXT_PUBLIC_SENSAY_REPLICA_UUID="your-default-replica-uuid"

# Database
DATABASE_URL="your-database-connection-string"
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables by creating a `.env` file based on the example above
4. Run the development server:
   ```
   npm run dev
   ```
5. Access the application at `http://localhost:3000`

## Authentication Setup

To set up authentication with Sensay:

1. Create an account at [Sensay](https://sensay.io)
2. Create an organization or join an existing one
3. Create a user in your organization
4. Obtain your API key, organization ID, and user ID
5. Add these credentials to your `.env` file

## Working with Replicas

A replica is an AI instance in Sensay. To work with replicas:

1. Create a replica in the Sensay dashboard
2. Obtain the replica UUID
3. Set it as `SENSAY_REPLICA_UUID` in your `.env` file, or specify it when making API calls
4. Use the training interface to upload training data
5. Test your replica using the chat interface

## Troubleshooting Sensay API Integration

If you encounter issues with the Sensay API:

1. Check your authentication credentials and ensure they are correctly set in the `.env` file
2. Verify that you're using the correct authentication method for each endpoint
3. For chat completions, ensure you're providing a valid user ID
4. For file uploads, ensure you're following the two-step process correctly
5. Check the API response for detailed error messages
6. Use the debug routes (e.g., `/api/sensay/chat-history/debug`) to test different authentication methods

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
