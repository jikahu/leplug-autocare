import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/register-form";

export const metadata: Metadata = {
  title: "Create Account — LePlug Autocare",
  description: "Create a LePlug Autocare account.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-heading text-3xl font-black text-tarmac">Create Account</h1>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </main>
  );
}
