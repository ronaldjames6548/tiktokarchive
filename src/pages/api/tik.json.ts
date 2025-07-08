import type { APIRoute } from "astro";
import { Downloader } from "@tobyg74/tiktok-api-dl";

export const prerender = false;

// Enhanced URL extractor for Douyin share text
function extractVideoUrl(input: string): string | null {
  // First try to find standard URL patterns
  const standardUrl = input.match(/https?:\/\/[^\s]+/)?.[0];
  if (standardUrl && /(tiktok|douyin)\.com/.test(standardUrl)) {
    return standardUrl;
  }

  // Special handling for Douyin share text
  const douyinShareMatch = input.match(/https?:\/\/v\.douyin\.com\/\S+/);
  return douyinShareMatch ? douyinShareMatch[0] : null;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const rawUrl = url.searchParams.get("url") || "";
    
    // Extract clean URL from possible share text
    const videoUrl = extractVideoUrl(rawUrl);
    if (!videoUrl) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid URL format. Please ensure you're using a valid TikTok or Douyin link",
          details: "For Douyin, try copying the link directly from the share menu"
        }),
        { status: 400 }
      );
    }

    // Process through Cloudflare Worker
    const workerUrl = `https://dl.tiktokiocdn.workers.dev/api/process?url=${encodeURIComponent(videoUrl)}`;
    const response = await fetch(workerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': videoUrl.includes('douyin') ? 'https://www.douyin.com/' : 'https://www.tiktok.com/'
      }
    });

    if (!response.ok) throw new Error(`Worker failed with status ${response.status}`);

    return new Response(await response.text(), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        solution: videoUrl.includes('douyin') 
          ? "Douyin videos may require additional headers. Try again or use VPN for Chinese content."
          : "Please check the URL and try again"
      }),
      { status: 500 }
    );
  }
};
