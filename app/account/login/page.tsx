import type { Metadata } from "next";
import { LoginForm } from "@/components/account/login-form";

export const metadata: Metadata = {
  title: "Log In — LePlug Autocare",
  description: "Log in to your LePlug Autocare account.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-heading text-3xl font-black text-tarmac">Log In</h1>
      <div className="mt-6">
        <LoginForm />
      </div>
    </main>
  );
}
