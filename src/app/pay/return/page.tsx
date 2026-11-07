import { Suspense } from "react";
import { Logo } from "@/components/layout/Logo";
import ReturnRedirect from "./ReturnRedirect";

export const metadata = {
  title: "Payment Return | BankingPoint-24",
  robots: "noindex",
};

export default function PayReturnPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 py-12">
      <Logo variant="dark" size="md" className="mb-8" />
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        }
      >
        <ReturnRedirect />
      </Suspense>
    </main>
  );
}
