"use client";

// Simple client-side error monitoring
export function reportError(context: string, error: any, metadata?: any) {
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || "Unknown error",
    stack: error?.stack,
    metadata,
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
  };

  console.error(`[EXOWN-MONITOR] ${context}:`, errorData);

  // Future: Send to Sentry/LogRocket/etc.
  // fetch('/api/log/error', { method: 'POST', body: JSON.stringify(errorData) });
}

export function reportAuthFailure(reason: string, metadata?: any) {
  reportError("AUTH_FAILURE", new Error(reason), metadata);
}

export function reportApiFailure(endpoint: string, status: number, metadata?: any) {
  reportError("API_FAILURE", new Error(`Endpoint ${endpoint} failed with status ${status}`), metadata);
}
