"use client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SignUpPage() {
  const supabase = createClientComponentClient();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Create an Account</h1>
        <Auth
          supabaseClient={supabase}
          view="sign_up"
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          redirectTo="http://localhost:3000/"
        />
      </div>
    </div>
  );
}