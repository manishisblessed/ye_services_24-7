import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress, PageTransition } from "@/components/motion";
import { getTenantBrand } from "@/lib/tenant/context";

/**
 * Marketing shell.
 *
 * The navbar is a fixed floating island, so `main` intentionally carries NO
 * top padding — each page's first section owns it. `PageHero` ships with
 * `pt-28 md:pt-36`; the home hero must add the same on its first section.
 *
 * When a white-label tenant is detected, the Navbar uses the tenant's brand
 * and the Footer renders a streamlined partner version.
 */
export default async function MarketingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const brand = await getTenantBrand();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollProgress />
      <Navbar />
      <main id="main" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer brand={brand} />
    </div>
  );
}
