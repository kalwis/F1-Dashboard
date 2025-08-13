import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaTrophy, FaChartLine, FaBalanceScale, FaArrowRight } from 'react-icons/fa';
import Hyperspeed from '../blocks/Backgrounds/Hyperspeed/Hyperspeed';

export default function WelcomePage() {
  const features = [
    {
      icon: FaTachometerAlt,
      title: " Dashboard",
      description: "Live F1 data and statistics at your fingertips"
    },
    {
      icon: FaTrophy,
      title: "Driver Rankings",
      description: "Comprehensive driver and constructor standings"
    },
    {
      icon: FaChartLine,
      title: "Predictions",
      description: "Machine Learning algorithm race predictions and analysis"
    },
    {
      icon: FaBalanceScale,
      title: "Compare Drivers",
      description: "Side-by-side driver performance comparisons"
    }
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Hyperspeed />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block text-red-500">F1 Dashboard</span></h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Experience Formula 1 like never before with real-time data, 
              advanced analytics, and Machine Learning predictions
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/dashboard"
                className="group bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Get Started</span>
                <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/rankings"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-black transition-all duration-200 flex items-center space-x-2"
              >
                <span>View Rankings</span>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            Powered by real-time F1 data • Updated automatically
          </p>
        </div>
      </div>
    </div>
  );
}