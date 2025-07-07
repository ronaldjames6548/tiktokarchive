import type { APIRoute } from "astro";
import { Downloader } from "@tobyg74/tiktok-api-dl";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    let urlTik = params.get("url") || "";

    if (!urlTik) {
      return new Response(
        JSON.stringify({ error: "url is required" }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    // Handle Douyin short links by expanding them
    if (urlTik.includes("v.douyin.com")) {
      const res = await fetch(urlTik, {
        redirect: "follow",
      });

      // Get final URL after redirection
      urlTik = res.url;

      // Ensure it's a valid Douyin link
      if (!urlTik.includes("douyin.com/video")) {
        throw new Error("The provided Douyin link is not a valid video URL.");
      }
    }

    // Use Downloader directly for TikTok or Douyin URLs
    const data = await Downloader(urlTik, {
      version: "v3",
    });

    // Return full response with optional Douyin-specific fields
    return new Response(
      JSON.stringify({
        ...data,
        result: {
          ...data.result,
          video_diyoun: data.result.video_diyoun || null,
        },
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch video data.",
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
};
