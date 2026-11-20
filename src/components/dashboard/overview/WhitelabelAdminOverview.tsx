"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Users, Globe, LayoutGrid, ArrowRight } from "lucide-react";
import {
  UsersThree,
  Crown,
  TreeStructure,
  Storefront,
  UserCirclePlus,
  MapTrifold,
  ChartBar,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatSkeleton } from "@/components/ui/Skeleton";
import { GreetingBand } from "@/components/dashboard/shell/GreetingBand";
import { QuickActions, type QuickAction } from "@/components/dashboard/shell/QuickActions";
import { Stagger, StaggerItem, FadeIn } from "@/components/dashboard/shell/Motion";
import type { Session } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";

type NetworkCounts = {
  sd: number;
  md: number;
  dt: number;
  rt: number;
  total: number;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Send Invites", href: "/dashboard/admin/invites", icon: UserCirclePlus, tone: "brand" },
  { label: "Members", href: "/dashboard/admin/users", icon: UsersThree, tone: "accent" },
  { label: "Network Map", href: "/dashboard/admin/network", icon: MapTrifold, tone: "royal" },
  { label: "Rate Schemes", href: "/dashboard/admin/schemes", icon: ChartBar, tone: "amber" },
];

export function WhitelabelAdminOverview({ session }: { session: Session }) {
  const [counts, setCounts] = useState<NetworkCounts | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?countOnly=true");
      if (res.ok) {
        const data = await res.json();
        const byCounts = {
          sd: data.byCounts?.SUPER_DISTRIBUTOR ?? 0,
          md: data.byCounts?.MASTER_DISTRIBUTOR ?? 0,
          dt: data.byCounts?.DISTRIBUTOR ?? 0,
          rt: data.byCounts?.RETAILER ?? 0,
          total: data.total ?? 0,
        };
        setCounts(byCounts);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  return (
    <div className="space-y-6">
      <GreetingBand
        name={session.name}
        eyebrow="Admin Console"
        subtitle={<span className="truncate">Network admin · {session.email}</span>}
        heroLabel="Total Members"
        heroValue={counts?.total ?? 0}
        heroHint={loading ? "Loading…" : `${formatNumber(counts?.total ?? 0)} registered members in your network`}
        loading={loading}
        chips={[
          { label: "Super Dist.", value: loading ? "…" : formatNumber(counts?.sd ?? 0), tone: "brand" },
          { label: "Master Dist.", value: loading ? "…" : formatNumber(counts?.md ?? 0), tone: "accent" },
          { label: "Distributors", value: loading ? "…" : formatNumber(counts?.dt ?? 0), tone: "royal" },
          { label: "Retailers", value: loading ? "…" : formatNumber(counts?.rt ?? 0), tone: "neutral" },
        ]}
        actions={
          <Link href="/dashboard/admin/invites">
            <Button size="sm" className="bg-white/[0.12] text-white hover:bg-white/[0.2] border border-white/20">
              <UserPlus className="h-3.5 w-3.5" />
              Send Invite
            </Button>
          </Link>
        }
      />

      <QuickActions actions={QUICK_ACTIONS} />

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StaggerItem>
              <StatCard
                label="Super Distributors"
                value={formatNumber(counts?.sd ?? 0)}
                delta="top-tier network"
                trend="up"
                icon={Crown}
                accent="brand"
                href="/dashboard/admin/users"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Master Distributors"
                value={formatNumber(counts?.md ?? 0)}
                delta="regional leads"
                trend="up"
                icon={TreeStructure}
                accent="accent"
                href="/dashboard/admin/users"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Distributors"
                value={formatNumber(counts?.dt ?? 0)}
                delta="area managers"
                trend="up"
                icon={Users}
                accent="violet"
                href="/dashboard/admin/users"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Retailers"
                value={formatNumber(counts?.rt ?? 0)}
                delta="active counters"
                trend="up"
                icon={Storefront}
                accent="emerald"
                href="/dashboard/admin/users"
              />
            </StaggerItem>
          </>
        )}
      </Stagger>

      <FadeIn delay={0.08}>
        <div className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
          <p className="text-sm font-bold text-ink-700 mb-4">Onboard your network</p>
          <p className="text-sm text-ink-500 mb-4">
            Start by inviting a Super Distributor. They will then onboard Master Distributors, who onboard Distributors, who onboard Retailers.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-ink-600 items-center mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">You (Admin)</span>
            <ArrowRight className="h-4 w-4 text-ink-300" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 font-semibold text-accent-700 ring-1 ring-inset ring-accent-200">Super Dist.</span>
            <ArrowRight className="h-4 w-4 text-ink-300" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-royal-50 px-3 py-1 font-semibold text-royal-700 ring-1 ring-inset ring-royal-200">Master Dist.</span>
            <ArrowRight className="h-4 w-4 text-ink-300" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">Distributor</span>
            <ArrowRight className="h-4 w-4 text-ink-300" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">Retailer</span>
          </div>
          <Link href="/dashboard/admin/invites">
            <Button size="sm">
              <UserPlus className="h-4 w-4" />
              Send first invite
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
