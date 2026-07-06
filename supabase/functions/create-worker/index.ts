import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { email, password, name, commission_rate } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, user_role: "worker" },
    });
  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      name,
      user_role: "worker",
      auth_user_id: authUser.user.id,
    })
    .select("id")
    .single();
  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: worker, error: workerError } = await supabase
    .from("workers")
    .insert({ profile_id: profile.id, commission_rate })
    .select("id, profile_id, commission_rate, is_active")
    .single();
  if (workerError) {
    await supabase.from("profiles").delete().eq("id", profile.id);
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return new Response(JSON.stringify({ error: workerError.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ worker, profile }), {
    headers: { "Content-Type": "application/json" },
  });
});
