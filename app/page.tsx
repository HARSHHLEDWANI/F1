import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16 pb-16">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-black"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                🏎️ F1 PREDICTOR
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-4">
                The Ultimate Formula 1 Experience
              </p>
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Explore teams, drivers, and legendary race tracks around the world. Predict race outcomes and analyze championship data with AI-powered insights.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/auth/signin"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/teams"
                  className="border-2 border-red-600 text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-600 hover:text-white transition-all"
                >
                  Explore Teams
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-black to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="bg-red-600/10 border border-red-600/50 rounded-xl p-8 hover:border-red-600 transition-all group">
                <div className="text-4xl mb-4">🏁</div>
                <h3 className="text-xl font-bold mb-3">Teams & Cars</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Discover all 10 F1 teams, their drivers, and cutting-edge cars competing in 2025.
                </p>
                <Link href="/teams" className="text-red-500 hover:text-red-400 font-semibold">
                  View Teams →
                </Link>
              </div>

              {/* Feature 2 */}
              <div className="bg-blue-600/10 border border-blue-600/50 rounded-xl p-8 hover:border-blue-600 transition-all group">
                <div className="text-4xl mb-4">🏎️</div>
                <h3 className="text-xl font-bold mb-3">Drivers</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Learn about every F1 driver, their statistics, wins, and championship achievements.
                </p>
                <Link href="/drivers" className="text-blue-500 hover:text-blue-400 font-semibold">
                  View Drivers →
                </Link>
              </div>

              {/* Feature 3 */}
              <div className="bg-green-600/10 border border-green-600/50 rounded-xl p-8 hover:border-green-600 transition-all group">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-bold mb-3">Race Tracks</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Explore iconic circuits worldwide with detailed track information and lap records.
                </p>
                <Link href="/tracks" className="text-green-500 hover:text-green-400 font-semibold">
                  View Tracks →
                </Link>
              </div>

              {/* Feature 4 */}
              <div className="bg-purple-600/10 border border-purple-600/50 rounded-xl p-8 hover:border-purple-600 transition-all group">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">Predictions</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Use AI-powered analysis to predict race outcomes and championship winners.
                </p>
                <Link href="/prediction" className="text-purple-500 hover:text-purple-400 font-semibold">
                  Make Predictions →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <p className="text-5xl font-bold text-red-600 mb-2">24</p>
                <p className="text-xl text-gray-400">Races in 2025</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-2">10</p>
                <p className="text-xl text-gray-400">Teams Competing</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600 mb-2">20</p>
                <p className="text-xl text-gray-400">Drivers on Grid</p>
              </div>
            </div>
          </div>
        </section>

        {/* About F1 Section */}
        <section className="py-20 bg-gradient-to-b from-gray-950 to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12">What is Formula 1?</h2>

            <div className="space-y-8">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">🏆</span> The Pinnacle of Motorsport
                </h3>
                <p className="text-gray-300 mb-4">
                  Formula 1 is the world's premier international auto racing competition, founded in 1950. It represents the highest level of single-seat motorsport racing in the world, featuring the fastest and most technologically advanced cars.
                </p>
                <p className="text-gray-300">
                  With 24 Grand Prix races across iconic circuits worldwide, F1 combines cutting-edge technology, strategic racing, and exceptional talent from around the globe. Every season, 10 teams with 20 drivers compete for the Driver's Championship and Constructor's Trophy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-600/10 border border-red-600/50 rounded-xl p-6">
                  <h4 className="text-xl font-bold mb-3">⚡ Speed & Performance</h4>
                  <p className="text-gray-300">F1 cars reach speeds over 350 km/h with incredible acceleration and aerodynamic technology.</p>
                </div>
                <div className="bg-blue-600/10 border border-blue-600/50 rounded-xl p-6">
                  <h4 className="text-xl font-bold mb-3">🔧 Innovation</h4>
                  <p className="text-gray-300">Teams push the boundaries of engineering with hybrid power units and advanced aerodynamics.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/teams" className="hover:text-red-500 transition">
                      Teams
                    </Link>
                  </li>
                  <li>
                    <Link href="/drivers" className="hover:text-red-500 transition">
                      Drivers
                    </Link>
                  </li>
                  <li>
                    <Link href="/tracks" className="hover:text-red-500 transition">
                      Tracks
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a
                      href="https://www.formula1.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-500 transition"
                    >
                      Official F1 Website
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://f1tv.formula1.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-500 transition"
                    >
                      F1 TV
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4">Connect</h4>
                <p className="text-gray-400 mb-4">Follow Formula 1 on social media for live updates and highlights.</p>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <p className="text-center text-gray-500 text-sm">
                © 2025 F1 Predictor. Educational use only. Not affiliated with Formula 1 or FIA.
              </p>
              <p className="text-center text-gray-600 text-xs mt-2">
                Formula 1, F1, and related marks are trademarks of Formula One Licensing B.V.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
