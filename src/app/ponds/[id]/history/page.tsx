'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePonds } from '@/hooks/use-ponds'

interface LogFile {
  id: string
  name: string
  date: string
  size: string
  createdAt: string
  filepath?: string
}

export default function HistoryPage() {
  const router = useRouter()
  const params = useParams()
  const pondId = params.id as string
  const { data: ponds } = usePonds()
  const [logFiles, setLogFiles] = useState<LogFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  // Find the current pond
  const pond = ponds?.find(p => p.id === pondId)

  const goBack = () => router.push('/ponds')

  // Fetch log files from backend
  const fetchLogFiles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/logs/${pondId}`)
      if (response.ok) {
        const data = await response.json()
        setLogFiles(data.logFiles || [])
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  // Add new log file
  const addLogFile = async () => {
    try {
      setIsAdding(true)
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pondId })
      })
      
      if (response.ok) {
        await fetchLogFiles() // Refresh the list
        alert('Log added successfully.')
      } else {
        alert('Error adding log file.')
      }
    } catch (error) {
      alert('Error adding log file.')
    } finally {
      setIsAdding(false)
    }
  }

  // Delete log file
  const deleteLogFile = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log file?')) return
    
    try {
      const response = await fetch(`/api/logs/delete/${logId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchLogFiles() // Refresh the list
        alert('Log file deleted successfully.')
      } else {
        alert('Error deleting log file.')
      }
    } catch (error) {
      alert('Error deleting log file.')
    }
  }

  // Download log file
  const downloadFile = async (logId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/logs/download/${logId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Error downloading file.')
      }
    } catch (error) {
      alert('Error downloading file.')
    }
  }

  useEffect(() => {
    fetchLogFiles()
    
    // Remove Glasp extension elements
    const removeGlaspExtension = () => {
      const glaspElements = document.querySelectorAll('[class*="glasp"], .glasp-extension-toaster')
      glaspElements.forEach(element => {
        element.remove()
      })
    }
    
    // Remove immediately and set interval to catch new ones
    removeGlaspExtension()
    const interval = setInterval(removeGlaspExtension, 1000)
    
    return () => clearInterval(interval)
  }, [pondId])


  return (
    <div className="w-full flex flex-col h-full bg-[#fcfaf7]">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="back-button" onClick={goBack}>
              <div className="back-icon">
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18 8C18 8.41421 17.6642 8.75 17.25 8.75H2.56031L8.03063 14.2194C8.32368 14.5124 8.32368 14.9876 8.03063 15.2806C7.73757 15.5737 7.26243 15.5737 6.96937 15.2806L0.219375 8.53063C0.0785421 8.38995 -0.000590086 8.19906 -0.000590086 8C-0.000590086 7.80094 0.0785421 7.61005 0.219375 7.46937L6.96937 0.719375C7.26243 0.426319 7.73757 0.426319 8.03063 0.719375C8.32368 1.01243 8.32368 1.48757 8.03063 1.78062L2.56031 7.25H17.25C17.6642 7.25 18 7.58579 18 8V8Z" fill="#171412"/>
                </svg>
              </div>
            </div>
            <div className="title-container">
              <h1>{pond?.name || `Number Pond ${pondId}`}</h1>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {/* Title Section */}
          <div className="title-section">
            <h2>Previous day’s data file</h2>
          </div>

          {/* File Section */}
          <div className="file-section">
            {isLoading ? (
              <div className="loading-state">
                <p>Loading log file...</p>
              </div>
            ) : logFiles.length === 0 ? (
              <div className="empty-state">
                <p>No log files available</p>
                <p>logFiles count: {logFiles.length}</p>
                <button 
                  className="add-button" 
                  onClick={addLogFile}
                  disabled={isAdding}
                  style={{marginTop: '16px'}}
                >
                  {isAdding ? 'adding...' : 'adding log file successfully'}
                </button>
            </div>
            ) : (
              logFiles.map((logFile) => (
                <div key={logFile.id} className="file-item">
                  <div className="file-info">
                    <h3>{logFile.name}</h3>
                    <div className="file-date">{logFile.date}</div>
                    <div className="file-size">{logFile.size}</div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="action-button download-btn"
                      onClick={() => downloadFile(logFile.id, logFile.name)}
                      title="Download"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 15.75L8.25 12L9.66 10.59L11.25 12.18V3H12.75V12.18L14.34 10.59L15.75 12L12 15.75Z" fill="currentColor"/>
                        <path d="M20.25 15.75V19.5C20.25 20.33 19.58 21 18.75 21H5.25C4.42 21 3.75 20.33 3.75 19.5V15.75H5.25V19.5H18.75V15.75H20.25Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button 
                      className="action-button delete-btn"
                      onClick={() => deleteLogFile(logFile.id)}
                      title="ลบ"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons Section */}
          <div className="action-section">
            <button 
              className="add-button" 
              onClick={addLogFile}
              disabled={isAdding}
            >
              {isAdding ? 'adding...' : 'adding log file successfully'}
            </button>
          </div>
        </div>

       <style jsx>{`
         * {
           margin: 0;
           padding: 0;
           box-sizing: border-box;
         }

         /* Prevent Glasp extension from interfering */
         .glasp-extension-toaster {
           display: none !important;
         }
         
         /* Hide all Glasp extension elements */
         [class*="glasp"] {
           display: none !important;
         }
         
         /* Hide shadow DOM elements */
         template[shadowrootmode] {
           display: none !important;
         }

        body {
          font-family: 'Inter', 'Space Grotesk', 'Noto Sans Thai', sans-serif;
          background-color: #ffffff;
          height: 100vh;
          overflow: auto;
        }

        .history-container {
          background-color: #fcfaf7;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .main-frame {
          background-color: #fcfaf7;
          min-height: 100vh;
          width: 100%;
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
          padding: 16px 16px 8px 16px;
          width: 100%;
        }

        .back-button {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
          flex-shrink: 0;
        }

        .back-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .title-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-right: 48px;
        }

        .title-container h1 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 23px;
          color: #1c170d;
          text-align: center;
          margin: 0;
        }

        /* Content Area */
        .content-area {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Title Section */
        .title-section {
          text-align: center;
        }

        .title-section h2 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: 20px;
          line-height: 24px;
          color: #1c170d;
          margin: 0;
        }

        /* File Section */
        .file-section {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .file-item:last-child {
          border-bottom: none;
        }

        .file-info {
          flex: 1;
        }

        .file-info h3 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 600;
          font-size: 18px;
          line-height: 22px;
          color: #1c170d;
          margin: 0 0 8px 0;
        }

        .file-date {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 17px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .file-size {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          line-height: 15px;
          color: #9ca3af;
        }

         .file-actions {
           display: flex;
           gap: 8px;
           align-items: center;
           position: relative;
           z-index: 1000;
         }

         .action-button {
           width: 40px;
           height: 40px;
           border: none;
           border-radius: 8px;
           cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
           transition: all 0.2s ease;
           user-select: none;
           -webkit-user-select: none;
           -moz-user-select: none;
           -ms-user-select: none;
           position: relative;
           z-index: 10;
         }


        .download-btn {
          background-color: #10b981;
          color: white;
        }

        .download-btn:hover {
          background-color: #059669;
          transform: scale(1.05);
        }

        .download-btn:active {
          transform: scale(0.95);
        }

        .delete-btn {
          background-color: #ef4444;
          color: white;
        }

        .delete-btn:hover {
          background-color: #dc2626;
          transform: scale(1.05);
        }

        .delete-btn:active {
          transform: scale(0.95);
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .loading-state p, .empty-state p {
          margin: 0;
          font-size: 16px;
        }

        /* Action Section */
        .action-section {
          text-align: center;
        }

        .add-button {
          background-color: #f2c245;
          border: none;
          border-radius: 20px;
          padding: 16px 32px;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: 16px;
          line-height: 24px;
          color: #1c170d;
          cursor: pointer;
          transition: background-color 0.2s ease;
          min-width: 200px;
        }

        .add-button:hover:not(:disabled) {
          background-color: #e6b63d;
        }

        .add-button:disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .content-area {
            padding: 12px;
            gap: 16px;
          }
          
          .file-section {
            padding: 20px;
          }
          
          .title-section h2 {
            font-size: 18px;
          }
          
          .file-info h3 {
            font-size: 16px;
          }
          
          .download-button {
            padding: 14px 24px;
            font-size: 14px;
            min-width: 180px;
          }
        }
      `}</style>
    </div>
  )
}
