
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);

    if (!userExists) {
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          message: 'No account found with this email address. Please sign up first.',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a six-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete any existing unused codes for this email
    await supabase
      .from('login_codes')
      .delete()
      .eq('email', email)
      .eq('used', false);

    // Store the code in the database
    const { error: insertError } = await supabase
      .from('login_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt,
        used: false,
        attempts: 0,
        max_attempts: 5,
      });

    if (insertError) {
      console.error('Error storing login code:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate login code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email with the code
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your PickleRadar Login Code</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">PickleRadar</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Your PickleRadar Login Code</h2>
            
            <p style="font-size: 16px; color: #555;">Use the six-digit code below to sign in to your PickleRadar account:</p>
            
            <div style="background: #f5f5f5; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 0; font-family: 'Courier New', monospace;">
                ${code}
              </p>
            </div>
            
            <p style="font-size: 16px; color: #555;">
              Enter this code in the app to access your profile. The code will expire in <strong>10 minutes</strong>.
            </p>
            
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="margin: 5px 0;">Powered by <strong>Lopez Innovations LLC</strong></p>
          </div>
        </body>
      </html>
    `;

    // Try to send email using Resend API if available
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PickleRadar <noreply@pickleradar.com>',
            to: [email],
            subject: 'Your PickleRadar Login Code',
            html: emailHtml,
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json();
          console.error('Resend API error:', errorData);
          throw new Error('Failed to send email');
        }
      } catch (resendError) {
        console.error('Error sending email via Resend:', resendError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email',
            message: 'Unable to send login code. Please try again later.',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          message: 'Unable to send login code. Please contact support.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Login code sent to your email',
        expiresIn: 600, // 10 minutes in seconds
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-login-code function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
