"use client";

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
    >
      <LogIn className="h-4 w-4" />
      Connect Google Account
    </button>
  );
}