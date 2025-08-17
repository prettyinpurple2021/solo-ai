"use client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Simple sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"></div>
            <span className="font-bold text-lg">SoloBoss AI</span>
          </div>
          
          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <span>Dashboard</span>
            </a>
            <a href="/dashboard/slaylist" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <span>SlayList</span>
            </a>
            <a href="/dashboard/agents" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <span>AI Squad</span>
            </a>
            <a href="/dashboard/brand" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <span>Brand Studio</span>
            </a>
            <a href="/dashboard/focus" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <span>Focus Mode</span>
            </a>
            <a href="/dashboard/burnout" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <span>Burnout Shield</span>
            </a>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}