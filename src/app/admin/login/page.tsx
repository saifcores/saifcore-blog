import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-base" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
