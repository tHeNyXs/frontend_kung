'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useLogin } from '@/hooks/use-auth'
import RouteGuard from '@/components/RouteGuard'
import PushNotificationPermission from '@/components/PushNotificationPermission'

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const loginMutation = useLogin()


  // ถ้า login แล้วให้ redirect ไป ponds
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/ponds')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || !password) {
      setError('Please enter your phone number and password.')
      return
    }
    
    setError('')
    
    try {
      await loginMutation.mutateAsync({
        phone_number: phoneNumber,
        password: password
      })
    } catch (error) {
      setError('Error login')
    }
  }

  return (
    <RouteGuard requireAuth={false}>
      <div className="login-container">
      <div className="main-frame">
        <div className="login-form">
          {/* Header */}
          <div className="header">
            <div className="header-content">
              <div className="title-container">
                <div className="app-title">
                  <h1>ShrimpSense</h1>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-content">
            {/* Push Notification Permission */}
            <PushNotificationPermission 
              onPermissionGranted={() => {
                console.log('Push notification permission granted')
              }}
              onPermissionDenied={() => {
                console.log('Push notification permission denied')
              }}
              className="mb-4"
            />
            
            {/* Phone Input */}
            <div className="input-section">
              <div className="input-wrapper">
                <div className="input-field">
                  <div className="input-content">
                    <div className="input-inner">
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="phone-input"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="input-section">
              <div className="input-wrapper">
                <div className="input-field">
                  <div className="input-content">
                    <div className="input-inner">
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="password-input"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            {/* Forgot Password */}
            <div className="forgot-password">
              <div className="forgot-password-text">
                <Link href="/forget-password">Forget password?</Link>
              </div>
            </div>

            {/* Login Button */}
            <div className="button-section">
              <div className="button-container">
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="login-button"
                >
                  <div className="button-content">
                    <div className="button-text">
                      <span>{loginMutation.isPending ? 'Login...' : 'Login'}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <div className="demo-text">
                <strong>Demo Account:</strong><br />
                Phone: 0812345678<br />
                Password: admin123
              </div>
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

        .login-container {
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
          min-height: 500px;
          padding: 40px 20px;
          position: relative;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          gap: 24px;
        }

        /* Header Styles */
        .header {
          width: 100%;
          text-align: center;
          margin-bottom: 20px;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .title-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .app-title h1 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-style: normal;
          color: #1c170d;
          font-size: clamp(24px, 5vw, 32px);
          text-align: center;
          line-height: 1.2;
        }

        /* Form Content */
        .form-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          gap: 20px;
        }

        /* Input Section Styles */
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
          background-color: #f2f0e8;
          height: 56px;
          border-radius: 12px;
          width: 100%;
          transition: all 0.3s ease;
        }

        .input-field:focus-within {
          background-color: #e8e6de;
          box-shadow: 0 0 0 2px #f2c245;
        }

        .input-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        .input-inner {
          display: flex;
          height: 56px;
          align-items: center;
          justify-content: flex-start;
          padding: 16px;
          width: 100%;
        }

        .phone-input, .password-input {
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 400;
          font-size: 16px;
          color: #1c170d;
          outline: none;
        }

        .phone-input::placeholder, .password-input::placeholder {
          color: #9c854a;
          font-size: 16px;
          line-height: 24px;
        }

        /* Error Message Styles */
        .error-message {
          width: 100%;
          max-width: 320px;
          text-align: center;
          padding: 8px 16px;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          color: #c33;
          font-size: 14px;
        }

        /* Forgot Password Styles */
        .forgot-password {
          width: 100%;
          text-align: right;
          padding: 8px 0;
        }

        .forgot-password-text {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 400;
          font-style: normal;
          color: #9c854a;
          font-size: 14px;
          text-align: right;
          padding-right: 20px;
        }

        .forgot-password-text a {
          color: #9c854a;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .forgot-password-text a:hover {
          color: #1c170d;
          text-decoration: underline;
        }

        /* Button Styles */
        .button-section {
          width: 100%;
          max-width: 320px;
          margin-top: 10px;
        }

        .button-container {
          width: 100%;
        }

        .login-button {
          background-color: #f2c245;
          height: 48px;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          width: 100%;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        }

        .login-button:hover:not(:disabled) {
          background-color: #e6b63d;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(242, 194, 69, 0.3);
        }

        .login-button:active:not(:disabled) {
          background-color: #d9a835;
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .button-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 0 20px;
        }

        .button-text {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .button-text span {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-style: normal;
          color: #1c170d;
          font-size: 16px;
          text-align: center;
          line-height: 24px;
        }

        /* Demo Credentials Styles */
        .demo-credentials {
          width: 100%;
          max-width: 320px;
          text-align: center;
          padding: 16px;
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          margin-top: 10px;
        }

        .demo-text {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-size: 12px;
          color: #6c757d;
          line-height: 1.4;
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .login-container {
            padding: 16px;
          }
          
          .main-frame {
            padding: 30px 16px;
            min-height: 450px;
          }
          
          .login-form {
            gap: 20px;
          }
          
          .input-section {
            max-width: 100%;
          }
          
          .button-section {
            max-width: 100%;
          }
          
          .app-title h1 {
            font-size: 28px;
          }
        }

        @media (max-width: 360px) {
          .main-frame {
            padding: 24px 12px;
            min-height: 400px;
          }
          
          .login-form {
            gap: 16px;
          }
          
          .input-field {
            height: 48px;
          }
          
          .input-inner {
            height: 48px;
            padding: 12px;
          }
          
          .login-button {
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
          
          .app-title h1 {
            font-size: 32px;
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
          .login-container {
            padding: 10px;
          }
          
          .main-frame {
            min-height: 350px;
            padding: 20px;
          }
          
          .login-form {
            gap: 16px;
          }
          
          .header {
            margin-bottom: 15px;
          }
        }
      `}</style>
      </div>
    </RouteGuard>
  )
}
