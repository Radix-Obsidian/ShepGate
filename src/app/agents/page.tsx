import { DashboardLayout } from '@/components/layout';

export default function AgentsPage() {
  return (
    <DashboardLayout title="Agent Profiles">
      <div className="space-y-6">
        {/* Header with action */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Agent Profiles</h2>
            <p className="text-gray-400 mt-1">Manage AI agent access and permissions</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Create Profile
          </button>
        </div>

        {/* Agent list */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Host Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tools</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">Default Agent</p>
                    <p className="text-gray-500 text-sm">Default agent profile for development</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                    claude-desktop
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">0 tools</td>
                <td className="px-6 py-4 text-gray-400 text-sm">Just now</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Info section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h4 className="text-white font-medium mb-2">About Agent Profiles</h4>
          <p className="text-gray-400 text-sm">
            Agent profiles define what tools each AI agent can access. Create different profiles for different use cases - 
            for example, a "Read Only" profile for queries and a "Full Access" profile for operations.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
