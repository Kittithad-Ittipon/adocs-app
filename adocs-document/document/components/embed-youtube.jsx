"use client";

export function EmbedYoutube({ id }) {
  return (
    <iframe
      className="aspect-video w-full rounded-2xl h-auto mb-4"
      src={"https://www.youtube.com/embed/" + id}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    ></iframe>
  );
}
