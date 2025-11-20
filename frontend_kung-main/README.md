# 🦐 ShrimpSense - ระบบจัดการฟาร์มกุ้งอัจฉริยะ

## 📱 Progressive Web App (PWA)

ShrimpSense เป็น Progressive Web App ที่ช่วยให้คุณจัดการฟาร์มกุ้งได้อย่างมีประสิทธิภาพ ผ่านเทคโนโลยีที่ทันสมัย

### ✨ Features

- **📱 PWA Support**: ติดตั้งลงหน้าจอหลักได้เหมือน native app
- **🌐 Responsive Design**: รองรับทุกขนาดหน้าจอ
- **⚡ Fast Performance**: ใช้ Next.js 13 App Router
- **🎨 Modern UI**: ใช้ Tailwind CSS และ Figma Design
- **🔒 Offline Support**: ใช้งานได้แม้ไม่มีอินเทอร์เน็ต

### 🚀 Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **PWA**: Custom Service Worker, Manifest
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm หรือ yarn

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd webapp-depa-real/app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### PWA Testing

```bash
# Development
npm run dev
# เปิด: http://localhost:3000

# Production (Vercel)
# เปิด: https://your-app.vercel.app
```

## 📱 PWA Features

### Manifest
- Display mode: `standalone`
- Theme color: `#f2c245`
- Background color: `#fcfaf7`
- Icons: 8 ขนาด (72x72 ถึง 512x512)

### Service Worker
- Minimal implementation
- Offline support
- Cache strategies

### Installation
- Add to Home Screen
- Standalone mode
- Native app experience

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Manual Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
app/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # React Components
│   └── providers/     # Context Providers
├── public/
│   ├── icons/         # PWA Icons
│   ├── manifest.json  # PWA Manifest
│   ├── sw.js         # Service Worker
│   └── offline.html   # Offline Page
├── vercel.json        # Vercel Configuration
└── next.config.js     # Next.js Configuration
```

## 🧪 Testing

### PWA Test Page
เปิด: `/manifest-test.html` เพื่อทดสอบ PWA functionality

### PWA Test Page (Full)
เปิด: `/pwa-test.html` เพื่อทดสอบ PWA แบบครบถ้วน

## 📋 Checklist

- [x] Next.js App Setup ✅
- [x] PWA Configuration ✅
- [x] Service Worker ✅
- [x] Manifest.json ✅
- [x] Icons ✅
- [x] Offline Support ✅
- [x] Vercel Deployment ✅
- [x] GitHub Integration ✅

## 🚨 Troubleshooting

### Manifest ไม่ขึ้น
1. ตรวจสอบ Console errors
2. Clear browser cache
3. ตรวจสอบ `/manifest.json` response

### Service Worker ไม่ทำงาน
1. ตรวจสอบ `/sw.js` response
2. Unregister old service workers
3. Hard refresh (Ctrl+Shift+R)

### PWA ไม่ install
1. ตรวจสอบ HTTPS
2. ตรวจสอบ manifest validity
3. ตรวจสอบ service worker registration

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js Team สำหรับ framework ที่ยอดเยี่ยม
- Tailwind CSS สำหรับ utility-first CSS framework
- Vercel สำหรับ hosting และ deployment

---

**🚀 ShrimpSense พร้อมใช้งานแล้ว!** 🎉

> ระบบจัดการฟาร์มกุ้งอัจฉริยะ ที่ช่วยให้คุณดูแลบ่อกุ้งได้อย่างมีประสิทธิภาพ
