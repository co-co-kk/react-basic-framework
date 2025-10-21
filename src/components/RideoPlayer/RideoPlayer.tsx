import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";

export default function RideoPlayer() {
  // 使用在线资源或者公共可访问的URL来播放音频/视频
  const [fileUrl, setFileUrl] = useState<string>(
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  );

  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<boolean>(false); // 初始状态为未播放

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setError(null);
    }
  };

  const handleLocalFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleError = (e: any) => {
    console.error("播放器错误:", e);
    setError("无法播放媒体文件，请检查URL是否正确且可访问");
  };

  const handlePlay = () => {
    setPlaying(true);
    setError(null);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      {/* 隐藏的文件输入框 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="audio/*,video/*"
        onChange={handleFileUpload}
      />

      {/* 选择本地文件按钮 */}
      <button
        onClick={handleLocalFileClick}
        style={{
          marginBottom: "10px",
          padding: "5px 10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "3px",
          cursor: "pointer"
        }}
      >
        选择本地文件
      </button>

      {/* 播放/暂停按钮 */}
      <button
        onClick={() => setPlaying(!playing)}
        style={{
          marginBottom: "10px",
          padding: "5px 10px",
          backgroundColor: playing ? "#dc3545" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "3px",
          cursor: "pointer"
        }}
      >
        {playing ? "暂停" : "播放"}
      </button>
      {/* <Rodeo url={fileUrl}></Rodeo> */}
      <ReactPlayer
        url={fileUrl}
        controls
        width="100%"
        height="100px"
        playing={playing} // 只有用户点击后才播放
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {/* 显示当前播放的URL */}
      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        当前URL: {fileUrl.startsWith('blob:') ? '本地上传文件' : fileUrl}
      </div>

      {/* 显示错误信息 */}
      {error && (
        <div style={{ marginTop: "10px", fontSize: "12px", color: "red" }}>
          错误: {error}
        </div>
      )}

      {/* 显示播放状态 */}
      <div style={{ marginTop: "5px", fontSize: "12px", color: "#333" }}>
        状态: {playing ? "播放中" : "已暂停"}
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Slider } from 'antd';

// 格式化时间函数
const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 0);
    return {
        minutes,
        seconds: remainingSeconds
    };
};


