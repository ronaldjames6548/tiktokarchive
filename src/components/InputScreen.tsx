import { toast, Toaster } from "solid-toast";
import { createEffect, createSignal } from "solid-js";

type Platform = 'tiktok' | 'douyin' | 'unknown';

interface TikTokData {
  status: string | null;
  platform?: Platform;
  result: {
    type: string | null;
    author: {
      avatar: string | null;
      nickname: string | null;
    };
    desc: string | null;
    videoSD: string | null;
    videoHD: string | null;
    video_hd: string | null;
    videoWatermark: string | null;
    music: string | null;
    video_diyoun: string | null;
  };
}

function InputScreen() {
  const [url, setUrl] = createSignal("");
  const [data, setData] = createSignal<TikTokData | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [processingShareText, setProcessingShareText] = createSignal(false);

  const cleanInputUrl = (input: string): string => {
    if (/复制此链接|打开Dou音搜索/.test(input)) {
      const urlMatch = input.match(/https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/);
      return urlMatch ? urlMatch[0] : input;
    }
    return input.trim();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let finalUrl = url();

      if (/复制此链接|打开Dou音搜索/.test(finalUrl)) {
        setProcessingShareText(true);
        finalUrl = cleanInputUrl(finalUrl);
      }

      console.log("Final cleaned URL:", finalUrl);

      const res = await fetch(`/api/tik.json?url=${encodeURIComponent(finalUrl)}`);
      const json = await res.json();

      if (json.status === "success") {
        setData(json);
        loadAd();
      } else {
        throw new Error(json.error || "Failed to fetch video data");
      }
    } catch (err: any) {
      toast.error(err.message, {
        duration: 4000,
        position: "bottom-center",
        style: { "font-size": "16px", "white-space": "pre-line", "max-width": "90vw" },
      });
      setData(null);
    } finally {
      setLoading(false);
      setProcessingShareText(false);
    }
  };

  const loadAd = () => {
    const script1 = document.createElement("script");
    script1.id = "aclib";
    script1.type = "text/javascript";
    script1.innerHTML = `aclib.runBanner({ zoneId: '9480206' });`;
    document.getElementById("ad-banner")?.appendChild(script1);

    const script2 = document.createElement("script");
    script2.type = "text/javascript";
    script2.src = "//acscdn.com/script/aclib.js";
    document.getElementById("ad-banner")?.appendChild(script2);
  };

  const getDownloadLink = (videoUrl: string, title: string) =>
    `https://dl.vid3konline.workers.dev/api/download?url=${encodeURIComponent(videoUrl)}&type=.mp4&title=${encodeURIComponent(title || 'video')}`;

  const getAudioDownloadLink = (audioUrl: string, title: string) =>
    `https://dl.vid3konline.workers.dev/api/download?url=${encodeURIComponent(audioUrl)}&type=.mp3&title=${encodeURIComponent(title || 'audio')}`;

  const getDownloadButtonText = (platform: Platform | undefined, quality: string) =>
    platform === 'douyin' ? `Download Douyin Video (${quality})` : `Download TikTok Video (${quality})`;

  // The rest of your rendering code (UI, download buttons) remains unchanged
  // ...
}

export default InputScreen;
