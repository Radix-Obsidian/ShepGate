import { DashboardLayout } from '@/components/layout';

export default function ApprovalsPage() {
  return (
    <DashboardLayout title="Approvals">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
          <p className="text-gray-400 mt-1">Review and approve risky actions requested by AI agents</p>
        </div>

        {/* Empty state */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">All clear!</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No pending approvals. When an AI agent requests a risky action, it will appear here for your review.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h4 className="text-white font-medium mb-4">How Approvals Work</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center text-sm font-medium shrink-0">1</div>
              <div>
                <p className="text-white text-sm font-medium">Agent requests action</p>
                <p className="text-gray-500 text-xs mt-1">AI calls a tool marked as &quot;needs approval&quot;</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-900/50 text-yellow-400 flex items-center justify-center text-sm font-medium shrink-0">2</div>
              <div>
                <p className="text-white text-sm font-medium">Review here</p>
                <p className="text-gray-500 text-xs mt-1">See the tool, arguments, and agent details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-900/50 text-green-400 flex items-center justify-center text-sm font-medium shrink-0">3</div>
              <div>
                <p className="text-white text-sm font-medium">Approve or deny</p>
                <p className="text-gray-500 text-xs mt-1">Action executes only after your approval</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
