import type { APIRoute } from "astro";

export const prerender = false;

async function fetchDouyinVideo(url: string) {
  try {
    // First resolve short links
    const resolvedUrl = await resolveShortUrl(url);
    const videoId = extractVideoId(resolvedUrl);
    
    const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${videoId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Referer': 'https://www.douyin.com/',
        'Cookie': 'ttwid=1%7C...' // Basic cookie
      }
    });

    const data = await response.json();
    const videoUrl = data.aweme_detail?.video?.play_addr?.url_list?.[0];
    
    if (!videoUrl) throw new Error("Couldn't extract video URL");

    return {
      status: "success",
      result: {
        video_diyoun: videoUrl.replace('playwm', 'play'),
        author: {
          nickname: data.aweme_detail?.author?.nickname,
          avatar: data.aweme_detail?.author?.avatar_thumb?.url_list?.[0]
        },
        desc: data.aweme_detail?.desc
      }
    };
  } catch (error) {
    throw new Error(`Douyin API failed: ${error.message}`);
  }
}

function extractVideoId(url: string): string {
  const patterns = [
    /\/video\/(\d+)/,
    /\/share\/video\/(\d+)/,
    /note\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  throw new Error("Couldn't extract video ID from URL");
}

async function resolveShortUrl(url: string): Promise<string> {
  if (!url.includes('v.douyin.com')) return url;
  
  const res = await fetch(url, { redirect: 'manual' });
  return res.headers.get('location') || url;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get("url") || "";

  if (!videoUrl) {
    return new Response(
      JSON.stringify({ error: "URL is required" }),
      { status: 400 }
    );
  }

  try {
    // Handle Douyin URLs
    if (/douyin\.com/.test(videoUrl)) {
      const data = await fetchDouyinVideo(videoUrl);
      return new Response(JSON.stringify(data), { status: 200 });
    }

    // Existing TikTok handling
    const response = await fetch(`https://your-worker-url/api/process?url=${encodeURIComponent(videoUrl)}`);
    return new Response(await response.text(), { status: 200 });

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        solution: videoUrl.includes('douyin.com') 
          ? "This might be a region-locked video. Try using a Chinese VPN."
          : "Please check the URL and try again"
      }),
      { status: 500 }
    );
  }
};
