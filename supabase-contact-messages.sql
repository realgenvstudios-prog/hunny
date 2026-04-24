-- Contact Messages table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  message    text        NOT NULL,
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (re-runnable)
DROP POLICY IF EXISTS "anyone can insert contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "auth read contact_messages"         ON contact_messages;
DROP POLICY IF EXISTS "auth update contact_messages"       ON contact_messages;
DROP POLICY IF EXISTS "auth delete contact_messages"       ON contact_messages;

CREATE POLICY "anyone can insert contact_messages"
  ON contact_messages FOR INSERT WITH CHECK (true);  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; margin-bottom: 24px; }
      .logo img { height: 28px; width: auto; }
      .content { background: #f9f7f4; padding: 32px; border-radius: 8px; }
      .greeting { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #2d2d2d; }
      .message { font-size: 15px; line-height: 1.8; margin-bottom: 24px; color: #555; }
      .cta-button { display: inline-block; background: #d4a574; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 24px; font-size: 14px; }
      .footer { text-align: center; font-size: 12px; color: #999; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
      .highlight { color: #d4a574; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578539/IMG-20251219-WA0000_kdwn3b.png" alt="Hunny">
      </div>
  
      <div class="content">
        <div class="greeting">Welcome to Hunny{{ if .Data.full_name }}, {{ .Data.full_name }}{{ end }}</div>
        
        <div class="message">
          <p>Thank you for signing up. We're excited to have you on board.</p>
          
          <p>Confirm your email address to access your account and explore our fresh, delicious menu. Order sandwiches, shawarma, catering and more.</p>
          
          <p>Simply click the button below to complete your registration.</p>
        </div>
  
        <div style="text-align: center;">
          <a href="{{ .ConfirmationURL }}" class="cta-button">Confirm Email Address</a>
        </div>
  
        <div class="message" style="font-size: 13px; color: #888;">
          <p>Questions? Contact us at hello@hunny.com</p>
        </div>
      </div>
  
      <div class="footer">
        <p>Hunny Fast Food<br>14 Cantonments Rd, Accra, Ghana</p>
      </div>
    </div>
  </body>
  </html>

CREATE POLICY "admin read contact_messages"
  ON contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admin update contact_messages"
  ON contact_messages FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin delete contact_messages"
  ON contact_messages FOR DELETE
  USING (public.is_admin());
