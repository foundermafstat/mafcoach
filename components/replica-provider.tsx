"use client"

import type { ReactNode } from "react"
import { ReplicaProvider as NewReplicaProvider } from "./replica-context"

// This component is kept for backward compatibility in the layout.tsx file
// It simply renders the new ReplicaProvider from replica-context.tsx
export default function ReplicaProvider({ children }: { children: ReactNode }) {
  return (
    <NewReplicaProvider>
      {children}
    </NewReplicaProvider>
  )
}

// Re-export the useReplica hook for backward compatibility
export { useReplica } from "./replica-context"
