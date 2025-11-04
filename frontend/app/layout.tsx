import React from 'react'
import './globals.css'

export const metadata = {
  title: 'PIFSES - Predictive Inventory Forecaster',
  description: 'AI-powered inventory forecasting for e-commerce sellers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
