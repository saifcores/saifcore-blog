import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "../layout";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
