import { DashboardLayout } from '@/components/layout';

export default function ActivityPage() {
  return (
    <DashboardLayout title="Activity">
      <div className="space-y-6">
        {/* Header with filters */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Activity Log</h2>
            <p className="text-gray-400 mt-1">Track all AI agent actions and tool calls</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All agents</option>
            </select>
            <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All statuses</option>
              <option>Success</option>
              <option>Failed</option>
              <option>Blocked</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            When AI agents call tools through ShepGate, all actions will be logged here with full details.
          </p>
        </div>

        {/* Legend */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h4 className="text-white font-medium mb-4">Status Legend</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-gray-400 text-sm">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-gray-400 text-sm">Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="text-gray-400 text-sm">Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-gray-400 text-sm">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-gray-400 text-sm">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-500"></span>
              <span className="text-gray-400 text-sm">Denied</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
