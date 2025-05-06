const DURATION = 15000;
const BASE_URL = "https://www.youtube.com/embed";
const THUMBNAIL_URL = "https://img.youtube.com/vi";

let player;
let isVideoStarted = false;
let videoStartTime = 0;
let totalTimeWatched = 0;
let ytplayer = document.getElementById("ytplayer");

const progress = document.getElementById("progress");
const thumbnail = document.getElementById("thumbnail");
const countdownText = document.getElementById("countdownText");
const countdownRing = document.getElementById("countdownRing");
const couponBtn = document.getElementById("couponBtn");
const closeIcon = document.getElementById("close-icon");
const landingPage = document.getElementById("landingpage");
const adsContainer = document.getElementById("ads");
const content = document.getElementById("content");
const overlay = document.getElementById("overlay");
const btnShowAds = document.getElementById("btnShowAds");
const btnDownloadApp = document.getElementById("btnDownloadApp");

btnShowAds.addEventListener("click", () => {
  showAds();
});
btnDownloadApp.addEventListener("click", () => {
  downloadApp();
});
closeIcon.addEventListener("click", () => {
  closeAds();
});

export function handleYouTubeIframeAPI() {
  loadThumbnail();
}

function loading() {
  overlay.style.display = "block";
  content.style.display = "none";
}

function hideLoading() {
  overlay.style.display = "none";
  content.style.display = "block";
}

function downloadApp() {
  //TODO toggle input field
  alert("TEST");
}

async function loadThumbnail() {
  loading();
  const videoId = await getRandomVideo();
  if (!document.getElementById("ytplayer")) {
    const iframe = document.createElement("iframe");
    iframe.id = "ytplayer";
    iframe.className = "w-100 h-100";
    iframe.frameborder = "0";
    iframe.allowFullscreen = true;
    iframe.controls = "1";
    adsContainer.appendChild(iframe);
    ytplayer = document.getElementById("ytplayer");
  }
  ytplayer.src = `${BASE_URL}/${videoId}?controls=0&showinfo=0&enablejsapi=1&modestbranding=1`;
  thumbnail.style.backgroundImage = `url("${THUMBNAIL_URL}/${videoId}/hqdefault.jpg")`;
  hideLoading();
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    if (!isVideoStarted) {
      isVideoStarted = true;
      if (totalTimeWatched == 0) countdownRing.style.display = "flex";
      startCountdownTimer();
    }
    videoStartTime = Date.now();
  } else if (event.data == YT.PlayerState.PAUSED) {
    totalTimeWatched += Date.now() - videoStartTime;
    isVideoStarted = false;
  } else if (event.data == YT.PlayerState.ENDED) {
    totalTimeWatched = 0;
  }
}

function startCountdownTimer() {
  const circleLength = 2 * Math.PI * 21;

  const interval = setInterval(() => {
    if (!isVideoStarted || totalTimeWatched >= DURATION) {
      clearInterval(interval);
      return;
    }

    let watchedTime = totalTimeWatched + (Date.now() - videoStartTime);
    countdownText.textContent = Math.ceil((DURATION - watchedTime) / 1000);
    progress.style.strokeDashoffset = (-watchedTime / DURATION) * circleLength;

    if (watchedTime >= DURATION) {
      couponBtn.style.display = "block";
      closeIcon.style.display = "block";
      countdownRing.style.display = "none";
      clearInterval(interval);
    }
  }, 1000);
}

function closeAds() {
  landingPage.style.display = "block";
  adsContainer.style.display = "none";
  couponBtn.style.display = "none";
  closeIcon.style.display = "none";
  countdownRing.style.display = "none";
  progress.style.strokeDashoffset = 0;
  countdownText.textContent = DURATION / 1000;

  totalTimeWatched = 0;
  isVideoStarted = false;

  if (player) {
    player.destroy();
    player = null;
    loadThumbnail();
  }
}

function showAds() {
  landingPage.style.display = "none";
  adsContainer.style.display = "block";

  player = new YT.Player("ytplayer", {
    events: {
      onStateChange: onPlayerStateChange,
    },
  });
}

async function getRandomVideo() {
  const response = await fetch("./data.json");
  const data = await response.json();
  const videoIds = data.videoIds;
  const key = "videoOpened";
  let used = JSON.parse(localStorage.getItem(key)) || [];

  if (used.length >= videoIds.length) used = [];

  let index;
  do {
    index = Math.floor(Math.random() * videoIds.length);
  } while (used.includes(index));

  used.push(index);
  localStorage.setItem(key, JSON.stringify(used));
  return videoIds[index];
}
