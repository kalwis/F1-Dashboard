import React from 'react';
import DashboardCard from '../layout/DashboardCard';

export default function VisualSummary({ driverComparison, constructorComparison }) {
  return (
    <div className="col-span-1 md:col-span-2">
      <DashboardCard title="📊 Visual Summary">
        {(driverComparison || constructorComparison) ? (
          <div className="min-h-64 flex items-center justify-center text-white">
            <div className="text-center w-full max-w-2xl">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Comparison Summary
              </h3>
              {driverComparison && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                      <div className="text-sm text-white/80 mb-1">Driver 1 Elo</div>
                      <div className="text-2xl font-bold text-blue-300">{Math.round(driverComparison.driver1.elo)}</div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 rounded-lg p-4">
                      <div className="text-sm text-white/80 mb-1">Driver 2 Elo</div>
                      <div className="text-2xl font-bold text-red-300">{Math.round(driverComparison.driver2.elo)}</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4">
                    <div className="text-lg font-bold">
                      {driverComparison.driver1.elo > driverComparison.driver2.elo 
                        ? `🏆 ${driverComparison.driver1.first_name} ${driverComparison.driver1.last_name} leads by ${Math.round(driverComparison.driver1.elo - driverComparison.driver2.elo)} Elo points`
                        : `🏆 ${driverComparison.driver2.first_name} ${driverComparison.driver2.last_name} leads by ${Math.round(driverComparison.driver2.elo - driverComparison.driver1.elo)} Elo points`
                      }
                    </div>
                  </div>
                </div>
              )}
              {constructorComparison && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 rounded-lg p-4">
                      <div className="text-sm text-white/80 mb-1">Constructor 1 Elo</div>
                      <div className="text-2xl font-bold text-green-300">{Math.round(constructorComparison.constructor1.elo)}</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-lg p-4">
                      <div className="text-sm text-white/80 mb-1">Constructor 2 Elo</div>
                      <div className="text-2xl font-bold text-purple-300">{Math.round(constructorComparison.constructor2.elo)}</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4">
                    <div className="text-lg font-bold">
                      {constructorComparison.constructor1.elo > constructorComparison.constructor2.elo 
                        ? `🏆 ${constructorComparison.constructor1.name} leads by ${Math.round(constructorComparison.constructor1.elo - constructorComparison.constructor2.elo)} Elo points`
                        : `🏆 ${constructorComparison.constructor2.name} leads by ${Math.round(constructorComparison.constructor2.elo - constructorComparison.constructor1.elo)} Elo points`
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-64 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl flex items-center justify-center">
            <div className="text-center text-white/60">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-medium mb-2">No Comparison Selected</div>
              <div className="text-sm">Select drivers or constructors above to see comparison summary</div>
            </div>
          </div>
        )}
        <p className="text-sm text-white/60 mt-4 text-center">
          Summary showing the relative performance of selected drivers or constructors across key metrics.
          Supports side-by-side visual inspection with enhanced UI design.
        </p>
      </DashboardCard>
    </div>
  );
}

