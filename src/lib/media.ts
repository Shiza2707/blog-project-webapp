import { supabase } from "@/integrations/supabase/client";
import { validateImageFile } from "./validation";

// Files live in a private bucket; a long-lived signed link lets anyone view the image.
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadImage(file: File, folder: string): Promise<string> {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error("Upload failed. Please try again.");
  const { data, error: signError } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw new Error("Upload finished but the image link could not be created.");
  return data.signedUrl;
}
