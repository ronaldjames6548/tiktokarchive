// InputScreen.tsx

import { toast, Toaster } from "solid-toast";
import { createEffect, createSignal } from "solid-js";

type Props = {};

interface TikTokData {
  status: string | null;
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

function InputScreen({}: Props) {
  const [url, setUrl] = createSignal("");
  const [data, setData] = createSignal<TikTokData | null>(null);
  const [loading, setLoading] = createSignal(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tik.json?url=${encodeURIComponent(url())}`);
      const json = await res.json();

      if (json.status === "success") {
        setData(json);
      } else {
        throw new Error(json.error || "Failed to fetch data");
      }
    } catch (err) {
      toast.error(err.message, {
        duration: 3000,
        position: "bottom-center",
        style: { "font-size": "16px" },
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAd = () => {
    const script1 = document.createElement("script");
    script1.id = "aclib";
    script1.type = "text/javascript";
    script1.innerHTML = `
      aclib.runBanner({
        zoneId: '9480206',
      });
    `;
    document.getElementById("ad-banner")?.appendChild(script1);

    const script2 = document.createElement("script");
    script2.type = "text/javascript";
    script2.src = "//acscdn.com/script/aclib.js";
    document.getElementById("ad-banner")?.appendChild(script2);
  };

  const getDownloadLink = (videoUrl: string, title: string) => {
    return `https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(videoUrl)}&type=.mp4&title=${encodeURIComponent(title)}`;
  };

  const getAudioDownloadLink = (audioUrl: string, title: string) => {
    return ` https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(audioUrl)}&type=.mp3&title=${encodeURIComponent(title)}`;
  };

  return (
    <div>
      <Toaster />
      <div class="text-gray-600 h-14 border-[1px] border-blue-500 shadow-md rounded-lg flex items-center my-3">
        <input
          placeholder="Enter TikTok or Douyin URL"
          class="bg-transparent text-m w-full pl-2 font-semibold h-full rounded-full text-sm focus:outline-none text-black"
          type="text"
          onChange={(e) => setUrl(e.currentTarget.value)}
          value={url()}
        />
        <button
          onClick={async (e) => {
            e.preventDefault();
            try {
              const permission = await navigator.permissions.query({ name: "clipboard-read" as PermissionName });
              if (permission.state === "granted" || permission.state === "prompt") {
                const text = await navigator.clipboard.readText();
                setUrl(text);
              }
            } catch (err) {
              console.error("Clipboard access denied", err);
            }
          }}
          class="flex justify-center items-center p-2 border-[1px] text-xs font-semibold shadow-md mr-2 rounded-md dark:bg-blue-600 dark:text-white"
        >
          {/* Paste Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 60 58">
            <path d="M17.5 12h17c.8 0 1.5-.7 1.5-1.5V6c0-2.2-1.8-4-4-4H20c-2.2 0-4 1.8-4 4v4.5c0 .8.7 1.5 1.5 1.5z"></path>
            <path d="M44 6h-2.5c-.8 0-1.5.7-1.5 1.5V12c0 2.2-1.8 4-4 4H16c-2.2 0-4-1.8-4-4V7.5c0-.8-.7-1.5-1.5-1.5H8c-2.2 0-4 1.8-4 4v36c0 2.2 1.8 4 4 4h36c2.2 0 4-1.8 4-4V10c0-2.2-1.8-4-4-4zm-6 35c0 .6-.4 1-1 1H15c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h22c.6 0 1 .4 1 1v2zm-6-8c0 .6-.4 1-1 1H15c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h22c.6 0 1 .4 1 1v2zm0-8c0 .6-.4 1-1 1H15c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h22c.6 0 1 .4 1 1v2z"></path>
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (!url().trim()) {
              toast.error("Please enter a valid URL", {
                duration: 3000,
                position: "bottom-center",
                style: { "font-size": "16px" },
              });
            } else {
              fetchData();
            }
          }}
          class="mr-2 p-1 bg-blue-600 shadow-md h-10 rounded text-white"
        >
          <span class="px-1 flex items-center font-medium tracking-wide">Download</span>
        </button>
      </div>

      {loading() && (
        <div class="flex justify-center">
          {/* Loader SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
            width="200"
            height="200"
            style={{ shapeRendering: "auto", display: "block", background: "transparent" }}
          >
            <circle cx="84" cy="50" r="10" fill="#527eff">
              <animate attributeName="r" dur="0.25s" values="10;0" repeatCount="indefinite" />
              <animate attributeName="fill" dur="1s" values="#527eff;#2a12ff;#6ad6f8;#50d6d2;#527eff" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="50" r="10" fill="#527eff">
              <animate attributeName="r" dur="1s" values="0;0;10;10;10" repeatCount="indefinite" />
              <animate attributeName="cx" dur="1s" values="16;16;16;50;84" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      )}

      {data() && (
        <div class="mt-2">
          {data()!.result.author && (
            <div class="flex justify-center flex-wrap">
              <div class="relative">
                <img
                  crossorigin="anonymous"
                  class="rounded-full h-32 w-32"
                  src={data()!.result.author.avatar ?? ""}
                  alt={data()!.result.author.nickname ?? ""}
                />
                <a
                  class="absolute bottom-0 right-0"
                  href={getDownloadLink(data()!.result.author.avatar ?? "", data()!.result.author.nickname ?? "")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 17h10v-2H7zm5-3l4-4l-1.4-1.4l-1.6 1.55V6h-2v4.15L9.4 8.6L8 10zm0 8q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22" />
                  </svg>
                </a>
              </div>
              <h1 class="text-2xl font-bold text-center w-full mt-2">
                {data()!.result.author.nickname}
              </h1>
            </div>
          )}

          <div>
            <video
              controls
              src={
                data()!.result.videoSD ??
                data()!.result.videoHD ??
                data()!.result.videoWatermark ??
                data()!.result.video_diyoun ??
                data()!.result.music ??
                ""
              }
              class="rounded-md shadow-md my-3 w-3/4 mx-auto"
            ></video>
            <p class="text-center text-lg font-semibold mx-auto">{data()!.result.desc}</p>
          </div>

          <div id="ad-banner" class="flex justify-center my-3"></div>

          <div class="flex flex-col justify-center gap-2 mt-2 rounded-md shadow-md my-3 w-11/12 mx-auto">
            {data()!.result.videoSD && (
              <a
                href={getDownloadLink(data()!.result.videoSD, data()!.result.author?.nickname ?? "")}
                class="p-2 bg-blue-600 shadow-md h-10 rounded text-white"
              >
                Download Video Low Res (No Watermark)
              </a>
            )}
            {data()!.result.videoHD && (
              <a
                href={getDownloadLink(data()!.result.videoHD, data()!.result.author?.nickname ?? "")}
                class="p-2 bg-blue-600 shadow-md h-10 rounded text-white"
              >
                Download Video HD (No Watermark)
              </a>
            )}
            {data()!.result.videoWatermark && (
              <a
                href={getDownloadLink(data()!.result.videoWatermark, data()!.result.author?.nickname ?? "")}
                class="p-2 bg-blue-600 shadow-md h-10 rounded text-white"
              >
                Download Video With Watermark
              </a>
            )}
            {data()!.result.music && (
              <a
                href={getAudioDownloadLink(data()!.result.music, data()!.result.author?.nickname ?? "")}
                class="p-2 bg-blue-600 shadow-md h-10 rounded text-white"
              >
                Download Audio Only (MP3)
              </a>
            )}
            {data()!.result.video_diyoun && (
              <a
                href={getDownloadLink(data()!.result.video_diyoun, data()!.result.author?.nickname ?? "")}
                class="p-2 bg-blue-600 shadow-md h-10 rounded text-white"
              >
                Download Diyoun Video HD (No Watermark)
              </a>
            )}
            <a class="p-2 bg-blue-600 shadow-md h-10 rounded text-white" href="/">
              Download Another Video
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default InputScreen;
