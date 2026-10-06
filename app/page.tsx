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

        {/* Automations List Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Automations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automations.length === 0 ? (
              <p className="text-gray-500 text-sm bg-white p-6 rounded-lg border border-gray-100">
                No automations configured yet.
              </p>
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

        {/* Form List Section (The missing piece!) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Imported Forms</h2>
            <Link 
              href="/dashboard/forms" 
              className="bg-[#673AB7] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5E35B1] transition-colors shadow-sm"
            >
              + Add New Form
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y">
            {forms.length === 0 ? (
              <p className="p-6 text-gray-500 text-sm">You haven't imported any forms yet.</p>
            ) : (
              forms.map((form) => (
                <div key={form.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900">{form.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{form.description || "No description"}</p>
                  </div>
                  <Link
                    href={`/dashboard/builder/${form.id}`}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Create Automation
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}