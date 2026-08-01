import type { Metadata } from "next";
import { AccountLinksPanel } from "@/components/account/AccountLinksPanel";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Prisijungimo būdai - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requireUser("/paskyra/prisijungimai");

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Prisijungimo būdai
      </h1>
      <AccountLinksPanel />
    </div>
  );
}
