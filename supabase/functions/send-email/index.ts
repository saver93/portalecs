import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Template email HTML
const emailTemplates = {
  notification: (data: any) => ({
    subject: data.title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Portale Aziendale</div>
            </div>
            <div class="content">
              <h2>Ciao ${data.name},</h2>
              <h3>${data.title}</h3>
              <p>${data.message}</p>
              ${data.action_url ? `
                <a href="${data.action_url}" class="button">Visualizza nel portale</a>
              ` : ''}
            </div>
            <div class="footer">
              <p>Questa è una notifica automatica dal Portale Aziendale.</p>
              <p>Non rispondere a questa email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),
  
  welcome: (data: any) => ({
    subject: 'Benvenuto nel Portale Aziendale',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Benvenuto</title>
          <style>
            /* Stessi stili di sopra */
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Portale Aziendale</div>
            </div>
            <div class="content">
              <h2>Benvenuto ${data.name}!</h2>
              <p>Il tuo account è stato creato con successo nel Portale Aziendale.</p>
              <p>Puoi ora accedere con le seguenti credenziali:</p>
              <ul>
                <li><strong>Email:</strong> ${data.email}</li>
                <li><strong>Ruolo:</strong> ${data.role}</li>
              </ul>
              <p>Ti consigliamo di cambiare la password al primo accesso.</p>
              <a href="${data.login_url}" class="button">Accedi al portale</a>
            </div>
            <div class="footer">
              <p>Se hai bisogno di assistenza, contatta il tuo amministratore.</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}

serve(async (req) => {
  try {
    const { to, template, data } = await req.json()

    if (!to || !template || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, template, data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Ottieni il template
    const emailTemplate = emailTemplates[template]
    if (!emailTemplate) {
      return new Response(
        JSON.stringify({ error: 'Invalid template' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { subject, html } = emailTemplate(data)

    // Invia email con Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Portale Aziendale <noreply@tuodominio.com>',
        to: [to],
        subject,
        html,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      throw new Error(resData.message || 'Failed to send email')
    }

    // Log email inviata
    await supabase
      .from('email_logs')
      .insert({
        to,
        template,
        subject,
        sent_at: new Date().toISOString(),
        status: 'sent',
        resend_id: resData.id
      })

    return new Response(
      JSON.stringify({ success: true, id: resData.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Alternativa con SendGrid (commenta Resend e decommenta questo)
/*
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!

// Invia email con SendGrid
const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: to }],
    }],
    from: { email: 'noreply@tuodominio.com', name: 'Portale Aziendale' },
    subject,
    content: [{
      type: 'text/html',
      value: html,
    }],
  }),
})
*/