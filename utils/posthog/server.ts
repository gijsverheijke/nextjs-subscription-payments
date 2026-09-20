import { PostHog } from 'posthog-node';

// Create a short-lived PostHog client for a single server invocation.
// Server Actions run in a short-lived context, so events are flushed
// immediately (flushAt: 1) and the client is shut down after each capture.
// Returns null when PostHog is not configured, which keeps analytics optional.
function createClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    return null;
  }

  return new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0
  });
}

// Capture one server-side event and flush it before returning. Analytics must
// never break the checkout flow, so any failure is logged and swallowed.
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, any> = {}
): Promise<void> {
  const client = createClient();
  if (!client) {
    return;
  }

  try {
    client.capture({
      distinctId,
      event,
      properties: { ...properties, $is_server: true }
    });
    await client.shutdown();
  } catch (err) {
    console.error('PostHog capture failed:', err);
  }
}
