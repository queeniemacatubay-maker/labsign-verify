import { requireAdmin } from "@/lib/auth";
import { ProfileForm } from "./profile-form";
export const dynamic="force-dynamic";
export default async function Profile(){const {profile}=await requireAdmin();return <section className="panel" style={{maxWidth:680}}><div className="eyebrow">Public verification details</div><h2 className="h2">Signatory & facility profile</h2><p className="muted small">These details are shown only when a date is authorized. Do not enter patient information here.</p><ProfileForm initial={profile}/></section>}
