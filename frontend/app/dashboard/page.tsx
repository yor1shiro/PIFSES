'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertTriangle, Zap, DollarSign, LogOut, RefreshCw, Download, Bell, Settings, Target, TrendingDown, Clock, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Mascot from '../components/Mascot'

const mockDashboardData = {
  metrics: {
    totalProducts: 156,
    avgForecastAccuracy: 0.85,
    stockoutsPrevented: 24,
    revenueImpact: 45000,
    automatedReorders: 12,
    predictionConfidence: 0.92,
  },
  salesTrends: [
    { date: 'Jan 1', sales: 100, forecast: 105, actual: 102 },
    { date: 'Jan 2', sales: 110, forecast: 115, actual: 108 },
    { date: 'Jan 3', sales: 108, forecast: 110, actual: 112 },
    { date: 'Jan 4', sales: 115, forecast: 120, actual: 118 },
    { date: 'Jan 5', sales: 125, forecast: 130, actual: 128 },
    { date: 'Jan 6', sales: 135, forecast: 140, actual: 138 },
    { date: 'Jan 7', sales: 145, forecast: 150, actual: 148 },
  ],
  demandForecast: [
    { product: 'SKU-001', current: 45, forecast7d: 52, forecast30d: 180, trend: 'up' },
    { product: 'SKU-002', current: 60, forecast7d: 68, forecast30d: 220, trend: 'up' },
    { product: 'SKU-003', current: 35, forecast7d: 38, forecast30d: 150, trend: 'stable' },
    { product: 'SKU-004', current: 70, forecast7d: 75, forecast30d: 280, trend: 'up' },
  ],
  inventoryStatus: [
    { product: 'SKU-001', stock: 50, threshold: 30, demand: 45, days_of_stock: 1.1, reorder_point: 30, status: 'critical' },
    { product: 'SKU-002', stock: 25, threshold: 20, demand: 60, days_of_stock: 0.4, reorder_point: 60, status: 'critical' },
    { product: 'SKU-003', stock: 100, threshold: 40, demand: 35, days_of_stock: 2.9, reorder_point: 40, status: 'healthy' },
    { product: 'SKU-004', stock: 15, threshold: 25, demand: 70, days_of_stock: 0.2, reorder_point: 70, status: 'critical' },
  ],
  reorderWorkflows: [
    { id: 1, product: 'SKU-004', quantity: 200, supplier: 'AliExpress', eta: '2025-01-08', status: 'pending', priority: 'high' },
    { id: 2, product: 'SKU-002', quantity: 150, supplier: 'Alibaba', eta: '2025-01-10', status: 'confirmed', priority: 'high' },
    { id: 3, product: 'SKU-001', quantity: 100, supplier: 'Local Dist', eta: '2025-01-06', status: 'shipped', priority: 'medium' },
  ],
  anomalies: [
    { id: 1, product: 'SKU-002', type: 'Demand Spike', severity: 'high', date: '2025-01-05', confidence: 0.94 },
    { id: 2, product: 'SKU-004', type: 'Stockout Risk', severity: 'critical', date: '2025-01-04', confidence: 0.98 },
    { id: 3, product: 'SKU-003', type: 'Seasonal Pattern', severity: 'low', date: '2025-01-03', confidence: 0.87 },
  ],
  modelPerformance: [
    { name: 'ARIMA', accuracy: 82, mape: 18 },
    { name: 'LSTM', accuracy: 88, mape: 12 },
    { name: 'Ensemble', accuracy: 85, mape: 15 },
  ],
  channels: [
    { name: 'Shopify', revenue: 15000, orders: 240 },
    { name: 'Etsy', revenue: 12000, orders: 180 },
    { name: 'Amazon', revenue: 18000, orders: 320 },
  ],
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState(mockDashboardData)
  const [user, setUser] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'SKU-004 at critical stock level', severity: 'critical', time: '2 min ago' },
    { id: 2, message: 'Reorder shipped for SKU-001', severity: 'info', time: '1 hour ago' },
  ])
  const [showNewReorderModal, setShowNewReorderModal] = useState(false)
  const [newReorder, setNewReorder] = useState({ product: '', quantity: '', supplier: '', eta: '' })
  useEffect(() => {
    const userEmail = localStorage.getItem('user')
    if (!userEmail) {
      router.push('/')
    } else {
      setUser(userEmail)
    }
  }, [router])

  const handleLogout = async () => {
    localStorage.removeItem('user')
    setUser(null)
    await router.push('/')
  }

  const handleExport = () => {
    // Create CSV content
    const headers = ['Product', 'Stock', 'Threshold', 'Demand', 'Days of Stock', 'Reorder Point', 'Status']
    const rows = data.inventoryStatus.map(item => [
      item.product,
      item.stock,
      item.threshold,
      item.demand,
      item.days_of_stock.toFixed(1),
      item.reorder_point,
      item.status
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleRefresh = () => {
    // Simulate data refresh by updating metrics slightly
    setData({
      ...data,
      metrics: {
        ...data.metrics,
        totalProducts: data.metrics.totalProducts,
        avgForecastAccuracy: data.metrics.avgForecastAccuracy,
      }
    })
    console.log('Data refreshed')
  }

  const handleAddReorder = () => {
    if (newReorder.product && newReorder.quantity && newReorder.supplier && newReorder.eta) {
      const newWorkflow = {
        id: data.reorderWorkflows.length + 1,
        product: newReorder.product,
        quantity: parseInt(newReorder.quantity),
        supplier: newReorder.supplier,
        eta: newReorder.eta,
        status: 'pending',
        priority: 'high'
      }
      setData({
        ...data,
        reorderWorkflows: [...data.reorderWorkflows, newWorkflow]
      })
      setNewReorder({ product: '', quantity: '', supplier: '', eta: '' })
      setShowNewReorderModal(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'text-red-400'
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch(status) {
      case 'critical': return 'bg-red-900/30'
      case 'healthy': return 'bg-green-900/30'
      case 'warning': return 'bg-yellow-900/30'
      default: return 'bg-gray-900/30'
    }
  }

  // Determine mascot alert level based on critical issues
  const hasCriticalAlerts = data.anomalies.some(a => a.severity === 'critical') || 
                            data.inventoryStatus.some(i => i.status === 'critical')
  const hasWarningAlerts = data.anomalies.some(a => a.severity === 'high')
  const mascotAlertLevel: 'normal' | 'warning' | 'critical' = 
    hasCriticalAlerts ? 'critical' : hasWarningAlerts ? 'warning' : 'normal'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-emerald-500/20 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Mascot hasAlerts={hasCriticalAlerts || hasWarningAlerts} alertLevel={mascotAlertLevel} />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">PIFSES</h1>
              <p className="text-sm text-gray-400">AI-Powered Inventory Forecasting</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative group">
              <button className="p-2 hover:bg-emerald-900/30 rounded-lg transition-all relative">
                <Bell className="w-6 h-6 text-emerald-400" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-emerald-500/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-4 space-y-2">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-2 rounded text-sm ${notif.severity === 'critical' ? 'bg-red-900/30 text-red-300' : 'bg-emerald-900/30 text-emerald-300'}`}>
                    {notif.message}
                    <span className="text-xs text-gray-400 ml-2">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{user}</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-emerald-500/20 sticky top-[80px] z-40 bg-black/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {['overview', 'inventory', 'reorders', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-2 font-semibold transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-emerald-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Products" value={data.metrics.totalProducts} icon={<TrendingUp className="w-8 h-8" />} bgColor="bg-emerald-900/80" borderColor="border-emerald-500" />
              <MetricCard title="Forecast Accuracy" value={`${(data.metrics.avgForecastAccuracy * 100).toFixed(0)}%`} icon={<Target className="w-8 h-8" />} bgColor="bg-blue-900/80" borderColor="border-blue-500" />
              <MetricCard title="Stockouts Prevented" value={data.metrics.stockoutsPrevented} icon={<CheckCircle className="w-8 h-8" />} bgColor="bg-yellow-900/80" borderColor="border-yellow-500" />
              <MetricCard title="Revenue Impact" value={`$${(data.metrics.revenueImpact / 1000).toFixed(0)}K`} icon={<DollarSign className="w-8 h-8" />} bgColor="bg-pink-900/80" borderColor="border-pink-500" />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Automated Reorders" value={data.metrics.automatedReorders} icon={<RefreshCw className="w-6 h-6" />} bgColor="bg-purple-900/80" borderColor="border-purple-500" />
              <MetricCard title="Prediction Confidence" value={`${(data.metrics.predictionConfidence * 100).toFixed(0)}%`} icon={<Zap className="w-6 h-6" />} bgColor="bg-cyan-900/80" borderColor="border-cyan-500" />
              <MetricCard title="Model Ensemble" value="3 Models" icon={<TrendingUp className="w-6 h-6" />} bgColor="bg-orange-900/80" borderColor="border-orange-500" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Forecast Chart */}
              <div className="lg:col-span-2 bg-gray-900/70 border-2 border-emerald-500/60 rounded-xl p-6 hover:border-emerald-400 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-emerald-300">Sales Forecast vs Actual</h3>
                  <button onClick={handleRefresh} className="p-2 hover:bg-emerald-900/30 rounded">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="w-full" style={{ height: '350px', minHeight: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.salesTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{backgroundColor: '#111827', border: '2px solid #10b981'}} />
                      <Legend />
                      <Bar dataKey="sales" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                      <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Channel Revenue */}
              <div className="bg-gray-900/70 border-2 border-purple-500/60 rounded-xl p-6 hover:border-purple-400 transition-all">
                <h3 className="text-lg font-bold text-purple-300 mb-4">Revenue by Channel</h3>
                <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.channels} cx="50%" cy="50%" labelLine={false} label={({name, value}: any) => `${name}: $${(value as number)/1000}K`} outerRadius={80} fill="#8884d8" dataKey="revenue">
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${(value as number)/1000}K`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Model Performance */}
            <div className="bg-gray-900/70 border-2 border-cyan-500/60 rounded-xl p-6 hover:border-cyan-400 transition-all">
              <h3 className="text-lg font-bold text-cyan-300 mb-4">ML Model Performance (Ensemble Strategy)</h3>
              <div className="w-full" style={{ height: '250px', minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.modelPerformance} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" label={{value: 'Score (%)', angle: -90, position: 'insideLeft'}} />
                    <Tooltip contentStyle={{backgroundColor: '#111827', border: '2px solid #06b6d4'}} />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="mape" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channel Integration Status */}
            <div className="bg-gray-900/70 border-2 border-pink-500/60 rounded-xl p-6 hover:border-pink-400 transition-all">
              <h3 className="text-lg font-bold text-pink-300 mb-4">Multi-Channel Integration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.channels.map((channel) => (
                  <div key={channel.name} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-pink-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-pink-300">{channel.name}</h4>
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue:</span>
                        <span className="text-white font-semibold">${(channel.revenue / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Orders:</span>
                        <span className="text-white font-semibold">{channel.orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 font-semibold">Connected</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-emerald-300">Inventory Management</h2>
              <button onClick={handleExport} className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500 rounded-lg flex items-center gap-2 transition-all">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            <div className="grid gap-4">
              {data.inventoryStatus.map((item) => (
                <div key={item.product} className={`${getStatusBg(item.status)} border-l-4 ${item.status === 'critical' ? 'border-red-400' : 'border-green-400'} p-4 rounded-lg hover:shadow-lg transition-all`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.product}</h3>
                      <p className={`text-sm font-semibold ${getStatusColor(item.status)}`}>{item.status.toUpperCase()}</p>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>Days of Stock: <span className="text-white font-bold">{item.days_of_stock.toFixed(1)}</span></p>
                      <p>Reorder Point: <span className="text-white">{item.reorder_point}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-4 mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Current Stock: {item.stock} / Threshold: {item.threshold}</p>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${item.stock <= item.threshold ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${Math.min((item.stock / item.threshold) * 100, 100)}%`}}></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Daily Demand: {item.demand}</p>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{width: `${Math.min((item.demand / 100) * 100, 100)}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reorders Tab */}
        {activeTab === 'reorders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-cyan-300">Automated Reorder Workflows</h2>
              <button onClick={() => setShowNewReorderModal(true)} className="px-4 py-2 bg-cyan-600/80 hover:bg-cyan-500 rounded-lg flex items-center gap-2 transition-all">
                <Zap className="w-4 h-4" />
                New Reorder
              </button>
            </div>

            {/* Gantt Chart Timeline */}
            <div className="bg-gray-900/70 border-2 border-cyan-500/60 rounded-xl p-6 hover:border-cyan-400 transition-all">
              <h3 className="text-lg font-bold text-cyan-300 mb-6">Reorder Timeline (Gantt View)</h3>
              <div className="space-y-4">
                {data.reorderWorkflows.map((workflow) => {
                  const etaDate = new Date(workflow.eta)
                  const today = new Date()
                  const daysFromToday = Math.ceil((etaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const isOverdue = daysFromToday < 0
                  const progress = workflow.status === 'shipped' ? 100 : workflow.status === 'confirmed' ? 66 : 33
                  
                  return (
                    <div key={workflow.id} className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">{workflow.product} - {workflow.quantity} units</p>
                          <p className="text-xs text-gray-400">{workflow.supplier} | ETA: {workflow.eta}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isOverdue ? 'bg-red-600 text-red-200' : daysFromToday <= 3 ? 'bg-yellow-600 text-yellow-200' : 'bg-green-600 text-green-200'}`}>
                          {isOverdue ? `${Math.abs(daysFromToday)} days overdue` : `${daysFromToday} days left`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all ${workflow.status === 'shipped' ? 'bg-emerald-500' : workflow.status === 'confirmed' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{width: `${progress}%`}}
                        ></div>
                      </div>
                      <p className={`text-xs font-semibold mt-1 ${workflow.status === 'shipped' ? 'text-emerald-300' : workflow.status === 'confirmed' ? 'text-blue-300' : 'text-yellow-300'}`}>
                        {workflow.status === 'shipped' ? '✓ Shipped' : workflow.status === 'confirmed' ? '→ Confirmed' : '⏱ Pending'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4">
              {data.reorderWorkflows.map((workflow) => (
                <div key={workflow.id} className="bg-gradient-to-r from-gray-900 to-gray-800/50 border-2 border-cyan-500/40 rounded-lg p-6 hover:border-cyan-400 transition-all">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Product</p>
                      <p className="font-bold text-cyan-300">{workflow.product}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Quantity</p>
                      <p className="font-bold text-white">{workflow.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Supplier</p>
                      <p className="font-bold text-white">{workflow.supplier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">ETA</p>
                      <p className="font-bold text-white">{workflow.eta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Priority</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${workflow.priority === 'high' ? 'bg-red-900/80 text-red-300' : 'bg-yellow-900/80 text-yellow-300'}`}>
                        {workflow.priority.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${workflow.status === 'shipped' ? 'bg-green-900/80 text-green-300' : workflow.status === 'confirmed' ? 'bg-blue-900/80 text-blue-300' : 'bg-gray-700 text-gray-300'}`}>
                        {workflow.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-1">
                    <div className={`h-1 rounded-full transition-all ${workflow.status === 'shipped' ? 'w-full bg-emerald-500' : workflow.status === 'confirmed' ? 'w-2/3 bg-blue-500' : 'w-1/3 bg-gray-500'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-pink-300">Advanced Analytics & Anomaly Detection</h2>

            {/* Temporal Workflow Orchestration Status */}
            <div className="bg-gray-900/70 border-2 border-purple-500/60 rounded-xl p-6 hover:border-purple-400 transition-all">
              <h3 className="text-lg font-bold text-purple-300 mb-4">Active Workflows (Temporal Orchestration)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-sm text-purple-300 font-semibold mb-2">Total Active</p>
                  <p className="text-3xl font-bold text-white">{data.reorderWorkflows.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Workflows</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-sm text-yellow-300 font-semibold mb-2">Pending</p>
                  <p className="text-3xl font-bold text-white">{data.reorderWorkflows.filter(w => w.status === 'pending').length}</p>
                  <p className="text-xs text-gray-400 mt-1">Awaiting execution</p>
                </div>
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300 font-semibold mb-2">Confirmed</p>
                  <p className="text-3xl font-bold text-white">{data.reorderWorkflows.filter(w => w.status === 'confirmed').length}</p>
                  <p className="text-xs text-gray-400 mt-1">In progress</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-sm text-emerald-300 font-semibold mb-2">Completed</p>
                  <p className="text-3xl font-bold text-white">{data.reorderWorkflows.filter(w => w.status === 'shipped').length}</p>
                  <p className="text-xs text-gray-400 mt-1">Successfully executed</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demand Forecast */}
              <div className="bg-gray-900/70 border-2 border-pink-500/60 rounded-xl p-6 hover:border-pink-400 transition-all">
                <h3 className="text-lg font-bold text-pink-300 mb-4">Demand Forecast by SKU</h3>
                <div className="space-y-3">
                  {data.demandForecast.map((item) => (
                    <div key={item.product}>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-white">{item.product}</span>
                        <span className={`text-xs font-bold ${item.trend === 'up' ? 'text-green-400' : item.trend === 'down' ? 'text-red-400' : 'text-gray-400'} flex items-center gap-1`}>
                          {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} 7d: {item.forecast7d} | 30d: {item.forecast30d}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 mb-1">Current</div>
                          <div className="bg-gray-800 rounded h-6 flex items-center justify-center text-xs font-bold text-white">{item.current}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 mb-1">7-Day Forecast</div>
                          <div className="bg-cyan-900/50 border border-cyan-500 rounded h-6 flex items-center justify-center text-xs font-bold text-cyan-300">{item.forecast7d}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 mb-1">30-Day Forecast</div>
                          <div className="bg-blue-900/50 border border-blue-500 rounded h-6 flex items-center justify-center text-xs font-bold text-blue-300">{item.forecast30d}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomaly Detection */}
              <div className="bg-gray-900/70 border-2 border-red-500/60 rounded-xl p-6 hover:border-red-400 transition-all">
                <h3 className="text-lg font-bold text-red-300 mb-4">Anomaly Detection Alerts</h3>
                <div className="space-y-3">
                  {data.anomalies.map((anomaly) => (
                    <div key={anomaly.id} className={`${anomaly.severity === 'critical' ? 'bg-red-900/20 border-red-500' : 'bg-yellow-900/20 border-yellow-500'} border-l-4 p-3 rounded`}>
                      <div className="flex items-start gap-3 mb-1">
                        <AlertTriangle className={`w-4 h-4 mt-1 flex-shrink-0 ${anomaly.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                        <div className="flex-1">
                          <p className="font-bold text-white">{anomaly.product}: {anomaly.type}</p>
                          <p className="text-xs text-gray-400">{anomaly.date}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${anomaly.severity === 'critical' ? 'bg-red-600 text-red-200' : 'bg-yellow-600 text-yellow-200'}`}>
                          {anomaly.severity.toUpperCase()} ({(anomaly.confidence * 100).toFixed(0)}% confidence)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Reorder Modal */}
      {showNewReorderModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">Create New Reorder</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Product SKU</label>
                <input
                  type="text"
                  placeholder="e.g., SKU-001"
                  value={newReorder.product}
                  onChange={(e) => setNewReorder({...newReorder, product: e.target.value})}
                  className="w-full bg-gray-800 border border-cyan-500/30 text-white px-3 py-2 rounded-lg focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Quantity</label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  value={newReorder.quantity}
                  onChange={(e) => setNewReorder({...newReorder, quantity: e.target.value})}
                  className="w-full bg-gray-800 border border-cyan-500/30 text-white px-3 py-2 rounded-lg focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Supplier</label>
                <input
                  type="text"
                  placeholder="e.g., AliExpress"
                  value={newReorder.supplier}
                  onChange={(e) => setNewReorder({...newReorder, supplier: e.target.value})}
                  className="w-full bg-gray-800 border border-cyan-500/30 text-white px-3 py-2 rounded-lg focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">ETA (Date)</label>
                <input
                  type="date"
                  value={newReorder.eta}
                  onChange={(e) => setNewReorder({...newReorder, eta: e.target.value})}
                  className="w-full bg-gray-800 border border-cyan-500/30 text-white px-3 py-2 rounded-lg focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddReorder}
                className="flex-1 px-4 py-2 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-all"
              >
                Create Reorder
              </button>
              <button
                onClick={() => setShowNewReorderModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function MetricCard({ title, value, icon, bgColor, borderColor }: { title: string; value: string | number; icon: React.ReactNode; bgColor: string; borderColor: string }) {
  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-6`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase">{title}</h3>
        <div className="text-gray-300 opacity-60">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <div className="text-xs text-gray-400">+2.5% from last week</div>
    </div>
  )
}

