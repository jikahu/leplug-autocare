import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AccountNav } from "@/components/account/account-nav";
import { AccountAuthGuard } from "@/components/account/account-auth-guard";
import { ProfileForm } from "@/components/account/profile-form";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = {
  title: "Your Profile — LePlug Autocare",
  description: "Manage your LePlug Autocare profile and saved addresses.",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Profile" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Your Profile</h1>
      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        <AccountNav />
        <div className="flex-1 space-y-8">
          <AccountAuthGuard>
            <ProfileForm />
            <AddressManager />
          </AccountAuthGuard>
        </div>
      </div>
    </main>
  );
}
