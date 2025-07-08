import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
  const videoUrl = url.searchParams.get("url");

  if (!videoUrl) {
    return new Response(
      JSON.stringify({ status: "error", error: "URL is required" }),
      { status: 400 }
    );
  }

  try {
    const origin = url.origin || "https://tiktokarchive-one.vercel.app"; // fallback
    const apiUrl = `${origin}/api/tiktok-api-dl?url=${encodeURIComponent(videoUrl)}`;

    const apiRes = await fetch(apiUrl);
    const json = await apiRes.json();

    if (json.status !== "success") {
      return new Response(JSON.stringify(json), { status: 400 });
    }

    const result = json.result;

    // Wrap the links in proxy
    const wrap = (mediaUrl: string | null, type: string) =>
      mediaUrl
        ? `https://dl.vid3konline.workers.dev/api/download?url=${encodeURIComponent(
            mediaUrl
          )}&type=${type}&title=${encodeURIComponent(result.desc || "video")}`
        : null;

    return new Response(
      JSON.stringify({
        status: "success",
        platform: /douyin/.test(videoUrl) ? "douyin" : "tiktok",
        result: {
          ...result,
          videoHD: wrap(result.videoHD, ".mp4"),
          videoSD: wrap(result.videoSD, ".mp4"),
          videoWatermark: wrap(result.videoWatermark, ".mp4"),
          music: wrap(result.music, ".mp3"),
          video_diyoun:
            wrap(result.videoHD, ".mp4") || wrap(result.videoSD, ".mp4"),
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: "Failed to fetch video. Possibly region-locked or unsupported URL.",
      }),
      { status: 500 }
    );
  }
};
