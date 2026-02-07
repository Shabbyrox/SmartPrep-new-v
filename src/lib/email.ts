// src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTPEmail(email: string, code: string, type: 'signup' | 'reset') {
  const subject = type === 'signup' ? 'Verify your account' : 'Reset your password'
  
  try {
    const { error } = await resend.emails.send({
      from: 'Intraa Support <onboarding@intraa.in>',
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #f4f4f5; padding: 20px; border-radius: 8px; letter-spacing: 5px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend Error:', error)
      return false
    }
    return true
  } catch (e) {
    console.error('Email Exception:', e)
    return false
  }
}