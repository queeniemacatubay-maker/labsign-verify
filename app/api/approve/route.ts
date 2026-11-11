import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export async function POST(){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:p}=await s.from("profiles").select("role").eq("id",user.id).single();
 if(p?.role!=="admin")return NextResponse.json({error:"Administrator access required."},{status:403});
 const {data,error}=await s.rpc("approve_current_date");
 if(error)return NextResponse.json({error:error.message.includes("already approved")?"Today's date has already been approved.": "Could not record approval. Please try again."},{status:409});
 return NextResponse.json({date:data?.approved_date,approved_at:data?.approved_at});
}
