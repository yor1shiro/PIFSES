'use client'

import React, { useState, useEffect } from 'react'

interface MascotProps {
  hasAlerts?: boolean
  alertLevel?: 'normal' | 'warning' | 'critical'
}

export default function Mascot({ hasAlerts = false, alertLevel = 'normal' }: MascotProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Track mouse position for eye following effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mascotElement = document.getElementById('mascot-eye')
      if (mascotElement) {
        const rect = mascotElement.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setMousePos({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Calculate pupil position based on mouse
  const calculatePupilPos = () => {
    const eyeCenterX = 60
    const eyeCenterY = 60
    const maxDistance = 20
    const dx = mousePos.x - eyeCenterX
    const dy = mousePos.y - eyeCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    const pupilX = eyeCenterX + Math.cos(angle) * Math.min(distance / 5, maxDistance)
    const pupilY = eyeCenterY + Math.sin(angle) * Math.min(distance / 5, maxDistance)

    return { x: pupilX, y: pupilY }
  }

  const { x: pupilX, y: pupilY } = calculatePupilPos()

  // Determine colors based on alert level
  const getColors = () => {
    switch (alertLevel) {
      case 'critical':
        return {
          iris: '#ef4444',
          glow: '#dc2626',
          accent: '#991b1b',
          dataColor: '#fca5a5'
        }
      case 'warning':
        return {
          iris: '#f59e0b',
          glow: '#d97706',
          accent: '#b45309',
          dataColor: '#fcd34d'
        }
      default:
        return {
          iris: '#10b981',
          glow: '#059669',
          accent: '#047857',
          dataColor: '#6ee7b7'
        }
    }
  }

  const colors = getColors()

  return (
    <div id="mascot-eye" className="relative">
      <svg
        width="80"
        height="80"
        viewBox="0 0 120 120"
        className="drop-shadow-lg"
      >
        <defs>
          <radialGradient id="eyeGradient" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="70%" stopColor={colors.iris} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1f2937" stopOpacity="0.8" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="dataFlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
        </defs>

        {/* Outer glow effect */}
        <circle cx="60" cy="60" r="55" fill="none" stroke={colors.glow} strokeWidth="2" opacity="0.3" />

        {/* Main eye white */}
        <circle cx="60" cy="60" r="50" fill="url(#eyeGradient)" stroke={colors.iris} strokeWidth="2" />

        {/* Iris */}
        <circle cx="60" cy="60" r="35" fill={colors.iris} opacity="0.7" />

        {/* Data streams - circuit pattern */}
        <g fill="none" stroke={colors.dataColor} strokeWidth="1.5" opacity="0.6" filter="url(#dataFlow)">
          {/* Top left data stream */}
          <path d="M 20 20 Q 40 30, 50 45" strokeDasharray="5,5" />
          {/* Top right data stream */}
          <path d="M 100 20 Q 80 30, 70 45" strokeDasharray="5,5" />
          {/* Bottom left data stream */}
          <path d="M 20 100 Q 40 90, 50 75" strokeDasharray="5,5" />
          {/* Bottom right data stream */}
          <path d="M 100 100 Q 80 90, 70 75" strokeDasharray="5,5" />
        </g>

        {/* Pupil - follows mouse */}
        <circle
          cx={pupilX}
          cy={pupilY}
          r={12}
          fill="#000000"
          className="transition-all duration-200"
        />

        {/* Light reflection */}
        <circle cx={pupilX - 4} cy={pupilY - 4} r="4" fill="#ffffff" opacity="0.8" />

        {/* Alert indicator dots - shown when critical/warning */}
        {alertLevel !== 'normal' && (
          <>
            <circle cx="100" cy="20" r="6" fill={colors.glow} opacity="0.8" />
            <circle cx="100" cy="20" fill={colors.glow} opacity="0.4">
              <animate attributeName="r" values="6;12" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>

      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-gray-400 opacity-0 hover:opacity-100 transition-opacity">
        {alertLevel === 'critical' && '🚨 Critical Alert'}
        {alertLevel === 'warning' && '⚠️ Warning Alert'}
        {alertLevel === 'normal' && '✨ All Systems OK'}
      </div>
    </div>
  )
}
