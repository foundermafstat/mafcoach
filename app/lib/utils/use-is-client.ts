"use client";

import { useState, useEffect } from 'react';

/**
 * Custom hook to determine if the code is running on the client side
 * This helps avoid hydration mismatches by deferring client-specific rendering
 * @returns {boolean} True if the code is running on the client side
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}
