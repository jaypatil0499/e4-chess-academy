import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const TO_EMAIL = 'e4cacademy@gmail.com'
const FROM_EMAIL = 'E4 Chess Academy <onboarding@resend.dev>'

serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record

    const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#F7F3EA;border-radius:12px;">
        <div style="background:#0D1F2D;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;">♟</span>
          <h2 style="color:#C9A84C;font-family:Georgia,serif;margin:8px 0 4px;">New Demo Booking!</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">E4 Chess Academy</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#888;font-size:13px;width:40%;">Parent Name</td><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;font-weight:600;color:#1A1A1A;">${record.parent_name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#888;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;"><a href="mailto:${record.email}" style="color:#00B4D8;">${record.email}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#888;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#1A1A1A;">${record.phone || '—'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#888;font-size:13px;">Child's Age</td><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#1A1A1A;">${record.child_age || '—'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#888;font-size:13px;">Experience</td><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#1A1A1A;">${record.experience || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#888;font-size:13px;">Country</td><td style="padding:10px 0;color:#1A1A1A;">${record.country || '—'}</td></tr>
        </table>
        <div style="margin-top:24px;text-align:center;">
          <a href="https://supabase.com/dashboard/project/mdagtfvyvxsycvchella/editor" style="display:inline-block;background:#C9A84C;color:#0D1F2D;padding:12px 28px;border-radius:100px;text-decoration:none;font-weight:700;font-size:14px;">View in Dashboard →</a>
        </div>
        <p style="text-align:center;color:#aaa;font-size:11px;margin-top:20px;">Submitted at ${new Date(record.created_at).toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})} IST</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: `🎯 New Demo Booking — ${record.parent_name} (${record.country || 'Unknown'})`,
        html,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
