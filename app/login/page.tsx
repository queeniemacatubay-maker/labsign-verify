import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export const dynamic="force-dynamic";
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}) {
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(user)redirect("/dashboard");
 const p=await searchParams;
 return <main className="center"><div className="panel"><div className="brand"><div className="logo">LV</div><div><h1>LabSign Verify</h1><p>Laboratory date authorization</p></div></div><div style={{height:24}}/><div className="eyebrow">Administrator access</div><h2 className="h2">Sign in to your account</h2><p className="muted small">Use the administrator account created in Supabase. Public visitors do not need to sign in to verify a date.</p>{p.error==="not-authorized"&&<div className="errorbox">This account does not have administrator access.</div>}<form action="/auth/login" method="post"><div className="field"><label>Email address</label><input name="email" type="email" required autoComplete="username"/></div><div className="field"><label>Password</label><input name="password" type="password" required autoComplete="current-password"/></div><button className="btn full">Sign in securely</button></form><p className="footer">Private administrator area · Asia/Manila time</p></div></main>
}
