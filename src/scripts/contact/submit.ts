// submitContact module with a mock endpoint using site.form strings (I-33)
export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactResult {
  ok: boolean;
  error?: string | undefined;
}

/**
 * Submits contact form data to the mock endpoint.
 * If message is 'error', simulates a network failure to trigger the mailto fallback.
 */
export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (payload.message.trim().toLowerCase() === 'error') {
    return {
      ok: false,
      error: 'Message delivery simulated failure.',
    };
  }

  return { ok: true };
}
