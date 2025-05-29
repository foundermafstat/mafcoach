// Utility to extract and parse AI trigger blocks from a message

export type ChatTrigger =
  | { action: 'navigate'; payload: string }
  | { action: 'theme'; payload: 'light' | 'dark' | 'system' }
  | { action: 'headerState'; payload: Record<string, unknown> }

/**
 * Extracts and parses a [TRIGGER]{...}[/TRIGGER] block from text.
 * Returns the trigger object, or null if not found or invalid.
 */
export function extractChatTrigger(text: string): ChatTrigger | null {
  const match = text.match(/\[TRIGGER\]([\s\S]*?)\[\/TRIGGER\]/)
  if (!match) return null
  try {
    const obj = JSON.parse(match[1])
    if (
      obj &&
      typeof obj.action === 'string' &&
      'payload' in obj
    ) {
      return obj as ChatTrigger
    }
  } catch {}
  return null
}
