import type { Metadata } from "next";
import Link from "next/link";
import { LoginChoiceButtons } from "@/components/auth/LoginChoiceButtons";
import HelpLayout from "@/components/HelpLayout";
import { getCurrentUser } from "@/lib/auth";
import { isSafeRelativePath } from "@/lib/oauth/state";

export const metadata: Metadata = {
  title: "Prisijungimas",
};

interface PageProps {
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { returnTo } = await searchParams;
  const safeReturnTo =
    returnTo && isSafeRelativePath(returnTo) ? returnTo : "/";
  const user = await getCurrentUser();

  return (
    <HelpLayout>
      <div className="mx-auto flex max-w-sm flex-col items-center gap-6 rounded-xl border border-border bg-background p-8 text-center shadow-sm">
        {user ? (
          <>
            <h1 className="text-xl font-semibold">
              Jau esi prisijungęs kaip {user.username ?? user.name}
            </h1>
            <Link
              href={safeReturnTo}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Grįžti atgal
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Prisijungimas</h1>
            <p className="text-sm text-muted-foreground">
              Pasirink, kaip nori prisijungti prie openmap.lt.
            </p>
            <LoginChoiceButtons returnTo={safeReturnTo} />
          </>
        )}
      </div>
    </HelpLayout>
  );
}
