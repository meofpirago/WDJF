const duration = 15000;
const baseURL = "https://www.youtube.com/embed";
let player;
let isVideoStarted = false;
let videoStartTime = 0;
let totalTimeWatched = 0;

export async function handleYouTubeIframeAPI() {
  document.getElementById("ytplayer").src = await getVideo();
  player = new YT.Player("ytplayer", {
    events: {
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    if (!isVideoStarted) {
      isVideoStarted = true;
      if (totalTimeWatched == 0)
        document.getElementById("countdownRing").style.display = "flex";
      startTimer();
    }
    videoStartTime = Date.now();
  } else if (event.data == YT.PlayerState.PAUSED) {
    totalTimeWatched += Date.now() - videoStartTime;
    isVideoStarted = false;
  } else if (event.data == YT.PlayerState.ENDED) {
    isVideoStarted = false;
    totalTimeWatched = 0;
  }
}

function startTimer() {
  const interval = setInterval(() => {
    if (!isVideoStarted || totalTimeWatched >= duration) {
      clearInterval(interval);
      return;
    }
    let time = totalTimeWatched;
    time += Date.now() - videoStartTime;
    document.getElementById("countdownText").textContent = Math.ceil(
      (duration - time) / 1000
    );
    const progress = document.getElementById("progress");
    const circleLength = 2 * Math.PI * 12;
    const offset = (-time / duration) * circleLength;
    progress.style.strokeDashoffset = offset;

    if (time >= duration) {
      document.getElementById("couponBtn").style.display = "block";
      document.getElementById("close-icon").style.display = "block";
      document.getElementById("countdownRing").style.display = "none";
      clearInterval(interval);
    }
  }, 1000);
}

export function closeVideo() {
  window.location.href = "/landingpage.html";
}

export function redirectToAds() {
  window.location.href = "/ads.html";
}

async function getVideo() {
  const response = await fetch("./data.json");
  const data = await response.json();
  const videoIds = data.videoIds;
  const key = "videoOpened";
  let used = JSON.parse(localStorage.getItem(key)) || [];

  if (used.length >= videoIds.length) {
    used = [];
  }

  let index;
  do {
    index = Math.floor(Math.random() * videoIds.length);
  } while (used.includes(index));

  used.push(index);
  localStorage.setItem(key, JSON.stringify(used));
  return `${baseURL}/${videoIds[index]}?autoplay=1&controls=0&showinfo=0&enablejsapi=1&modestbranding=1`;
}
