'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, TrendingUp, Shield, Rocket } from 'lucide-react'
import Mascot from './components/Mascot'

export default function Home() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsLoading(true)
      setTimeout(() => {
        localStorage.setItem('user', email)
        router.push('/dashboard')
      }, 600)
    }
  }

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: '85% accuracy AI predictions in real-time' },
    { icon: TrendingUp, title: 'Smart Insights', desc: 'Prevent stockouts before they happen' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade infrastructure' },
    { icon: Rocket, title: 'Scale Instantly', desc: 'From solo seller to enterprise' }
  ]

  return (
    <main className='min-h-screen bg-black text-white overflow-hidden'>
      {/* Animated background gradient */}
      <div className='fixed inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-black via-black to-green-900 opacity-50'></div>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob'></div>
        <div className='absolute top-0 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000'></div>
        <div className='absolute bottom-0 left-1/2 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000'></div>
      </div>

      {/* Navbar */}
      <nav className='relative z-40 backdrop-blur-md bg-black/30 border-b border-green-500/20 sticky top-0'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-4'>
            <Mascot hasAlerts={false} alertLevel="normal" />
            <div>
              <h1 className='text-3xl font-black bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent'>PIFSES</h1>
              <p className='text-xs text-gray-400'>AI Inventory Intelligence</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className='px-6 py-2 bg-green-600 text-black font-bold rounded-lg hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/50'
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative z-20 max-w-7xl mx-auto px-6 py-32 text-center'>
        <div className='space-y-6 animate-fadeIn'>
          <div className='inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-4'>
            <span className='text-green-400 font-semibold text-sm'>✨ AI-Powered Inventory Intelligence</span>
          </div>
          
          <h2 className='text-6xl lg:text-7xl font-black leading-tight'>
            Never Miss a <span className='bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent'>Sale Again</span>
          </h2>
          
          <p className='text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
            Predict demand with 85% accuracy. Automate reorders. Scale your e-commerce business with AI-powered inventory forecasting.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center pt-8'>
            <button 
              onClick={() => setShowModal(true)}
              className='group px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-black font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105'
            >
              Get Started Free
              <span className='inline-block ml-2 group-hover:translate-x-1 transition-transform'>→</span>
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className='px-8 py-4 border-2 border-green-500 text-green-400 font-bold text-lg rounded-lg hover:bg-green-500/10 transition-all duration-300'
            >
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='relative z-20 max-w-7xl mx-auto px-6 py-20'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div 
                key={i}
                className='group p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-2xl hover:border-green-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/20'
              >
                <Icon className='w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition-transform' />
                <h3 className='text-xl font-bold mb-2'>{feature.title}</h3>
                <p className='text-gray-400 text-sm'>{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Login Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
          <div className='bg-gradient-to-br from-gray-900 to-black border border-green-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-green-500/20 animate-slideUp'>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-black bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2'>
                Login to PIFSES
              </h2>
              <p className='text-gray-400 text-sm'>Join thousands of e-commerce sellers</p>
            </div>

            <form onSubmit={handleLogin} className='space-y-4'>
              <div>
                <label className='block mb-2 font-semibold text-sm text-green-400'>Email Address</label>
                <input 
                  type='email' 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-3 bg-gray-900 border-2 border-green-500/30 text-white rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder-gray-600'
                  placeholder='your@email.com'
                  required
                />
              </div>

              <button 
                type='submit'
                disabled={isLoading}
                className='w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105'
              >
                {isLoading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <div className='w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin'></div>
                    Logging in...
                  </span>
                ) : (
                  'Continue →'
                )}
              </button>

              <button 
                type='button' 
                onClick={() => setShowModal(false)}
                className='w-full py-2 text-gray-400 hover:text-green-400 transition-colors text-sm'
              >
                Close
              </button>
            </form>

            <p className='text-center text-gray-500 text-xs mt-6'>
              By signing in, you agree to our Terms of Service
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </main>
  )
}
