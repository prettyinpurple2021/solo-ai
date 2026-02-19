export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-neon-purple border-r-neon-cyan mx-auto mb-4"></div>
        <h2 className="text-xl font-bold font-orbitron uppercase tracking-wider text-white mb-2">Loading SoloSuccess AI</h2>
        <p className="text-gray-300 font-mono">Please wait while we set up your experience...</p>
      </div>
    </div>
  );
}
