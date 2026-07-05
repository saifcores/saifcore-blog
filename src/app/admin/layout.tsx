import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin | SAIFCORE Blog",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div data-theme="dark">{children}</div>;
}

export async function requireAdmin() {
  if (!isAdminConfigured()) {
    redirect("/admin/login?error=not-configured");
  }
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
