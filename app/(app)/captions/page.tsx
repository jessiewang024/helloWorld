import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CaptionList from "./CaptionList";

export default async function CaptionsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // not logged in? go away
  if (!user) redirect("/login");

  // grab captions + their images in one query using inner join
  // this way we only get captions that actually have an image in the db
  // without inner join we'd get a ton of captions pointing to images that don't exist
  const { data: rows } = await supabase
      .from("captions")
      .select("id, content, like_count, image_id, images!inner(id, url)")
      .not("content", "is", null) // skip nulls
      .neq("content", "") // skip empty strings too
      .order("created_datetime_utc", { ascending: false })
      .limit(50000); // supabase defaults to 1000 which is way too low for us

  // the join gives us nested objects so we gotta flatten it out
  // also building the imageMap here so we don't have to query images separately
  let captions: { id: string; content: string; like_count: number; image_id: string }[] = [];
  let imageMap: Record<string, string> = {}; // image id -> image url
  if (rows) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as any;
      captions.push({ id: row.id, content: row.content, like_count: row.like_count, image_id: row.image_id });
      if (row.images && row.images.url) {
        imageMap[row.images.id] = row.images.url;
      }
    }
  }

  // shuffle everything so you don't see the same stuff every time you refresh
  // using fisher-yates because it's the standard way to do it
  for (let i = captions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [captions[i], captions[j]] = [captions[j], captions[i]];
  }

  return (
      <div className="container">
        <h1>Captions</h1>

        <p style={{ color: "var(--muted)", marginBottom: 16 }}>
          Logged in as {user.email}
        </p>

        <CaptionList
            captions={captions}
            imageMap={imageMap}
            userId={user ? user.id : null}
        />
      </div>
  );
}
