import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ✅ Schema สำหรับ validate request body
const requestSchema = z.object({
  question: z.string().min(1, 'Please enter your question.'),
  pondId: z.string().optional(),
  pondData: z.object({}).passthrough().optional(),
})


// ✅ Helper: จัดรูปข้อมูลบ่อให้อ่านง่าย
function formatPondData(pondData: any) {
  if (!pondData) return 'No data pond'

  return `
- Pond: ${pondData?.name ?? 'Not specified'}
- Pond size: ${pondData?.size ?? 'Not specified'} farm
- Pond stocking date: ${pondData?.date ?? 'Not specified'}
- Size Width × Length: ${pondData?.dimensions ?? 'Not specified'}
- Pond depth: ${pondData?.depth ?? 'Not specified'} meter
- Shrimp stocked: ${pondData?.shrimp_count ?? 'Not specified'} shrimp
- Pond location: ${pondData?.location ?? 'Not specified'}
- Notes: ${pondData?.notes ?? 'Not specified'}
- Pond created date: ${pondData?.created_at ? new Date(pondData.created_at).toLocaleDateString('th-TH') : 'Not specified'}
- Last updated date: ${pondData?.updated_at ? new Date(pondData.updated_at).toLocaleDateString('th-TH') : 'Not specified'}
`
}

// ✅ API Route
export async function POST(request: NextRequest) {
  try {
    // 1) อ่านและ validate body
    const body = await request.json().catch(() => null)
    const { question, pondId, pondData } = requestSchema.parse(body)

    // 2) ตรวจสอบ API key
    const apiKey = process.env.DEEPSEEK_API_KEY
    console.log('🔑 API Key check:', {
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      environment: process.env.NODE_ENV
    })
    
if (!apiKey) {
  console.log('❌ DEEPSEEK_API_KEY not found in environment variables')
  // ส่ง fallback response แทน error
  return NextResponse.json({
    success: true,
    data: { 
      answer: `Hello! I am an AI assistant for shrimp farming.

Current pond information:
- Pond name: ${pondData?.name || 'Not specified'}
- Pond size: ${pondData?.size || 'Not specified'} rai
- Shrimp count: ${pondData?.shrimp_count || 'Not specified'}

Question: ${question}

Answer: Sorry, the AI system is currently unavailable. However, here is some general advice on shrimp farming:

- Regularly check water quality
- Feed the shrimp with an appropriate amount of food
- Watch out for diseases and predators
- Change the water as scheduled

For more specific recommendations, please contact a specialist.`
    }
  })
}


    // 3) สร้าง context
const context = `
You are an AI assistant specialized in shrimp farming and pond management.

Current pond information (ID: ${pondId ?? 'Not specified'}):
${formatPondData(pondData)}

Guidelines for your response:
- Answer in clear, simple English suitable for farmers
- Keep the formatting clean (use line breaks between sections)
- Avoid excessive use of bold or special characters
- Provide concise and practical advice
- Limit your response to a maximum of 300 words
- Use bullet points (-) for lists
- Maintain a friendly and supportive tone

User question: ${question}
`

    // 🔍 log context เฉพาะ dev
    if (process.env.NODE_ENV !== 'production') {
      console.log('🤖 Generated Context:', context)
    }

    // 4) เรียก DeepSeek API พร้อม timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    console.log('🚀 Calling DeepSeek API...')
    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant specializing in shrimp farming and pond management. Respond in clear, simple English that farmers can easily understand.'
            },
            {
              role: 'user',
              content: context
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
        signal: controller.signal,
      }
    )
    
    
    
    console.log('📡 DeepSeek API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    clearTimeout(timeout)

    // 5) ตรวจสอบ response
    if (!response.ok) {
      const errText = await response.text()
      console.log('Gemini API error response:', errText)
      
      // ถ้าไม่มี API key หรือ API key ไม่ถูกต้อง ให้ส่ง fallback response
if (response.status === 400 || response.status === 403) {
  return NextResponse.json({
    success: true,
    data: { 
      answer: `Hello! I am an AI assistant for shrimp farming.

Current pond information:
- Pond name: ${pondData?.name || 'Not specified'}
- Pond size: ${pondData?.size || 'Not specified'} rai
- Shrimp count: ${pondData?.shrimp_count || 'Not specified'}

Question: ${question}

Answer: Sorry, the AI system is currently unavailable. However, here are some general recommendations for shrimp farming:

- Regularly check water quality
- Feed shrimp with an appropriate amount of feed
- Watch out for diseases and predators
- Change the water as scheduled

For more specific advice, please contact a specialist.`
    }
  })
}

return NextResponse.json(
  {
    success: false,
    error: {
      message: 'Failed to call the AI API',
      code: response.status,
      details: errText,
    },
  },
  { status: 500 }
)
}

const data = await response.json()
const answer =
  data.choices?.[0]?.message?.content ||
  'Unable to generate an answer'

// 6) ส่งกลับ standardized response
return NextResponse.json({
  success: true,
  data: { answer },
})
} catch (error) {
  console.log('Error in POST /api/agent:', error)

  return NextResponse.json(
    {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        code: 500,
        environment: process.env.NODE_ENV,
      },
    },
    { status: 500 }
  )
}
}
