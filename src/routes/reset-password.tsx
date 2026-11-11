import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, FieldError } from "@/components/site/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { passwordSchema } from "@/lib/validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — Meridian" },
      { name: "description", content: "Set a new password for your Meridian account." },
      { property: "og:title", content: "Choose a new password — Meridian" },
      { property: "og:description", content: "Set a new password for your Meridian account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    void supabase.auth.getSession().then(({ data: s }) => {
      if (s.session && isRecovery) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError(undefined);
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);
    if (err) return setError(err.message);
    toast.success("Password updated");
    navigate({ to: "/", replace: true });
  }

  return (
    <AuthCard title="Choose a new password" subtitle={ready ? "Pick something secure you haven't used before." : "Open this page from the link in your reset email."}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" autoComplete="new-password" disabled={!ready} className="mt-1.5 h-11" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} aria-describedby="password-error" />
          <FieldError id="password-error" message={error} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy || !ready}>
          {busy && <Loader2 className="animate-spin" />} Update password
        </Button>
      </form>
    </AuthCard>
  );
}
