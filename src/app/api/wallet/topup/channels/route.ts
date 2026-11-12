import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { getPartner } from "@/lib/partners";
import { viableChannelHealth, hydrateHealthCache } from "@/lib/partners/viable-pg";
import { chagansConfigured, chagansChannelHealth, type ChagansChannelHealth } from "@/lib/partners/chagans-pg";
import { readGatewayHealth } from "@/lib/ops/telemetry";

/**
 * PG gateway channels + live health for the wallet "add money" selector.
 *
 * Returns the list of available PG gateways the user can pay through, each
 * flagged healthy/unhealthy so a down gateway is shown as unavailable. Both
 * Viable PG and Chagans PG channels are included when configured.
 */
export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

type ChannelEntry = {
  id: string;
  label: string;
  route: string;
  primary: boolean;
  healthy: boolean;
  detail?: string | null;
  checkedAt: string | null;
  maxAmount?: number;
};

export async function GET() {
  let user;
  try {
    user = await requireAuth();
    await enforceRateLimit(`wallet:topup:channels:${user.id}`, RATE_LIMITS.default);
  } catch (e) {
    return toErrorResponse(e);
  }

  const channels: ChannelEntry[] = [];

  // --------- Viable PG channels ---------
  const upi = getPartner("upi");
  if (upi.name === "VIABLE_PG") {
    try {
      hydrateHealthCache(await readGatewayHealth());
      const viable = await viableChannelHealth(false);
      for (const ch of viable) {
        channels.push({
          id: `viable:${ch.id}`,
          label: ch.label,
          route: ch.route,
          primary: ch.primary,
          healthy: ch.healthy,
          detail: ch.detail ?? null,
          checkedAt: ch.checkedAt ?? null,
        });
      }
    } catch {
      // Viable health-check failure — skip, Chagans channels still available.
    }
  }

  // --------- Chagans PG channels ---------
  if (chagansConfigured()) {
    const gateways = await chagansChannelHealth();
    for (const gw of gateways) {
      channels.push({
        id: `chagans:${gw.id}`,
        label: gw.label,
        route: gw.route,
        primary: gw.primary && channels.length === 0,
        healthy: gw.healthy,
        detail: gw.detail ?? null,
        checkedAt: new Date().toISOString(),
        maxAmount: gw.maxAmount,
      });
    }
  }

  // If no provider is live, mark the default
  if (channels.length > 0 && !channels.some((c) => c.primary)) {
    const first = channels.find((c) => c.healthy);
    if (first) first.primary = true;
  }

  return NextResponse.json({ provider: upi.name, channels });
}
