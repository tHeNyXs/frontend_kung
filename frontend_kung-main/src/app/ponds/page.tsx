'use client'

import { useRouter } from 'next/navigation'
import { usePonds, useDeletePond } from '@/hooks/use-ponds'
import { useLogout } from '@/hooks/use-auth'
import PushNotificationPermission from '@/components/PushNotificationPermission'
import AlertBadge from '@/components/AlertBadge'
import { useAuth } from '@/providers/auth-provider'

export default function ShrimpPondsPage() {
  const router = useRouter()
  const { data: ponds, isLoading, error } = usePonds()
  const deletePondMutation = useDeletePond()
  const logoutMutation = useLogout()
  const { user } = useAuth()

  const addPond = () => {
    router.push('/ponds/add')
  }

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const selectPond = (pondId: string) => {
    router.push(`/ponds/${pondId}`)
  }

  const deletePond = async (pondId: string, pondName: string) => {
    if (confirm(`Pond deleted successfully. "${pondName}"?`)) {
      try {
        await deletePondMutation.mutateAsync(pondId)
        alert('Are you sure you want to delete the pond?')
      } catch (error) {
        console.error('Error deleting pond:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error deleting pond.'
        alert(errorMessage)
      }
    }
  }


  if (isLoading) {
    return (
      <div className="shrimp-ponds-container">
        <div className="main-frame">
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Loading pond data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shrimp-ponds-container">
        <div className="main-frame">
          <div className="error-section">
            <p>Error loading pond data.</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shrimp-ponds-container">
      <div className="main-frame">
        {/* Push Notification Permission Modal */}
        <PushNotificationPermission 
          onPermissionGranted={() => {
            console.log('Push notification permission granted')
          }}
          onPermissionDenied={() => {
            console.log('Push notification permission denied')
          }}
        />
        
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="logout-button" onClick={handleLogout}>
              <span className="logout-text">Logout</span>
            </div>
            <div className="spacer"></div>
            <div className="add-button" onClick={addPond}>
              <div className="add-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18 9C18 9.41421 17.6642 9.75 17.25 9.75H9.75V17.25C9.75 17.6642 9.41421 18 9 18C8.58579 18 8.25 17.6642 8.25 17.25V9.75H0.75C0.335786 9.75 0 9.41421 0 9C0 8.58579 0.335786 8.25 0.75 8.25H8.25V0.75C8.25 0.335786 8.58579 0 9 0C9.41421 0 9.75 0.335786 9.75 0.75V8.25H17.25C17.6642 8.25 18 8.58579 18 9V9Z" fill="#1C170D"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="title-section">
          <h1>บ่อ</h1>
        </div>

        {/* Pond List */}
        <div className="pond-list">
          {!ponds || ponds.length === 0 ? (
            <div className="empty-state">
              <p>ยังไม่มีบ่อในระบบ</p>
              <button className="add-first-pond-btn" onClick={addPond}>
                เพิ่มบ่อแรก
              </button>
            </div>
          ) : (
            ponds && ponds.length > 0 ? ponds.map((pond) => (
              <div key={pond.id} className="pond-item">
                <div className="pond-content" onClick={() => selectPond(pond.id)}>
                  <div className="pond-info">
                    <div className="flex items-center justify-between">
                      <h3 className="pond-title">{pond.name}</h3>
                      {/* Alert Badge */}
                      {user && (
                        <AlertBadge
                          pondId={parseInt(pond.id)}
                          userId={Number(user.id)}
                          size="sm"
                          showCount={true}
                        />
                      )}
                    </div>
                    <div className="pond-details">
                      <div className="detail-row">
                        <span className="detail-label">POND SIZE:</span>
                        <span className="detail-value">{pond.size || 'Not specified'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Pond stocking date:</span>
                        <span className="detail-value">{pond.date || 'Not specified'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">SIZE WIDE * LONG:</span>
                        <span className="detail-value">{pond.dimensions || 'Not specified'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Pond depth:</span>
                        <span className="detail-value">{pond.depth || 'Not specified'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Shrimp count stocked:</span>
                        <span className="detail-value">{pond.shrimp_count ? `${pond.shrimp_count} shrimp` : 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  className="delete-pond-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePond(pond.id, pond.name)
                  }}
                  title="ลบบ่อ"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )) : (
              <div className="empty-state">
                <p>ยังไม่มีบ่อในระบบ</p>
                <button className="add-first-pond-btn" onClick={addPond}>
                  เพิ่มบ่อแรก
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .shrimp-ponds-container {
          background-color: #fcfaf7;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .main-frame {
          background-color: #fcfaf7;
          min-height: 100vh;
          width: 100%;
          max-width: 390px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        /* Header Styles */
        .header {
          background-color: #fcfaf7;
          width: 100%;
          flex-shrink: 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 16px 16px 8px 16px;
          width: 100%;
        }

        .spacer {
          flex: 1;
        }

        .logout-button {
          padding: 8px 16px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: #dc2626;
          border-radius: 12px;
          transition: background-color 0.2s;
        }

        .logout-button:hover {
          background-color: #b91c1c;
        }

        .logout-text {
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        }


        .add-button {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: #f2c245;
          border-radius: 12px;
          transition: background-color 0.2s;
        }

        .add-button:hover {
          background-color: #e6b63d;
        }

        .add-icon {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Title Section */
        .title-section {
          padding: 20px 16px 12px 16px;
        }

        .title-section h1 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: 22px;
          line-height: 28px;
          color: #171412;
          margin: 0;
        }

        /* Pond List */
        .pond-list {
          flex: 1;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 16px;
        }

        .pond-item {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: flex-start;
          position: relative;
          gap: 12px;
        }

        .pond-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .pond-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex: 1;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pond-content:hover {
          transform: translateY(-2px);
        }

        .pond-info {
          flex: 1;
        }

        .pond-title {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 600;
          font-size: 18px;
          color: #1c170d;
          margin: 0 0 12px 0;
        }

        .pond-details {
          margin-top: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          padding: 2px 0;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          min-width: 80px;
        }

        .detail-value {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-size: 13px;
          color: #374151;
          font-weight: 400;
          text-align: right;
          flex: 1;
        }


        .delete-pond-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          opacity: 0.7;
          flex-shrink: 0;
        }

        .delete-pond-btn:hover {
          background-color: #FEE2E2;
          opacity: 1;
          transform: scale(1.1);
        }

        .delete-pond-btn:active {
          transform: scale(0.95);
        }

        /* Loading State */
        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #f2c245;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-section p {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }

        /* Error State */
        .error-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .error-section p {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-size: 16px;
          color: #dc2626;
          margin: 0 0 16px 0;
        }

        .error-section button {
          background-color: #f2c245;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #1a170f;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .error-section button:hover {
          background-color: #e6b63d;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-state p {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-size: 16px;
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .add-first-pond-btn {
          background-color: #f2c245;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #1a170f;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-first-pond-btn:hover {
          background-color: #e6b63d;
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .main-frame {
            width: 100%;
          }
          
          .pond-list {
            padding: 0 12px;
            gap: 12px;
          }
          
          .pond-item {
            padding: 16px;
          }
          
          .pond-title {
            font-size: 16px;
          }
          
          .pond-details p {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  )
}