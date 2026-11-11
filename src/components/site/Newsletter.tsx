import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { newsletterSchema } from "@/lib/validation";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setBusy(true);
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.email.toLowerCase() });
    setBusy(false);
    if (dbError && dbError.code !== "23505") {
      toast.error("Couldn't subscribe right now. Please try again.");
      return;
    }
    setDone(true);
    setEmail("");
    toast.success(dbError ? "You're already on the list." : "You're subscribed. Welcome aboard!");
  }

  return (
    <section className="container-page mt-24" aria-labelledby="newsletter-heading">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-ink-foreground md:px-14 md:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/30 blur-3xl" aria-hidden />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow text-ink-muted">The Sunday letter</p>
            <h2 id="newsletter-heading" className="mt-3 text-3xl font-medium md:text-4xl">
              One thoughtful email a week. No noise.
            </h2>
            <p className="mt-3 max-w-md text-ink-muted">
              The best new articles, hand-picked and delivered every Sunday morning.
            </p>
          </div>
          {done ? (
            <p className="rounded-xl bg-ink-foreground/10 px-5 py-4 text-sm">Thanks — check your inbox on Sunday.</p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="w-full">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error)}
                  className="h-11 flex-1 rounded-lg border border-ink-muted/25 bg-ink-foreground/5 px-4 text-ink-foreground placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" variant="inverse" size="lg" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />} Subscribe
                </Button>
              </div>
              {error && <p className="mt-2 text-sm text-destructive-foreground">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
