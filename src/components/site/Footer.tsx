import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-ink text-ink-muted">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo tone="inverse" />
          <p className="mt-4 text-sm leading-relaxed">
            Thoughtful writing on engineering, design and the craft of building products — published by people who
            make things.
          </p>
        </div>
        <div>
          <h2 className="eyebrow text-ink-foreground">Read</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-ink-foreground">Home</Link></li>
            <li><Link to="/blog" className="hover:text-ink-foreground">All articles</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow text-ink-foreground">Account</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/login" search={{ redirect: undefined }} className="hover:text-ink-foreground">Sign in</Link></li>
            <li><Link to="/register" className="hover:text-ink-foreground">Create account</Link></li>
            <li><Link to="/profile" className="hover:text-ink-foreground">Your profile</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-muted/15">
        <div className="container-page flex flex-col justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>© {year} Meridian. All rights reserved.</p>
          <p>Made for readers.</p>
        </div>
      </div>
    </footer>
  );
}
