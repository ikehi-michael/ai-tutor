"use client";

import { cn } from "@/lib/utils";

interface YouTubeEmbedProps {
  videoId: string;
  className?: string;
}

/**
 * Component to embed YouTube videos
 * Takes a YouTube video ID and creates an embed
 */
export function YouTubeEmbed({ videoId, className }: YouTubeEmbedProps) {
  if (!videoId) return null;

  return (
    <div className={cn("w-full aspect-video rounded-xl overflow-hidden", className)}>
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

