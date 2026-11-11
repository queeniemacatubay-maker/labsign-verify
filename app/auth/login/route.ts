import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(request:Request){
 const form=await request.formData();const email=String(form.get("email")||"");const password=String(form.get("password")||"");
 const s=await createClient();const {error}=await s.auth.signInWithPassword({email,password});
 if(error)return NextResponse.redirect(new URL("/login?error=invalid",request.url),303);
 const {data:{user}}=await s.auth.getUser();
 const {data:profile}=await s.from("profiles").select("role").eq("id",user!.id).single();
 if(profile?.role!=="admin"){await s.auth.signOut();return NextResponse.redirect(new URL("/login?error=not-authorized",request.url),303);}
 return NextResponse.redirect(new URL("/dashboard",request.url),303);
}
