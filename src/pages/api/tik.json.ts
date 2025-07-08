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
    const origin = url.origin;
    const apiUrl = `${origin}/api/tiktok-api-dl?url=${encodeURIComponent(videoUrl)}`;

    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) {
      const errorBody = await apiRes.text();
      return new Response(
        JSON.stringify({
          status: "error",
          error: `API call failed: ${errorBody || apiRes.statusText}`,
        }),
        { status: 500 }
      );
    }

    const json = await apiRes.json();
    if (json.status !== "success") {
      return new Response(JSON.stringify(json), { status: 400 });
    }

    const result = json.result;

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
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        status: "error",
        error:
          err?.message ||
          "Failed to fetch video. Possibly region-locked or unsupported URL.",
      }),
      { status: 500 }
    );
  }
};
