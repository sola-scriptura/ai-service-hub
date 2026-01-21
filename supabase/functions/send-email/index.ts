// Supabase Edge Function for sending email notifications
// Deploy with: supabase functions deploy send-email
//
// Required environment variables (set in Supabase Dashboard > Project Settings > Edge Functions):
// - RESEND_API_KEY: Your Resend API key (get one at https://resend.com)
// - FROM_EMAIL: The verified email address to send from (e.g., notifications@yourdomain.com)
//
// For testing, you can use Resend's free tier which allows sending to your own email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'AI Service Hub <notifications@aiservicehub.com>';

interface EmailPayload {
  projectId?: string;
  notificationId?: string;
  to: string;
  subject: string;
  body: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { projectId, notificationId, to, subject, body } = await req.json() as EmailPayload;

    // If projectId is provided, fetch all pending notifications for that project
    if (projectId) {
      const { data: notifications, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      // Send each notification
      for (const notification of notifications || []) {
        await sendEmail({
          to: notification.recipient_email,
          subject: notification.subject,
          body: notification.body,
        });

        // Mark as sent
        await supabase
          .from('email_notifications')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', notification.id);
      }

      return new Response(
        JSON.stringify({ success: true, sent: notifications?.length || 0 }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // If notificationId is provided, send that specific notification
    if (notificationId) {
      const { data: notification, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (error || !notification) {
        throw new Error('Notification not found');
      }

      await sendEmail({
        to: notification.recipient_email,
        subject: notification.subject,
        body: notification.body,
      });

      // Mark as sent
      await supabase
        .from('email_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', notificationId);

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Direct email send
    if (to && subject && body) {
      await sendEmail({ to, subject, body });
      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error('Missing required parameters');
  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set, skipping email send');
    console.log('Would send to:', to);
    console.log('Subject:', subject);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      text: body,
      // You can also use HTML:
      // html: `<pre>${body}</pre>`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Resend API error:', error);
    throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log('Email sent successfully:', result);
  return result;
}
