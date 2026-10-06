import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AutomationCard from "@/components/AutomationCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  // 1. Fetch imported forms
  const forms = await prisma.form.findMany({
    where: { userId: session.user?.id },
    orderBy: { lastFetchedAt: "desc" },
  });

  // 2. Fetch active automations
  const automations = await prisma.automation.findMany({
    where: { userId: session.user?.id },
    include: { form: true },
    orderBy: { createdAt: "desc" },
  });

  // 3. Count SUCCESS and FAILED executions from ExecutionLog table
  const successfulRuns = await prisma.executionLog.count({
    where: {
      automation: { userId: session.user?.id },
      status: "SUCCESS"
    }
  });

  const failedRuns = await prisma.executionLog.count({
    where: {
      automation: { userId: session.user?.id },
      status: "FAILED"
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {session.user?.name}</p>
          </div>
          <LogoutButton />
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Active Automations</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {automations.filter((a) => a.status !== 'DELETED').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Forms</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{forms.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Successful Runs</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">{successfulRuns}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Failed Runs</h3>
            <p className="text-2xl font-bold text-red-600 mt-2">{failedRuns}</p>
          </div>
        </div>

        {/* Automations List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Automations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automations.length === 0 ? (
              <p className="text-gray-500 text-sm">No automations configured yet.</p>
            ) : (
             automations.map((auto) => (
                <AutomationCard 
                  key={auto.id} 
                  automation={auto as any} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}