import {requireAdmin} from "@/lib/auth";
import {PermanentQR} from "./qr";
export const dynamic="force-dynamic";
export default async function QR(){await requireAdmin();const url=(process.env.NEXT_PUBLIC_APP_URL||"").replace(/\/$/,"")+"/verify";return <section className="panel" style={{maxWidth:650}}><div className="eyebrow">Permanent QR code</div><h2 className="h2">Your verification QR</h2><p className="muted small">This QR always opens the public date-verification page. It does not change when a new date is approved. Use your final production URL before printing.</p><PermanentQR url={url}/></section>}
