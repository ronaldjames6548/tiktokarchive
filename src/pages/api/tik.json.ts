import type { APIRoute } from "astro";
import { Downloader } from "@tobyg74/tiktok-api-dl";

export const prerender = false;

// Helper function to detect platform
function detectPlatform(url: string): 'tiktok' | 'douyin' | 'unknown' {
  if (/tiktok\.com|vm\.tiktok\.com|www\.tiktok\.com/.test(url)) return 'tiktok';
  if (/douyin\.com|v\.douyin\.com|iesdouyin\.com|www\.douyin\.com/.test(url)) return 'douyin';
  return 'unknown';
}

// Helper to clean and resolve Douyin share links
async function processDouyinShareText(text: string): Promise<string> {
  // Extract URL from the messy share text
  const urlMatch = text.match(/https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/);
  if (!urlMatch) throw new Error("No valid Douyin URL found in the shared text");
  
  const shortUrl = urlMatch[0];
  try {
    const res = await fetch(shortUrl, { 
      redirect: "follow",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return res.url;
  } catch (error) {
    throw new Error(`Failed to resolve Douyin short URL: ${error.message}`);
  }
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    let videoUrl = params.get("url") || "";

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Handle Douyin share text (with emojis and extra text)
    if (/复制此链接|打开Dou音搜索/.test(videoUrl)) {
      videoUrl = await processDouyinShareText(videoUrl);
    }

    // Detect platform
    const platform = detectPlatform(videoUrl);
    
    if (platform === 'unknown') {
      return new Response(
        JSON.stringify({ error: "Unsupported platform - only TikTok and Douyin URLs are supported" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Platform-specific configurations
    const options = {
      version: "v3",
      ...(platform === 'douyin' ? {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.douyin.com/',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }
      } : {})
    };

    // Download video metadata
    const data = await Downloader(videoUrl, options);

    // For Douyin, ensure we have the video URL
    if (platform === 'douyin') {
      if (!data.result?.video_diyoun) {
        throw new Error("Douyin video not available - may be private, deleted, or region-locked");
      }
      // Map Douyin results to standard TikTok format
      data.result = {
        ...data.result,
        videoSD: data.result.video_diyoun,
        videoHD: data.result.video_diyoun,
        video_hd: data.result.video_diyoun
      };
    }

    return new Response(JSON.stringify({
      ...data,
      platform, // Include platform in response
      result: {
        ...(data.result || {}),
        videoSD: data.result?.videoSD || data.result?.video_diyoun || null,
        videoHD: data.result?.videoHD || data.result?.video_diyoun || null,
        video_hd: data.result?.video_hd || data.result?.video_diyoun || null,
        videoWatermark: data.result?.videoWatermark || null,
        video_diyoun: data.result?.video_diyoun || null,
        music: data.result?.music || null,
      }
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });

  } catch (error) {
    console.error("Error fetching video:", error);
    let errorMessage = error.message;
    const urlParam = new URL(request.url).searchParams.get("url") || "";
    
    // Platform-specific error messages
    if (/douyin\.com/.test(urlParam)) {
      if (errorMessage.includes('private') || errorMessage.includes('region')) {
        errorMessage = "This Douyin video may be private or region-locked. Some Chinese videos require a VPN to access.";
      } else if (errorMessage.includes('invalid') || errorMessage.includes('No valid')) {
        errorMessage = "Invalid Douyin URL. Please make sure to:\n1. Copy the full video link\n2. Try the 'Share' button on the Douyin app\n3. Or use the direct URL from your browser";
      } else if (errorMessage.includes('Failed to resolve')) {
        errorMessage = "Couldn't process this Douyin link. Please try again or use a different URL.";
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" }
      }
    );
  }
};
