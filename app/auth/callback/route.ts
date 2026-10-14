import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription)}`, requestUrl.origin)
    );
  }

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        const email = data.user.email || '';
        const name = data.user.user_metadata?.full_name || '';
        // Redirect with verified flags to trigger AccountActivationModal and activation flow
        return NextResponse.redirect(
          new URL(
            `/?verified=true&activate=modal&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`,
            requestUrl.origin
          )
        );
      }
    } catch (e) {
      console.error('Error exchanging Supabase code for session:', e);
    }
  }

  return NextResponse.redirect(new URL('/?verified=true&activate=modal', requestUrl.origin));
}
