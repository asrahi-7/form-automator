import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "./LoginButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          Google Form Automator
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Securely automate and schedule your recurring Google Form submissions.
        </p>
        <LoginButton />
      </div>
    </main>
  );
}