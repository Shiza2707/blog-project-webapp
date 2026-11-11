import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data: isAdmin, error } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    if (error || !isAdmin) throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Dashboard — Meridian" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
