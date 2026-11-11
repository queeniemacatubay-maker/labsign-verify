import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Home(){const s=await createClient();const {data:{user}}=await s.auth.getUser();redirect(user?"/dashboard":"/login");}
