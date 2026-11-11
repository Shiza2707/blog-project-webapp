import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, Divider, FieldError, GoogleButton } from "@/components/site/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { fieldErrors, loginSchema } from "@/lib/validation";
import { safeRedirect } from "@/lib/slug";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect: string | undefined } => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Meridian" },
      { name: "description", content: "Sign in to your Meridian account." },
      { property: "og:title", content: "Sign in — Meridian" },
      { property: "og:description", content: "Sign in to your Meridian account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const goNext = () => navigate({ to: safeRedirect(redirect, "/"), replace: true });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      const msg = /confirm/i.test(error.message)
        ? "Please confirm your email first — check your inbox for the link."
        : "That email and password don't match. Please try again.";
      setErrors({ form: msg });
      return;
    }
    toast.success("Welcome back!");
    goNext();
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue reading and manage your profile."
      footer={
        <>
          New to Meridian?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link>
        </>
      }
    >
      <GoogleButton onSignedIn={goNext} />
      <Divider />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {errors.form && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errors.form}</p>}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-1.5 h-11" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby="email-error" />
          <FieldError id="email-error" message={errors.email} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" className="mt-1.5 h-11" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby="password-error" />
          <FieldError id="password-error" message={errors.password} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
