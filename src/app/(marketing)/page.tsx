import { HeroConsole } from "@/components/home/HeroConsole";
import { ImpactStrip } from "@/components/home/ImpactStrip";
import { ServiceRail } from "@/components/home/ServiceRail";
import { LaunchPath } from "@/components/home/LaunchPath";
import { IncomeDesigner } from "@/components/home/IncomeDesigner";
import { NetworkLadder } from "@/components/home/NetworkLadder";
import { ProofLoop } from "@/components/home/ProofLoop";
import { TrustVault } from "@/components/home/TrustVault";
import { BharatGrid } from "@/components/home/BharatGrid";
import { PlansBoard } from "@/components/home/PlansBoard";
import { AnswerDesk } from "@/components/home/AnswerDesk";
import { ClosingSlab } from "@/components/home/ClosingSlab";
import { TenantHomePage } from "@/components/home/TenantHomePage";
import { getTenantBrand } from "@/lib/tenant/context";

/**
 * BankingPoint24 home — "One counter. Sixty ways to earn."
 *
 * When a white-label tenant domain is detected, renders a partner-branded
 * landing page instead of the native BankingPoint24 home page.
 *
 * Native flow: hero (counter receipt proves the earnings) → services catalogue →
 * network numbers → income calculator → network ladder → how-to-start path →
 * compliance vault → partner stories → pricing → India reach → FAQs →
 * closing CTA.
 */
export default async function HomePage() {
  const brand = await getTenantBrand();

  if (brand) return <TenantHomePage brand={brand} />;

  return (
    <>
      <HeroConsole />
      <ServiceRail />
      <ImpactStrip />
      <IncomeDesigner />
      <NetworkLadder />
      <LaunchPath />
      <TrustVault />
      <ProofLoop />
      <PlansBoard />
      <BharatGrid />
      <AnswerDesk />
      <ClosingSlab />
    </>
  );
}
