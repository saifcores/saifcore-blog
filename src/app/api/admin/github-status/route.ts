import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { getGitHubCmsDiagnostics } from "@/lib/github-content";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const diagnostics = await getGitHubCmsDiagnostics();
  return NextResponse.json(diagnostics);
}
