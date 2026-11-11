import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  const body=await request.json();const date=String(body.date||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({status:"invalid",message:"Enter a valid issuance date."},{status:400});
  const d=new Date(date+"T00:00:00Z");if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==date)return NextResponse.json({status:"invalid",message:"Enter a valid issuance date."},{status:400});
  const s=await createClient();const {data,error}=await s.rpc("verify_issuance_date",{p_date:date});
  if(error)throw error;
  return NextResponse.json(data);
 }catch{return NextResponse.json({status:"unavailable",message:"Verification is temporarily unavailable. Please try again later."},{status:503});}
}
