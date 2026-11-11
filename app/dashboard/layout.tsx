import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
export const dynamic="force-dynamic";
export default async function DashboardLayout({children}:{children:React.ReactNode}){
 const {profile}=await requireAdmin();
 return <main className="shell"><header className="topbar"><div className="brand"><div className="logo">LV</div><div><h1>LabSign Verify</h1><p>Administrator dashboard</p></div></div><div className="row"><span className="muted small mobilehide">{profile.full_name||"Administrator"}</span><form action="/auth/logout" method="post"><button className="btn secondary">Sign out</button></form></div></header><nav className="nav"><Link href="/dashboard">Dashboard</Link><Link href="/dashboard/history">Authorization history</Link><Link href="/dashboard/profile">Profile & facility</Link><Link href="/dashboard/qr">Permanent QR</Link></nav>{children}<footer className="footer">LabSign Verify · Philippine Time (UTC+8) · Keep administrator credentials private</footer></main>
}
