"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// this is the backend that generates captions for images
const API_BASE = "https://api.almostcrackd.ai";

interface Caption {
  id: string;
  content: string;
  like_count: number;
  image_id: string;
}

interface CaptionListProps {
  captions: Caption[];
  imageMap: Record<string, string>; // maps image id to its url
  userId: string | null;
}

export default function CaptionList({ captions: initialCaptions, imageMap: initialImageMap, userId }: CaptionListProps) {
  const supabase = createSupabaseBrowserClient();

  // queue is basically the list of captions waiting to be voted on
  // we pop from the front as the user votes
  const [queue, setQueue] = useState<Caption[]>([]);
  const [imageMap, setImageMap] = useState(initialImageMap);
  const [loading, setLoading] = useState(false);

  // when the page first loads, we need to check which captions the user
  // already voted on and remove those from the queue
  // otherwise they'd see the same ones again after refreshing
  useEffect(function () {
    if (!userId || initialCaptions.length === 0) {
      setQueue(initialCaptions);
      return;
    }

    // ask supabase which of these captions the user already voted on
    const ids = initialCaptions.map(c => c.id);
    supabase
      .from("caption_votes")
      .select("caption_id")
      .eq("profile_id", userId)
      .in("caption_id", ids)
      .then(function ({ data }) {
        if (!data) {
          // query failed for some reason, just show everything
          setQueue(initialCaptions);
          return;
        }
        const votedIds = new Set(data.map(r => r.caption_id));
        const unvoted = initialCaptions.filter(c => !votedIds.has(c.id));
        setQueue(unvoted);
      });
  }, [userId]);

  // called when user clicks upvote or downvote
  // voteValue is 1 for upvote, -1 for downvote
  async function handleVote(captionId: string, imageId: string, voteValue: number) {
    if (!userId) return;

    // write the vote to the caption_votes table
    await supabase.from("caption_votes").insert({
      vote_value: voteValue,
      caption_id: captionId,
      profile_id: userId,
      created_datetime_utc: new Date().toISOString(),
    });

    // yeet the current card out of the queue
    setQueue(function (prev) {
      return prev.filter(c => c.id !== captionId);
    });

    // if we're running low on captions, go fetch more in the background
    // so the user doesn't hit an empty screen
    if (queue.length <= 2) {
      fetchMore(imageId);
    }
  }

  // hits the API to generate more captions, then reloads everything from the db
  // this runs in the background while the user keeps voting
  async function fetchMore(imageId: string) {
    if (loading) return; // don't spam the API
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // tell the API to make more captions for this image
      await fetch(API_BASE + "/pipeline/generate-captions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + session.access_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      // now pull everything fresh from the db
      // using inner join so we only get captions with real images
      // we used to do .in() with a big list of image ids but that breaks
      // when there are too many images (url gets too long lol)
      const { data: rows } = await supabase
        .from("captions")
        .select("id, content, like_count, image_id, images!inner(id, url)")
        .not("content", "is", null)
        .neq("content", "")
        .order("created_datetime_utc", { ascending: false })
        .limit(50000);

      if (!rows) return;

      // flatten the join results and update our image url map
      let allCaptions: Caption[] = [];
      let updatedMap = { ...imageMap };
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as any;
        allCaptions.push({ id: row.id, content: row.content, like_count: row.like_count, image_id: row.image_id });
        if (row.images && row.images.url) {
          updatedMap[row.images.id] = row.images.url;
        }
      }
      setImageMap(updatedMap);

      // figure out which ones they already voted on so we don't show dupes
      const allIds = allCaptions.map(c => c.id);
      const { data: votedRows } = await supabase
        .from("caption_votes")
        .select("caption_id")
        .eq("profile_id", userId!)
        .in("caption_id", allIds);

      const votedIds = new Set((votedRows || []).map(r => r.caption_id));
      const fresh = allCaptions.filter(c => !votedIds.has(c.id));
      setQueue(fresh);
    } catch {
      // not much we can do if this fails
    } finally {
      setLoading(false);
    }
  }

  // grab the first caption in the queue to show
  let current = queue[0];
  if (!current) {
    // nothing left to vote on
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        {loading
          ? <p>Loading new captions...</p>
          : <p>No more captions to vote on right now. Try uploading an image!</p>
        }
      </div>
    );
  }

  let imgUrl = imageMap[current.image_id];

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <div className="card" style={{ padding: 24 }}>
        {/* only show the image if we actually have a url for it */}
        {imgUrl && (
          <img
            src={imgUrl}
            alt=""
            style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
          />
        )}

        <p style={{ fontSize: 18, marginBottom: 20 }}>{current.content}</p>

        {!userId && (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Log in to vote
          </p>
        )}

        {userId && (
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="btn-upvote"
              disabled={loading}
              style={{ flex: 1, padding: "12px 0", fontSize: 16 }}
              onClick={function () { handleVote(current.id, current.image_id, 1); }}
            >
              Upvote
            </button>
            <button
              className="btn-downvote"
              disabled={loading}
              style={{ flex: 1, padding: "12px 0", fontSize: 16 }}
              onClick={function () { handleVote(current.id, current.image_id, -1); }}
            >
              Downvote
            </button>
          </div>
        )}
      </div>

      {loading && (
        <p style={{ textAlign: "center", color: "var(--muted)", marginTop: 12, fontSize: 14 }}>
          Generating more captions...
        </p>
      )}

      {/* show how many are left so the user knows */}
      <p style={{ textAlign: "center", color: "var(--muted)", marginTop: 12, fontSize: 13 }}>
        {queue.length - 1} more in queue
      </p>
    </div>
  );
}
