'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgetPasswordPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return
    
    setIsLoading(true)
    
    // TODO: Implement actual password reset
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1000)
  }

  const goBack = () => {
    router.back()
  }

  if (isSubmitted) {
    return (
      <div className="forget-pass-container">
        <div className="main-frame">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h2>ส่งรหัสผ่านไปที่เบอร์แล้ว</h2>
            <p>เราได้ส่งรหัสผ่านไปยังเบอร์โทรศัพท์ของคุณแล้ว</p>
            <button onClick={goBack} className="back-button">
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        </div>

        <style jsx>{`
          .forget-pass-container {
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            width: 100%;
            padding: 20px;
          }

          .main-frame {
            background-color: #fcfaf7;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 400px;
            min-height: 400px;
            padding: 40px 20px;
            position: relative;
          }

          .success-content {
            text-align: center;
            padding: 32px;
            max-width: 100%;
            width: 100%;
          }

          .success-icon {
            font-size: clamp(48px, 10vw, 64px);
            margin-bottom: 24px;
          }

          .success-content h2 {
            font-family: 'Inter', 'Noto Sans Thai', sans-serif;
            font-weight: 700;
            font-size: clamp(20px, 4vw, 24px);
            color: #1a170f;
            margin: 0 0 16px 0;
            line-height: 1.3;
          }

          .success-content p {
            font-family: 'Inter', 'Noto Sans Thai', sans-serif;
            font-size: 16px;
            color: #8f8057;
            margin: 0 0 32px 0;
            line-height: 1.5;
          }

          .back-button {
            background-color: #f2c245;
            color: #1a170d;
            border: none;
            border-radius: 24px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 700;
            font-family: 'Inter', 'Noto Sans Thai', sans-serif;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            max-width: 280px;
          }

          .back-button:hover {
            background-color: #e6b63d;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(242, 194, 69, 0.3);
          }

          /* Responsive Design */
          @media (max-width: 480px) {
            .forget-pass-container {
              padding: 16px;
            }
            
            .main-frame {
              padding: 30px 16px;
              min-height: 350px;
            }
            
            .success-content {
              padding: 24px 16px;
            }
          }

          @media (max-width: 360px) {
            .main-frame {
              padding: 24px 12px;
              min-height: 320px;
            }
            
            .success-content {
              padding: 20px 12px;
            }
            
            .success-icon {
              font-size: 40px;
              margin-bottom: 20px;
            }
          }

          @media (min-width: 768px) {
            .main-frame {
              max-width: 450px;
              padding: 50px 30px;
              min-height: 450px;
            }
            
            .back-button {
              max-width: 320px;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="forget-pass-container">
      <div className="main-frame">
        {/* Header with Back Button */}
        <div className="header">
          <div className="header-content">
            <div className="back-button" onClick={goBack}>
              <div className="back-icon">
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18 8C18 8.41421 17.6642 8.75 17.25 8.75H2.56031L8.03063 14.2194C8.32368 14.5124 8.32368 14.9876 8.03063 15.2806C7.73757 15.5737 7.26243 15.5737 6.96937 15.2806L0.219375 8.53063C0.0785421 8.38995 -0.000590086 8.19906 -0.000590086 8C-0.000590086 7.80094 0.0785421 7.61005 0.219375 7.46937L6.96937 0.719375C7.26243 0.426319 7.73757 0.426319 8.03063 0.719375C8.32368 1.01243 8.32368 1.48757 8.03063 1.78062L2.56031 7.25H17.25C17.6642 7.25 18 7.58579 18 8V8Z" fill="#1A170F"/>
                </svg>
              </div>
            </div>
            <div className="title-container">
              <h1>กู้รหัสผ่าน</h1>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <form onSubmit={handleSubmit}>
            {/* Input Section */}
            <div className="input-section">
              <div className="input-wrapper">
                <div className="input-field">
                  <label className="input-label">เบอร์ผู้ใช้</label>
                  <div className="input-container">
                    <input 
                      type="tel" 
                      placeholder="กรอกเบอร์ของผู้ใช้" 
                      className="phone-input"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="button-section">
              <button 
                type="submit" 
                className="send-button" 
                disabled={isLoading}
              >
                {isLoading ? 'กำลังส่ง...' : 'ส่งรหัสผ่านไปที่เบอร์'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .forget-pass-container {
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
          padding: 20px;
        }

        .main-frame {
          background-color: #fcfaf7;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          max-width: 400px;
          min-height: 500px;
          padding: 40px 20px;
          position: relative;
        }

        /* Header Styles */
        .header {
          width: 100%;
          margin-bottom: 40px;
        }

        .header-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
          position: relative;
        }

        .back-button {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .back-button:hover {
          transform: translateX(-2px);
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
          padding-right: 48px; /* Compensate for back button */
        }

        .title-container h1 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: clamp(20px, 4vw, 24px);
          line-height: 1.3;
          color: #1a170f;
          text-align: center;
          margin: 0;
        }

        /* Form Content */
        .form-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          gap: 32px;
        }

        /* Input Section */
        .input-section {
          width: 100%;
          max-width: 320px;
        }

        .input-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .input-field {
          width: 100%;
        }

        .input-label {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
          color: #1a170f;
          display: block;
          margin-bottom: 12px;
          text-align: left;
          width: 100%;
        }

        .input-container {
          background-color: #fcfaf7;
          height: 56px;
          border-radius: 12px;
          width: 100%;
          border: 1px solid #e3ded1;
          position: relative;
          transition: all 0.3s ease;
        }

        .input-container:focus-within {
          border-color: #f2c245;
          box-shadow: 0 0 0 2px rgba(242, 194, 69, 0.2);
          background-color: #f8f6f0;
        }

        .phone-input {
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          padding: 16px;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          color: #1a170f;
          border-radius: 12px;
          outline: none;
        }

        .phone-input::placeholder {
          color: #8f8057;
          font-weight: 400;
        }

        /* Button Section */
        .button-section {
          width: 100%;
          max-width: 320px;
          margin-top: 20px;
        }

        .send-button {
          background-color: #f2c245;
          width: 100%;
          height: 48px;
          border-radius: 24px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: 16px;
          line-height: 24px;
          color: #1a170f;
          text-align: center;
        }

        .send-button:hover:not(:disabled) {
          background-color: #e6b63d;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(242, 194, 69, 0.3);
        }

        .send-button:active:not(:disabled) {
          background-color: #d9a835;
          transform: translateY(0);
        }

        .send-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .forget-pass-container {
            padding: 16px;
          }
          
          .main-frame {
            padding: 30px 16px;
            min-height: 450px;
          }
          
          .header {
            margin-bottom: 30px;
          }
          
          .form-content {
            gap: 28px;
          }
          
          .input-section {
            max-width: 100%;
          }
          
          .button-section {
            max-width: 100%;
          }
          
          .title-container h1 {
            font-size: 22px;
          }
        }

        @media (max-width: 360px) {
          .main-frame {
            padding: 24px 12px;
            min-height: 400px;
          }
          
          .header {
            margin-bottom: 24px;
          }
          
          .form-content {
            gap: 24px;
          }
          
          .input-container {
            height: 48px;
          }
          
          .phone-input {
            padding: 12px;
          }
          
          .send-button {
            height: 44px;
          }
        }

        @media (min-width: 768px) {
          .main-frame {
            max-width: 450px;
            padding: 50px 30px;
            min-height: 550px;
          }
          
          .input-section {
            max-width: 380px;
          }
          
          .button-section {
            max-width: 380px;
          }
          
          .title-container h1 {
            font-size: 24px;
          }
        }

        @media (min-width: 1024px) {
          .main-frame {
            max-width: 500px;
            padding: 60px 40px;
            min-height: 600px;
          }
          
          .input-section {
            max-width: 420px;
          }
          
          .button-section {
            max-width: 420px;
          }
        }

        /* Landscape orientation for mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .forget-pass-container {
            padding: 10px;
          }
          
          .main-frame {
            min-height: 350px;
            padding: 20px;
          }
          
          .header {
            margin-bottom: 20px;
          }
          
          .form-content {
            gap: 20px;
          }
        }
      `}</style>
    </div>
  )
}
