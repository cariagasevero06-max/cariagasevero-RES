import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon')
  );
};

/**
 * Public Supabase client for client-side authentication and database queries
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Triggers sign-up and sends confirmation email through Brevo SMTP
 * configured in your Supabase backend.
 */
export async function sendSignUpConfirmationEmail({
  email,
  password,
  metadata = {},
}: {
  email: string;
  password?: string;
  metadata?: Record<string, any>;
}) {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials are not configured in .env.local yet.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const emailRedirectTo = `${siteUrl}/auth/callback`;

  const generatedPassword = password || `Temp#${Math.random().toString(36).slice(-8)}!A1`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: generatedPassword,
    options: {
      emailRedirectTo,
      data: metadata,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: `Confirmation email dispatched to ${email} via Brevo SMTP.`,
    user: data.user,
    session: data.session,
  };
}
