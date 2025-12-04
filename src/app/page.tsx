import { DashboardLayout } from '@/components/layout';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to ShepGate</h2>
          <p className="text-gray-400">
            The safe front door for AI tools. Manage your servers, agents, and approvals from here.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Servers" value="0" href="/servers" description="Connected tools" />
          <StatCard title="Agents" value="1" href="/agents" description="AI profiles" />
          <StatCard title="Pending" value="0" href="/approvals" description="Awaiting approval" />
          <StatCard title="Actions" value="0" href="/activity" description="Today's activity" />
        </div>

        {/* Quick actions */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/servers"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Server
            </Link>
            <Link
              href="/agents"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Create Agent Profile
            </Link>
            <Link
              href="/activity"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Activity Log
            </Link>
          </div>
        </div>

        {/* Getting started */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Getting Started</h3>
          <ol className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">1</span>
              <span><strong className="text-white">Add a Server</strong> - Connect an MCP server or HTTP API</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gray-700 text-white text-sm flex items-center justify-center">2</span>
              <span><strong className="text-white">Configure Tools</strong> - Set risk levels for each tool</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gray-700 text-white text-sm flex items-center justify-center">3</span>
              <span><strong className="text-white">Create Agent Profiles</strong> - Define permissions for AI agents</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gray-700 text-white text-sm flex items-center justify-center">4</span>
              <span><strong className="text-white">Connect Claude</strong> - Point your AI host to ShepGate</span>
            </li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ 
  title, 
  value, 
  href, 
  description 
}: { 
  title: string; 
  value: string; 
  href: string; 
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
    >
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </Link>
  );
}
