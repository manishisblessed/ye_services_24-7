/**
 * Cloudflare for SaaS — Custom Hostname client.
 *
 * White-label partners bring their own domain (e.g. "masterindia.online"). We
 * run ONE Cloudflare zone (the platform domain) with "Cloudflare for SaaS"
 * (SSL for SaaS) enabled and a fallback origin pointing at the EC2 box. For
 * each partner domain we create a Cloudflare *Custom Hostname*:
 *
 *   - Cloudflare auto-issues and auto-renews a TLS certificate for the domain.
 *   - The partner adds ONE CNAME record at their registrar pointing the domain
 *     at CLOUDFLARE_SAAS_FALLBACK_HOSTNAME. No nameserver change needed.
 *   - Our nginx catch-all already serves any Host, so there is zero per-partner
 *     server work.
 *
 * Docs: https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/
 *       (POST/GET/DELETE /zones/{zone_id}/custom_hostnames)
 *
 * All functions throw CloudflareError on a non-ok API response so callers can
 * surface a precise message. `isCloudflareSaasConfigured()` lets callers fall
 * back to the legacy manual A-record flow when the integration isn't set up.
 */

import { env } from "@/lib/env";

const API_BASE = "https://api.cloudflare.com/client/v4";

export class CloudflareError extends Error {
  readonly status: number;
  readonly errors: unknown;
  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "CloudflareError";
    this.status = status;
    this.errors = errors;
  }
}

/** Cloudflare custom-hostname SSL lifecycle states we care about. */
export type CfSslStatus =
  | "initializing"
  | "pending_validation"
  | "pending_issuance"
  | "pending_deployment"
  | "active"
  | "pending_deletion"
  | "expired"
  | "deleted"
  | "deactivating"
  | "deactivated"
  | "backup_issued"
  | "holding_deployment"
  | string;

export type CfValidationRecord = {
  /** TXT/CNAME name the partner may need to add for DCV (domain control validation). */
  txt_name?: string;
  txt_value?: string;
  http_url?: string;
  http_body?: string;
  cname?: string;
  cname_target?: string;
  emails?: string[];
};

export type CfCustomHostname = {
  id: string;
  hostname: string;
  status: string; // overall hostname status (active | pending | ...)
  ssl: {
    id?: string;
    status: CfSslStatus;
    method?: string;
    type?: string;
    validation_records?: CfValidationRecord[];
    validation_errors?: { message: string }[];
  };
  verification_errors?: string[];
  ownership_verification?: { type?: string; name?: string; value?: string };
  ownership_verification_http?: { http_url?: string; http_body?: string };
};

type CfEnvelope<T> = {
  success: boolean;
  errors: { code: number; message: string }[];
  messages: { code: number; message: string }[];
  result: T;
};

/** True when all three env vars are present and the integration is usable. */
export function isCloudflareSaasConfigured(): boolean {
  return Boolean(
    env.CLOUDFLARE_API_TOKEN &&
      env.CLOUDFLARE_ZONE_ID &&
      env.CLOUDFLARE_SAAS_FALLBACK_HOSTNAME
  );
}

/** The CNAME target partners point their domain at. */
export function cloudflareSaasFallbackHostname(): string | null {
  return env.CLOUDFLARE_SAAS_FALLBACK_HOSTNAME ?? null;
}

async function cfFetch<T>(
  path: string,
  init: RequestInit & { method: string }
): Promise<CfEnvelope<T>> {
  const token = env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new CloudflareError("CLOUDFLARE_API_TOKEN is not set", 500);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      // Never cache control-plane calls.
      cache: "no-store",
    });
  } catch (e) {
    throw new CloudflareError(
      `Cloudflare API request failed: ${String(e)}`,
      502
    );
  }

  let body: CfEnvelope<T> | null = null;
  try {
    body = (await res.json()) as CfEnvelope<T>;
  } catch {
    /* non-JSON body (rare) — handled below */
  }

  if (!res.ok || !body?.success) {
    const msg =
      body?.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") ||
      `Cloudflare API returned HTTP ${res.status}`;
    throw new CloudflareError(msg, res.status, body?.errors);
  }

  return body;
}

function zonePath(): string {
  const zone = env.CLOUDFLARE_ZONE_ID;
  if (!zone) throw new CloudflareError("CLOUDFLARE_ZONE_ID is not set", 500);
  return `/zones/${zone}/custom_hostnames`;
}

/**
 * Create a custom hostname for a partner domain. Cloudflare provisions a DV
 * certificate; `ssl.method: "http"` means Cloudflare validates over HTTP once
 * the partner's CNAME resolves to our zone — no extra TXT record needed in the
 * common case. Returns the created record (store `id` on the profile).
 */
export async function createCustomHostname(
  hostname: string
): Promise<CfCustomHostname> {
  const body = await cfFetch<CfCustomHostname>(zonePath(), {
    method: "POST",
    body: JSON.stringify({
      hostname,
      ssl: {
        method: "http",
        type: "dv",
        settings: { min_tls_version: "1.2" },
        // Bundle intermediate certs for broad client compatibility.
        bundle_method: "ubiquitous",
      },
    }),
  });
  return body.result;
}

/** Fetch current status of a custom hostname (poll for ssl.status === "active"). */
export async function getCustomHostname(
  id: string
): Promise<CfCustomHostname> {
  const body = await cfFetch<CfCustomHostname>(`${zonePath()}/${id}`, {
    method: "GET",
  });
  return body.result;
}

/**
 * Delete a custom hostname (on domain change / tenant teardown). Idempotent:
 * a 404/1436 ("not found") is swallowed so cleanup never blocks the caller.
 */
export async function deleteCustomHostname(id: string): Promise<void> {
  try {
    await cfFetch<{ id: string }>(`${zonePath()}/${id}`, { method: "DELETE" });
  } catch (e) {
    if (e instanceof CloudflareError && (e.status === 404 || e.status === 400)) {
      return; // already gone — treat as success
    }
    throw e;
  }
}
