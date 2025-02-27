// ==UserScript==
// @name         视频精确控制工具
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  为不方便进行控制的视频添加悬浮在屏幕下方的精确控制工具条
// @author       wen2so
// @match        *://*/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // 创建悬浮控制面板
  const controller = document.createElement("div");
  controller.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.2);
        padding: 10px;
        border-radius: 25px;
        display: flex;
        gap: 10px;
        z-index: 99999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        backdrop-filter: blur(5px);
        align-items: center;
    `;

  // 创建控制按钮
  const createButton = (text, seconds) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 15px;
            background: rgba(100,255,255,0.2);
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        `;
    btn.addEventListener("click", () => adjustVideoTime(seconds));
    btn.addEventListener(
      "mousedown",
      () => (btn.style.transform = "scale(0.95)")
    );
    btn.addEventListener("mouseup", () => (btn.style.transform = "scale(1)"));
    btn.addEventListener(
      "mouseleave",
      () => (btn.style.transform = "scale(1)")
    );
    return btn;
  };

  // 创建按钮组容器
  const buttonGroupColumn = document.createElement("div");
  buttonGroupColumn.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
  `;

  // 创建后退按钮行
  const backButtonRow = document.createElement("div");
  backButtonRow.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: flex-end;
  `;

  // 创建前进按钮行（放在上方）
  const forwardButtonRow = document.createElement("div");
  forwardButtonRow.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: flex-end;
  `;

  // 添加按钮到对应容器（注意顺序反转）
  forwardButtonRow.appendChild(createButton("5s»", 5));
  forwardButtonRow.appendChild(createButton("30s»", 30));
  forwardButtonRow.appendChild(createButton("1m»", 60));

  backButtonRow.appendChild(createButton("«1m", -60));
  backButtonRow.appendChild(createButton("«30s", -30));
  backButtonRow.appendChild(createButton("«5s", -5));

  // 将按钮行添加到列容器（前进在上方）
  buttonGroupColumn.appendChild(forwardButtonRow);
  buttonGroupColumn.appendChild(backButtonRow);

  // 将按钮组添加到控制面板
  controller.appendChild(buttonGroupColumn);

  // 创建工具组容器
  const toolGroupColumn = document.createElement("div");
  buttonGroupColumn.style.cssText = `
       display: flex;
       flex-direction: column;
       gap: 8px;
   `;

  // 创建倍率行
  const speedRow = document.createElement("div");
  speedRow.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: flex-end;
  `;

  // 添加播放速率控制
  const speedControl = document.createElement("select");
  speedControl.innerHTML = `
    <option value="0.5">0.5x</option>
    <option value="1" selected>1x</option>
    <option value="1.5">1.5x</option>
    <option value="2">2x</option>
  `;
  speedControl.style.cssText = `
    background: rgba(0,0,0,0.2);
    color: white;
    border: none;
    border-radius: 15px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
  `;
  speedControl.onchange = (e) => {
    document
      .querySelectorAll("video")
      .forEach((v) => (v.playbackRate = e.target.value));
  };

  // 创建精确控制行
  const progressRow = document.createElement("div");
  progressRow.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: flex-end;
  `;

  // 添加精确进度控制
  const progressContainer = document.createElement("div");
  progressContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  // 当前时间显示
  const currentTimeDisplay = document.createElement("span");
  currentTimeDisplay.textContent = "00:00";
  currentTimeDisplay.style.cssText = `
    color: white;
    font-size: 14px;
  `;

  // 精确时间输入框
  const timeInput = document.createElement("input");
  timeInput.type = "number";
  timeInput.min = 0;
  timeInput.step = 1;
  timeInput.style.cssText = `
    width: 80px;
    padding: 8px;
    border: none;
    border-radius: 15px;
    background: rgba(0,0,0,0.2);
    color: white;
    font-size: 14px;
  `;

  // 创建应用按钮
  const applyButton = document.createElement("button");
  applyButton.textContent = "应用";
  applyButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 15px;
    background: rgba(100,255,255,0.2);
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  `;
  applyButton.addEventListener("click", () => {
    const time = parseFloat(timeInput.value);
    if (!isNaN(time)) {
      document.querySelectorAll("video").forEach((v) => {
        const validTime = Math.max(0, Math.min(time, v.duration));
        v.currentTime = validTime;
        timeInput.value = validTime; // 更新输入框为实际应用的时间
      });
    }
  });
  applyButton.addEventListener(
    "mousedown",
    () => (applyButton.style.transform = "scale(0.95)")
  );
  applyButton.addEventListener(
    "mouseup",
    () => (applyButton.style.transform = "scale(1)")
  );
  applyButton.addEventListener(
    "mouseleave",
    () => (applyButton.style.transform = "scale(1)")
  );

  speedRow.appendChild(speedControl);
  speedRow.appendChild(applyButton);
  toolGroupColumn.appendChild(speedRow);

  controller.appendChild(toolGroupColumn);

  progressRow.appendChild(currentTimeDisplay);
  progressRow.appendChild(timeInput);
  toolGroupColumn.appendChild(progressRow);

  controller.appendChild(toolGroupColumn);

  // 插入控制面板
  document.body.appendChild(controller);

  // 调整视频时间
  function adjustVideoTime(seconds) {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      try {
        const newTime = video.currentTime + seconds;
        video.currentTime = Math.max(0, Math.min(newTime, video.duration));
      } catch (error) {
        console.log("视频控制错误:", error);
      }
    });
  }

  // 更新当前时间和输入框
  function updateTimeDisplay() {
    const video = document.querySelector("video");
    if (video) {
      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);
      currentTimeDisplay.textContent = `${formatTime(
        currentTime
      )} / ${formatTime(duration)}`;
      // 仅在输入框未激活时更新其值
      if (document.activeElement !== timeInput) {
        timeInput.value = currentTime;
      }
    }
  }

  // 格式化时间（秒 -> 分钟:秒）
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // 监听视频时间更新
  setInterval(updateTimeDisplay, 500);

  // 动态内容检测（针对SPA）
  const observer = new MutationObserver(() => {
    if (!document.body.contains(controller)) {
      document.body.appendChild(controller);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
})();
