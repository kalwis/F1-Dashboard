import React from "react";
import DashboardCard from '../components/DashboardCard';

export default function ComparePage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-8">

      {/* Driver vs Driver Comparison - F8 */}
      <DashboardCard title="Driver Comparison">
        <div className="flex justify-between gap-4 mb-2">
          <select className="text-sm p-2 border rounded w-full" disabled>
            <option>Select Driver A</option>
          </select>
          <select className="text-sm p-2 border rounded w-full" disabled>
            <option>Select Driver B</option>
          </select>
        </div>
        <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          [Side-by-side metrics: Elo, win %, avg Elo, fastest lap]
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This section compares two drivers using Elo and key stats. Matches requirement F8 and supports NF1 usability.
        </p>
      </DashboardCard>

      {/* Constructor vs Constructor Comparison - F8 */}
      <DashboardCard title="Constructor Comparison">
        <div className="flex justify-between gap-4 mb-2">
          <select className="text-sm p-2 border rounded w-full" disabled>
            <option>Select Constructor A</option>
          </select>
          <select className="text-sm p-2 border rounded w-full" disabled>
            <option>Select Constructor B</option>
          </select>
        </div>
        <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          [Side-by-side metrics: Elo, podium finishes, reliability score]
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Constructor-level comparison with performance stats. Aligned with F8 and focused on clear comparison UI.
        </p>
      </DashboardCard>

      {/* Visual Summary Bar Chart - F8 */}
      <div className="col-span-1 md:col-span-2">
        <DashboardCard title="Visual Summary">
          <div className="h-56 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            [Bar Chart: Metric-by-metric visual comparison]
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Summary bar chart showing the relative performance of selected drivers or constructors across key metrics.
            Supports side-by-side visual inspection. Meets F8, NF1 (clarity), NF3 (responsive loading).
          </p>
        </DashboardCard>
      </div>

    </div>
  );
}
