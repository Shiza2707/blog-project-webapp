import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, Divider, FieldError, GoogleButton } from "@/components/site/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { fieldErrors, PASSWORD_MIN, registerSchema } from "@/lib/validation";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an account — Meridian" },
      { name: "description", content: "Join Meridian to keep up with thoughtful writing on building things." },
      { property: "og:title", content: "Create an account — Meridian" },
      { property: "og:description", content: "Join Meridian to keep up with thoughtful writing on building things." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: window.location.origin, data: { name: parsed.data.name } },
    });
    setBusy(false);
    if (error) {
      setErrors({ form: /registered|exists/i.test(error.message) ? "An account with this email already exists." : error.message });
      return;
    }
    // An existing email returns a user with no identities; treat it as a duplicate.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErrors({ form: "An account with this email already exists. Try signing in." });
      return;
    }
    if (data.session) {
      navigate({ to: "/", replace: true });
      return;
    }
    setSentTo(parsed.data.email);
  }

  if (sentTo) {
    return (
      <AuthCard title="Check your inbox" subtitle={`We sent a confirmation link to ${sentTo}.`}>
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-accent-foreground">
            <MailCheck className="size-5" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Click the link in that email to activate your account, then sign in.</p>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link to="/login" search={{ redirect: undefined }}>Go to sign in</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Join Meridian"
      subtitle="Create a free account to personalise your reading."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" search={{ redirect: undefined }} className="font-medium text-primary hover:underline">Sign in</Link>
        </>
      }
    >
      <GoogleButton onSignedIn={() => navigate({ to: "/", replace: true })} />
      <Divider />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {errors.form && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errors.form}</p>}
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" className="mt-1.5 h-11" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby="name-error" />
          <FieldError id="name-error" message={errors.name} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-1.5 h-11" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby="email-error" />
          <FieldError id="email-error" message={errors.email} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" className="mt-1.5 h-11" value={form.password} onChange={set("password")} aria-invalid={!!errors.password} aria-describedby="password-error password-hint" />
          {errors.password ? <FieldError id="password-error" message={errors.password} /> : <p id="password-hint" className="mt-1.5 text-xs text-muted-foreground">At least {PASSWORD_MIN} characters, with a letter and a number.</p>}
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" autoComplete="new-password" className="mt-1.5 h-11" value={form.confirm} onChange={set("confirm")} aria-invalid={!!errors.confirm} aria-describedby="confirm-error" />
          <FieldError id="confirm-error" message={errors.confirm} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Create account
        </Button>
      </form>
    </AuthCard>
  );
}
