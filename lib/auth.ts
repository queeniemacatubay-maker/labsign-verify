import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name,designation,facility_name,role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/login?error=not-authorized");
  return { supabase, user, profile };
}
