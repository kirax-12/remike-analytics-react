import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  sub: ReactNode
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-sub">{sub}</p>
    </div>
  )
}
