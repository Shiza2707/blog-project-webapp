import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, LayoutDashboard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldError } from "@/components/site/AuthCard";
import { UserAvatar } from "@/components/site/UserAvatar";
import { useSignOut } from "@/components/site/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/media";
import { fieldErrors, profileSchema } from "@/lib/validation";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Meridian" },
      { name: "description", content: "Manage your Meridian profile." },
      { property: "og:title", content: "Your profile — Meridian" },
      { property: "og:description", content: "Manage your Meridian profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, isAdmin, loading, refreshProfile } = useAuth();
  const signOut = useSignOut();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = profileSchema.safeParse({ name, bio });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: parsed.data.name, bio: parsed.data.bio || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("Couldn't save your profile. Please try again.");
    await refreshProfile();
    toast.success("Profile updated");
  }

  async function onAvatar(file: File | undefined) {
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, `avatars/${user.id}`);
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) throw new Error("Couldn't save your new photo.");
      await refreshProfile();
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading || !user) {
    return (
      <div className="container-page max-w-2xl! py-16">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-8 h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl! py-14 md:py-20">
      <p className="eyebrow text-primary">Account</p>
      <h1 className="mt-3 text-4xl font-medium md:text-5xl">Your profile</h1>

      <section className="mt-10 flex flex-col items-start gap-6 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:p-8">
        <div className="relative">
          <UserAvatar name={profile?.name || user.email} src={profile?.avatar_url} className="size-20 text-xl" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Change photo"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => onAvatar(e.target.files?.[0])} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-2xl">{profile?.name || "Unnamed reader"}</h2>
            <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "Admin" : "Reader"}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">Member since {formatDate(profile?.created_at ?? user.created_at)}</p>
        </div>
        {isAdmin && (
          <Button asChild variant="soft">
            <Link to="/admin"><LayoutDashboard /> Dashboard</Link>
          </Button>
        )}
      </section>

      <form onSubmit={onSave} noValidate className="mt-8 space-y-5 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h2 className="font-serif text-2xl">Details</h2>
        <div>
          <Label htmlFor="name">Display name</Label>
          <Input id="name" className="mt-1.5 h-11" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby="name-error" />
          <FieldError id="name-error" message={errors.name} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="mt-1.5 h-11" value={user.email ?? ""} disabled />
        </div>
        <div>
          <Label htmlFor="bio">Short bio</Label>
          <Textarea id="bio" rows={4} className="mt-1.5" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} aria-invalid={!!errors.bio} aria-describedby="bio-error" placeholder="Shown on articles you write." />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <FieldError id="bio-error" message={errors.bio} />
            <span className="ml-auto">{bio.length}/500</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => void signOut()}>Sign out</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />} Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
