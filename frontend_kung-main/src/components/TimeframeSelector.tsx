'use client'

import { useState } from 'react'
import styles from './TimeframeSelector.module.css'

export type TimeframeOption = '1D' | '7D' | '30D'

interface TimeframeSelectorProps {
  selectedTimeframe: TimeframeOption
  onTimeframeChange: (timeframe: TimeframeOption) => void
  disabled?: boolean
}

export default function TimeframeSelector({ 
  selectedTimeframe, 
  onTimeframeChange, 
  disabled = false 
}: TimeframeSelectorProps) {
  const timeframes: { value: TimeframeOption; label: string; hours: number }[] = [
    { value: '1D', label: '1 วัน', hours: 24 },
    { value: '7D', label: '7 วัน', hours: 168 },
    { value: '30D', label: '30 วัน', hours: 720 }
  ]


  return (
    <div 
      className={styles.timeframeSelector}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        margin: 0,
        padding: 0,
        position: 'relative',
        zIndex: 10
      }}
    >
      <div 
        className={styles.timeframeButtons}
        style={{
          display: 'flex',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '2px',
          gap: '2px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 11
        }}
      >
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.value}
            className={`${styles.timeframeButton} ${
              selectedTimeframe === timeframe.value ? styles.active : ''
            } ${disabled ? styles.disabled : ''}`}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: selectedTimeframe === timeframe.value ? '#f59e0b' : 'transparent',
              color: selectedTimeframe === timeframe.value ? '#ffffff' : '#64748b',
              fontFamily: 'Inter, Noto Sans Thai, sans-serif',
              fontSize: '12px',
              fontWeight: selectedTimeframe === timeframe.value ? 600 : 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '50px',
              textAlign: 'center',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.5 : 1,
              whiteSpace: 'nowrap',
              boxShadow: selectedTimeframe === timeframe.value ? '0 2px 4px rgba(245, 158, 11, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!disabled && selectedTimeframe !== timeframe.value) {
                e.currentTarget.style.backgroundColor = '#fef3c7'
                e.currentTarget.style.color = '#92400e'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && selectedTimeframe !== timeframe.value) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#64748b'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
            onClick={() => !disabled && onTimeframeChange(timeframe.value)}
            disabled={disabled}
          >
            {timeframe.label}
          </button>
        ))}
      </div>
    </div>
  )
}
