import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    console.log("Function triggered - starting execution");
    
    const payload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload));

    // Supabase webhooks send the data in record/old_record format
    const user = payload.record;
    
    if (!user || !user.id || !user.email) {
      console.log("Invalid user data:", JSON.stringify(payload));
      return new Response(JSON.stringify({ error: "Invalid user data" }), { status: 400 });
    }

    const { id, email } = user;
    console.log("Processing user:", { id, email });

    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const supabaseKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Supabase credentials are missing" }), { status: 500 });
    }

    const now = new Date().toISOString();
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        id,
        full_name: email.split("@")[0],
        avatar_url: "",
        created_at: now,
        updated_at: now
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error creating profile:", errorText);
      return new Response(JSON.stringify({ error: "Failed to insert profile", details: errorText }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Profile created successfully" }), { status: 200 });
  } catch (error) {
    console.log("Error:", error.message);
    return new Response(JSON.stringify({ error: "Server error", details: error.message }), { status: 500 });
  }
});