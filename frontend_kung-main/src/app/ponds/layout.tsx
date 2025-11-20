'use client'

import { ReactNode } from 'react'
import RouteGuard from '@/components/RouteGuard'

interface PondsLayoutProps {
  children: ReactNode
}

export default function PondsLayout({ children }: PondsLayoutProps) {
  return (
    <RouteGuard requireAuth={true}>
      {children}
    </RouteGuard>
  )
}
