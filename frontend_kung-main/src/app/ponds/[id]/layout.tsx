'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function PondLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const pondId = params.id

  const isActive = (path: string) => {
    return pathname === `/ponds/${pondId}${path}`
  }

  return (
    <div className="flex flex-col h-screen relative bg-[#fcfaf7]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#fcfaf7]">
        <div className="pb-20">
          {children}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FCFAF7] border-t border-gray-200 flex justify-around items-center py-2 z-50 shadow-lg">
        <Link 
          href={`/ponds/${pondId}`} 
          className={`flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 rounded-lg min-w-[50px] ${
            isActive('') ? 'text-[#1C170D]' : 'text-[#9C854A] hover:text-[#1C170D] hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-center">หน้าแรก</span>
        </Link>

        <Link 
          href={`/ponds/${pondId}/graph`} 
          className={`flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 rounded-lg min-w-[50px] ${
            isActive('/graph') ? 'text-[#1C170D]' : 'text-[#9C854A] hover:text-[#1C170D] hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9L12 6L16 10L21 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 5H16V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-center">กราฟ</span>
        </Link>

        <Link 
          href={`/ponds/${pondId}/history`} 
          className={`flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 rounded-lg min-w-[50px] ${
            isActive('/history') ? 'text-[#1C170D]' : 'text-[#9C854A] hover:text-[#1C170D] hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-center">ประวัติ</span>
        </Link>

        <Link 
          href={`/ponds/${pondId}/control`} 
          className={`flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 rounded-lg min-w-[50px] ${
            isActive('/control') ? 'text-[#1C170D]' : 'text-[#9C854A] hover:text-[#1C170D] hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5174 9 19.41C8.69838 19.2769 8.36381 19.2372 8.03941 19.296C7.71502 19.3548 7.41568 19.5095 7.18 19.74L7.12 19.8C6.93425 19.986 6.71368 20.1335 6.47088 20.2341C6.22808 20.3348 5.96783 20.3866 5.705 20.3866C5.44217 20.3866 5.18192 20.3348 4.93912 20.2341C4.69632 20.1335 4.47575 19.986 4.29 19.8C4.10405 19.6143 3.95653 19.3937 3.85588 19.1509C3.75523 18.9081 3.70343 18.6478 3.70343 18.385C3.70343 18.1222 3.75523 17.8619 3.85588 17.6191C3.95653 17.3763 4.10405 17.1557 4.29 16.97L4.35 16.91C4.58054 16.6743 4.73519 16.375 4.794 16.0506C4.85282 15.7262 4.81312 15.3916 4.68 15.09C4.55324 14.7942 4.34276 14.542 4.07447 14.3643C3.80618 14.1866 3.49179 14.0913 3.17 14.09H3C2.46957 14.09 1.96086 13.8793 1.58579 13.5042C1.21071 13.1291 1 12.6204 1 12.09C1 11.5596 1.21071 11.0509 1.58579 10.6758C1.96086 10.3007 2.46957 10.09 3 10.09H3.17C3.49179 10.0887 3.80618 9.99339 4.07447 9.81572C4.34276 9.63805 4.55324 9.38579 4.68 9.09C4.81312 8.78838 4.85282 8.45381 4.794 8.12941C4.73519 7.80502 4.58054 7.50568 4.35 7.27L4.29 7.21C4.10405 7.02425 3.95653 6.80368 3.85588 6.56088C3.75523 6.31808 3.70343 6.05783 3.70343 5.795C3.70343 5.53217 3.75523 5.27192 3.85588 5.02912C3.95653 4.78632 4.10405 4.56575 4.29 4.38C4.47575 4.19405 4.69632 4.04653 4.93912 3.94588C5.18192 3.84523 5.44217 3.79343 5.705 3.79343C5.96783 3.79343 6.22808 3.84523 6.47088 3.94588C6.71368 4.04653 6.93425 4.19405 7.12 4.38L7.18 4.44C7.41568 4.67054 7.71502 4.82519 8.03941 4.884C8.36381 4.94282 8.69838 4.90312 9 4.77C9.31074 4.66263 9.5799 4.45995 9.77251 4.19134C9.96512 3.92273 10.0723 3.601 10.08 3.27V3C10.08 2.46957 10.2907 1.96086 10.6658 1.58579C11.0409 1.21071 11.5496 1 12.08 1C12.6104 1 13.1191 1.21071 13.4942 1.58579C13.8693 1.96086 14.08 2.46957 14.08 3V3.09C14.0813 3.41179 14.1766 3.72618 14.3543 3.99447C14.532 4.26276 14.7842 4.47324 15.08 4.6C15.3816 4.73312 15.7162 4.77282 16.0406 4.714C16.365 4.65519 16.6643 4.50054 16.9 4.27L16.96 4.21C17.1457 4.02405 17.3663 3.87653 17.6091 3.77588C17.8519 3.67523 18.1122 3.62343 18.375 3.62343C18.6378 3.62343 18.8981 3.67523 19.1409 3.77588C19.3837 3.87653 19.6043 4.02405 19.79 4.21C19.976 4.39575 20.1235 4.61632 20.2241 4.85912C20.3248 5.10192 20.3766 5.36217 20.3766 5.625C20.3766 5.88783 20.3248 6.14808 20.2241 6.39088C20.1235 6.63368 19.976 6.85425 19.79 7.04L19.73 7.1C19.4995 7.33568 19.3448 7.63502 19.286 7.95941C19.2272 8.28381 19.2669 8.61838 19.4 8.92V9H19.41C19.5174 9.31074 19.7201 9.5799 19.9887 9.77251C20.2573 9.96512 20.579 10.0723 20.91 10.08H21C21.5304 10.08 22.0391 10.2907 22.4142 10.6658C22.7893 11.0409 23 11.5496 23 12.08C23 12.6104 22.7893 13.1191 22.4142 13.4942C22.0391 13.8693 21.5304 14.08 21 14.08H20.91C20.5882 14.0813 20.2738 14.1766 20.0055 14.3543C19.7372 14.532 19.5268 14.7842 19.4 15.08V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-center">ควบคุม</span>
        </Link>

        <Link 
          href={`/ponds/${pondId}/agent`} 
          className={`flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 rounded-lg min-w-[50px] ${
            isActive('/agent') ? 'text-[#1C170D]' : 'text-[#9C854A] hover:text-[#1C170D] hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-center">ผู้ช่วย</span>
        </Link>
      </div>
    </div>
  )
}
