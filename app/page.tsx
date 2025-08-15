export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-purple-600">
            SoloBoss AI
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Your AI-powered productivity platform
          </p>
          <div className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium">
            Coming Soon
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">Welcome to SoloBoss AI</h2>
          <p className="text-gray-700 mb-4">
            We're currently updating our platform to provide you with the best possible experience.
          </p>
          <p className="text-gray-700 mb-4">
            Please check back soon to access your AI-powered productivity tools.
          </p>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          © 2024 SoloBoss AI. All rights reserved.
        </div>
      </div>
    </div>
  )
}