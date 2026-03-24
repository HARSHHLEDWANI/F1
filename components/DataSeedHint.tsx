"use client";

export default function DataSeedHint({
  title = "No data available",
  message = "Please populate the backend database and refresh.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-[40vh] bg-[#050508] text-white p-8 flex flex-col items-center justify-center text-center gap-4">
      <h2 className="text-3xl font-black">{title}</h2>
      <p className="text-gray-300 max-w-lg">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition"
        >
          Reload data
        </button>
      </div>
      <div className="text-left text-xs text-gray-400 bg-white/5 border border-white/10 rounded-xl p-4 mt-4 max-w-xl">
        <strong className="block text-sm mb-2">Run these backend scripts:</strong>
        <code className="block">cd backend</code>
        <code className="block">python populate_drivers.py</code>
        <code className="block">python populate_teams.py</code>
        <code className="block">python populate_circuit_stats.py</code>
        <code className="block">python populate_race_results.py</code>
      </div>
    </div>
  );
}
