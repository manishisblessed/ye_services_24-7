"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Save, AlertCircle, CheckCircle2, Rocket, RefreshCw, Copy, Check, Upload, Loader2, X } from "lucide-react";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "bankingpoint-24.com";
const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP ?? "13.55.164.240";
import { Globe, Headset, LockKey, PaintBrush, WifiHigh, Info } from "@phosphor-icons/react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { FloatingInput, Input, Label } from "@/components/ui/Input";
import { IconTile } from "@/components/ui/Icon";
import { EmptyState, FadeIn, SectionCard, StatusChip } from "@/components/dashboard/patterns";

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/svg+xml,image/webp";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type Profile = {
  brandName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  accentColor: string;
  supportEmail: string | null;
  supportPhone: string | null;
  customDomain: string | null;
  status: string;
  updatedAt?: string;
};

const EMPTY: Profile = {
  brandName: "",
  tagline: "",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#185df5",
  accentColor: "#f97606",
  supportEmail: "",
  supportPhone: "",
  customDomain: "",
  status: "DRAFT",
};

type DnsVerifyResult = {
  type: "customDomain";
  host: string;
  ok: boolean;
  resolved?: string[];
  expectedCname?: string;
  cnameMatches?: boolean;
  error?: string;
};

export default function WhitelabelPage() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"brand" | "dns">("brand");
  const [verifying, setVerifying] = useState(false);
  const [dnsResults, setDnsResults] = useState<DnsVerifyResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/platform/whitelabel");
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (res.ok && data.profile) setProfile({ ...EMPTY, ...data.profile });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function uploadImage(file: File, type: "logo" | "favicon") {
    if (!file.type.match(/^image\/(png|jpeg|svg\+xml|webp)$/)) {
      setError("Please choose a PNG, JPG, SVG, or WebP image.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Image must be under 2 MB.");
      return;
    }
    const setter = type === "logo" ? setUploadingLogo : setUploadingFavicon;
    setter(true);
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: `whitelabel-${type}`, isSensitive: false }),
      });
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { cloudName, apiKey, timestamp, signature, folder, type: uploadType } = await signRes.json();

      const form = new FormData();
      form.append("file", dataUrl);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);
      form.append("type", uploadType);

      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      if (!upRes.ok) throw new Error("Upload failed");
      const upData = await upRes.json();
      const url = upData.secure_url as string;
      set(type === "logo" ? "logoUrl" : "faviconUrl", url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setter(false);
    }
  }

  async function save(goLive?: boolean) {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body = {
        brandName: profile.brandName.trim(),
        tagline: profile.tagline?.trim() || null,
        logoUrl: profile.logoUrl?.trim() || null,
        faviconUrl: profile.faviconUrl?.trim() || null,
        primaryColor: profile.primaryColor,
        accentColor: profile.accentColor,
        supportEmail: profile.supportEmail?.trim() || null,
        supportPhone: profile.supportPhone?.trim() || null,
        customDomain: profile.customDomain?.trim().toLowerCase() || null,
        ...(goLive ? { status: "LIVE" as const } : {}),
      };
      const res = await fetch("/api/platform/whitelabel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Check the highlighted fields and try again");
      }
      setProfile({ ...EMPTY, ...data.profile });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (forbidden) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Partner Hub" title="White-label portal" description="Run the platform under your own brand." />
        <EmptyState
          bordered
          icon={LockKey}
          tone="amber"
          title="White-label is for Master & Super Distributors"
          description={
            <>
              This feature is available to <strong>Master Distributor</strong> and <strong>Super Distributor</strong> accounts.
              Contact your upline to upgrade.
            </>
          }
        />
      </div>
    );
  }

  async function verifyDns() {
    setVerifying(true);
    setDnsResults([]);
    try {
      const res = await fetch("/api/platform/whitelabel/verify-domain", { method: "POST" });
      const data = await res.json();
      setDnsResults(data.results ?? []);
    } finally {
      setVerifying(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const canSave = profile.brandName.trim().length >= 2 && !saving && !loading;
  const canGoLive = canSave && Boolean(profile.customDomain?.trim());
  const previewHost = profile.customDomain?.trim() || "yourdomain.com";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Partner Hub"
        title="White-label portal"
        description="Run the platform under your own brand, domain and colors."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip
              status={profile.status}
              label={profile.status === "LIVE" ? "Live" : profile.status === "SUSPENDED" ? "Suspended" : "Draft"}
            />
            <Button variant="secondary" onClick={() => save()} disabled={!canSave}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save draft"}
            </Button>
            {profile.status !== "LIVE" && (
              <Button onClick={() => save(true)} disabled={!canGoLive}>
                <Rocket className="h-4 w-4" /> Go live
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-ink-100 p-1 w-fit">
        {(["brand", "dns"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab ? "bg-white text-ink-900 shadow-soft" : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {tab === "brand" ? "Brand & Domains" : "DNS & Verification"}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-inset ring-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {saved && !error && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Profile saved.
        </div>
      )}

      {/* ── DNS & Verification tab ──────────────────────────────── */}
      {activeTab === "dns" && (
        <div className="space-y-6">
          {/* Custom domain setup guide */}
          <SectionCard
            icon={<IconTile icon={Globe} tone="accent" size="sm" />}
            title="Custom domain setup"
            description="Point your domain to our server using an A record. Works with Cloudflare, GoDaddy, Namecheap, BigRock, etc."
          >
            <ol className="space-y-4 text-sm text-ink-700">
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</span>
                <div>
                  <p className="font-semibold text-ink-900">Log in to your domain registrar / DNS provider</p>
                  <p className="text-ink-500 mt-0.5">Go to your DNS settings (Records section).</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">2</span>
                <div>
                  <p className="font-semibold text-ink-900">Add two A records — one for root, one for www</p>
                  <div className="mt-2 overflow-x-auto rounded-xl border border-ink-200 bg-white">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-ink-100 bg-ink-50">
                          <th className="px-4 py-2 text-left font-semibold text-ink-600">Type</th>
                          <th className="px-4 py-2 text-left font-semibold text-ink-600">Name / Host</th>
                          <th className="px-4 py-2 text-left font-semibold text-ink-600">Value / IPv4</th>
                          <th className="px-4 py-2 text-left font-semibold text-ink-600">Proxy / TTL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-50">
                        <tr>
                          <td className="px-4 py-2.5 font-mono font-semibold text-emerald-700">A</td>
                          <td className="px-4 py-2.5 font-mono font-semibold">@ (root)</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-ink-900">{SERVER_IP}</code>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(SERVER_IP)}
                                className="rounded p-0.5 text-ink-400 hover:text-ink-700"
                                title="Copy IP"
                              >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-ink-500">Proxied · Auto</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-mono font-semibold text-emerald-700">A</td>
                          <td className="px-4 py-2.5 font-mono font-semibold">www</td>
                          <td className="px-4 py-2.5">
                            <code className="font-mono text-ink-900">{SERVER_IP}</code>
                          </td>
                          <td className="px-4 py-2.5 text-ink-500">Proxied · Auto</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    <strong className="text-ink-700">Using Cloudflare?</strong> Enable the orange cloud (Proxy) — this gives you free SSL/HTTPS automatically. No certificate setup needed.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">3</span>
                <div>
                  <p className="font-semibold text-ink-900">Wait for DNS propagation</p>
                  <p className="text-ink-500 mt-0.5">With Cloudflare proxy, usually <strong className="text-ink-700">5–15 minutes</strong>. Without proxy, up to 48 hours.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">4</span>
                <div>
                  <p className="font-semibold text-ink-900">Contact us to activate your portal</p>
                  <p className="text-ink-500 mt-0.5">Once DNS is set, our team will verify and activate your portal. Your branded site will then be live at <span className="font-mono text-ink-700">{profile.customDomain?.trim() || "yourdomain.com"}</span>.</p>
                </div>
              </li>
            </ol>
          </SectionCard>

          {/* DNS verifier */}
          <SectionCard
            icon={<IconTile icon={WifiHigh} tone="royal" size="sm" />}
            title="Verify propagation"
            description="Check if your domain is resolving correctly."
          >
            <Button variant="secondary" onClick={verifyDns} disabled={verifying || !profile.customDomain}>
              <RefreshCw className={`h-4 w-4 ${verifying ? "animate-spin" : ""}`} />
              {verifying ? "Checking…" : "Check DNS now"}
            </Button>
            {!profile.customDomain && (
              <p className="mt-3 text-sm text-ink-400 flex items-center gap-1.5">
                <Info size={14} /> Save a custom domain first.
              </p>
            )}
            {dnsResults.length > 0 && (
              <div className="mt-4 space-y-3">
                {dnsResults.map((r) => (
                  <div
                    key={r.host}
                    className={`rounded-2xl border p-4 ${
                      r.ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {r.ok ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      )}
                      <span className="font-mono text-sm font-semibold">{r.host}</span>
                      <span className={`text-xs font-semibold ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
                        {r.ok ? "Propagated ✓" : "Not yet propagated"}
                      </span>
                    </div>
                    {r.resolved && r.resolved.length > 0 && (
                      <p className="text-xs text-ink-600">Resolved to: {r.resolved.join(", ")}</p>
                    )}
                    {r.expectedCname && (
                      <p className="text-xs text-ink-600">
                        Expected CNAME target: <code>{r.expectedCname}</code>
                        {r.cnameMatches === false && " — CNAME not matching yet"}
                      </p>
                    )}
                    {r.error && <p className="text-xs text-rose-600 mt-1">{r.error}</p>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === "brand" && <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard
            icon={<IconTile icon={PaintBrush} tone="royal" size="sm" />}
            title="Brand identity"
            description="Name, tagline, colours and logo your network will see."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FloatingInput label="Brand name *" value={profile.brandName} onChange={(e) => set("brandName", e.target.value)} placeholder="KapoorPay" />
              <FloatingInput label="Tagline" value={profile.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} placeholder="Your own payments brand" />
              <div>
                <Label htmlFor="wl-primary">Primary color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="wl-primary"
                    type="color"
                    value={profile.primaryColor}
                    onChange={(e) => set("primaryColor", e.target.value)}
                    className="h-11 w-12 cursor-pointer rounded-2xl border border-ink-200 p-1"
                  />
                  <Input value={profile.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="font-mono uppercase" aria-label="Primary color hex" />
                </div>
              </div>
              <div>
                <Label htmlFor="wl-accent">Accent color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="wl-accent"
                    type="color"
                    value={profile.accentColor}
                    onChange={(e) => set("accentColor", e.target.value)}
                    className="h-11 w-12 cursor-pointer rounded-2xl border border-ink-200 p-1"
                  />
                  <Input value={profile.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="font-mono uppercase" aria-label="Accent color hex" />
                </div>
              </div>
              {/* Logo upload */}
              <div>
                <Label>Brand logo</Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f, "logo");
                    e.target.value = "";
                  }}
                />
                {profile.logoUrl ? (
                  <div className="mt-1 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.logoUrl} alt="Logo" className="h-12 w-12 rounded-xl border border-ink-200 object-contain bg-white p-1" />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                        {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Replace
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => set("logoUrl", null)}>
                        <X className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 w-full"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploadingLogo ? "Uploading…" : "Upload logo"}
                  </Button>
                )}
                <p className="mt-1 text-xs text-ink-400">PNG, SVG, or WebP · max 2 MB</p>
              </div>
              {/* Favicon upload */}
              <div>
                <Label>Favicon (icon)</Label>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f, "favicon");
                    e.target.value = "";
                  }}
                />
                {profile.faviconUrl ? (
                  <div className="mt-1 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.faviconUrl} alt="Favicon" className="h-10 w-10 rounded-lg border border-ink-200 object-contain bg-white p-0.5" />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon}>
                        {uploadingFavicon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Replace
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => set("faviconUrl", null)}>
                        <X className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 w-full"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={uploadingFavicon}
                  >
                    {uploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploadingFavicon ? "Uploading…" : "Upload favicon"}
                  </Button>
                )}
                <p className="mt-1 text-xs text-ink-400">PNG, SVG, or ICO · max 2 MB</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<IconTile icon={Globe} tone="brand" size="sm" />}
            title="Domain"
            description="Your own domain where the branded portal will be live."
          >
            <FloatingInput
              label="Custom domain"
              hint="Add your domain (e.g. www.master-india.com) and point its DNS to our server."
              value={profile.customDomain ?? ""}
              onChange={(e) => set("customDomain", e.target.value)}
              placeholder="www.master-india.com"
            />
            <p className="mt-2 text-xs text-ink-500">
              Go to the <button type="button" onClick={() => setActiveTab("dns")} className="font-semibold text-brand-600 hover:underline">DNS & Verification</button> tab for setup instructions.
            </p>
          </SectionCard>

          <SectionCard
            icon={<IconTile icon={Headset} tone="accent" size="sm" />}
            title="Support contact"
            description="Shown in the portal footer and on receipts."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FloatingInput label="Support email" value={profile.supportEmail ?? ""} onChange={(e) => set("supportEmail", e.target.value)} placeholder="hello@kapoorpay.in" />
              <FloatingInput label="Support phone (10 digits)" value={profile.supportPhone ?? ""} onChange={(e) => set("supportPhone", e.target.value)} placeholder="9876543210" maxLength={10} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <FadeIn>
            <SectionCard padding="none" eyebrow="Live preview" title={previewHost}>
              <div
                className="relative overflow-hidden p-6 text-white"
                style={{ background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.accentColor})` }}
              >
                <div className="grain pointer-events-none absolute inset-0 opacity-20" aria-hidden />
                <p className="relative text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">{profile.brandName || "Your brand"}</p>
                <p className="relative mt-3 font-display text-2xl font-semibold tracking-[-0.02em]">{profile.tagline || "Your tagline here"}</p>
                <p className="relative mt-1 text-sm text-white/85">60+ services · Pan-India · Built on BankingPoint24</p>
                <button type="button" className="relative mt-4 rounded-full bg-white px-4 py-1.5 text-sm font-semibold" style={{ color: profile.primaryColor }}>
                  Login
                </button>
              </div>
            </SectionCard>
          </FadeIn>

          <SectionCard tone="accent" padding="sm">
            <p className="text-sm text-ink-800">
              <strong className="font-semibold text-ink-900">Powered by BankingPoint24.</strong> Footer attribution is required on all white-labels.
            </p>
          </SectionCard>
        </div>
      </div>}
    </div>
  );
}
