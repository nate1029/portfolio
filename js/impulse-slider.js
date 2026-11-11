/* ============================================================
   impulse-slider.js
   Media slider for portfolio cards (Impulse IDE, Smart SOS Helmet, etc.)
   Slide 0: YouTube video — loaded lazily on click (no API until needed)
   Slide 1: image
   Video plays once → holds last frame → auto-swipes to image.
   Supports touch swiping, dot indicators, and prev/next arrows.
   ============================================================ */

(function () {
  "use strict";

  var ytApiState = 0; // 0=unloaded, 1=loading, 2=ready
  var pendingYTInits = [];

  function loadYTApi() {
    if (ytApiState > 0) return;
    ytApiState = 1;
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  function createPlayer(item) {
    new YT.Player(item.elementId, {
      width: "100%",
      height: "100%",
      videoId: item.videoId,
      playerVars: {
        autoplay:       1,
        mute:           1,
        controls:       0,
        rel:            0,
        modestbranding: 1,
        playsinline:    1,
        iv_load_policy: 3,
        disablekb:      1,
        loop:           0,
        enablejsapi:    1,
      },
      events: {
        onReady: function (e) { e.target.playVideo(); },
        onStateChange: item.onStateChange,
        onPlayerCreated: item.onPlayerCreated,
      }
    });
  }

  /* ponytail: global callback required by YT API */
  var _prev = window.onYouTubeIframeAPIReady || null;
  window.onYouTubeIframeAPIReady = function () {
    if (_prev) _prev();
    ytApiState = 2;
    pendingYTInits.splice(0).forEach(function (item) {
      var player = new YT.Player(item.elementId, {
        width: "100%",
        height: "100%",
        videoId: item.videoId,
        playerVars: {
          autoplay: 1, mute: 1, controls: 0, rel: 0,
          modestbranding: 1, playsinline: 1, iv_load_policy: 3,
          disablekb: 1, loop: 0, enablejsapi: 1,
        },
        events: {
          onReady: function (e) { e.target.playVideo(); },
          onStateChange: item.onStateChange,
        }
      });
      item.onPlayerCreated(player);
    });
  };

  function initSlider(media) {
    var dots    = media.querySelectorAll(".cs-dot");
    var prevBtn = media.querySelector(".cs-arrow--prev");
    var nextBtn = media.querySelector(".cs-arrow--next");
    var ytWrap  = media.querySelector(".cs-yt-wrap");

    var currentSlide = 0;
    var totalSlides  = 2;
    var ytPlayer     = null;
    var videoEnded   = false;

    function goTo(idx) {
      idx = Math.max(0, Math.min(totalSlides - 1, idx));
      var previousSlide = currentSlide;
      currentSlide = idx;
      media.dataset.active = idx;

      dots.forEach(function (d, i) {
        d.classList.toggle("active", i === idx);
      });

      if (idx !== 0 && ytPlayer) {
        try { ytPlayer.pauseVideo(); } catch (e) {}
      }
      if (idx === 0 && ytPlayer) {
        try {
          if (videoEnded || previousSlide !== 0) {
            videoEnded = false;
            ytPlayer.seekTo(0, true);
          }
          ytPlayer.playVideo();
        } catch (e) {}
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        goTo(parseInt(dot.dataset.target, 10));
      });
    });

    if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); goTo(currentSlide - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); goTo(currentSlide + 1); });

    var touchStartX = null, touchStartY = null;
    media.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });
    media.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      touchStartX = touchStartY = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
        goTo(dx < 0 ? currentSlide + 1 : currentSlide - 1);
    }, { passive: true });

    /* ---- Lazy YouTube: show thumbnail until user clicks play ---- */
    if (ytWrap && ytWrap.id && ytWrap.dataset.videoId) {
      var videoId   = ytWrap.dataset.videoId;
      var elementId = ytWrap.id;

      var thumb = document.createElement("button");
      thumb.className = "yt-thumb";
      thumb.setAttribute("aria-label", "Play video");
      thumb.innerHTML =
        '<img src="https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg" alt="" loading="lazy" decoding="async">' +
        '<span class="yt-play" aria-hidden="true">&#9654;</span>';
      ytWrap.appendChild(thumb);

      thumb.addEventListener("click", function () {
        thumb.remove();

        var item = {
          elementId: elementId,
          videoId:   videoId,
          onPlayerCreated: function (p) { ytPlayer = p; },
          onStateChange: function (e) {
            if (e.data !== YT.PlayerState.ENDED) return;
            videoEnded = true;
            var dur = ytPlayer.getDuration();
            if (dur > 0) try { ytPlayer.seekTo(dur - 0.05, true); } catch (_) {}
            try { ytPlayer.pauseVideo(); } catch (_) {}
            setTimeout(function () { goTo(1); }, 800);
          }
        };

        if (ytApiState === 2) {
          /* API already loaded — create player directly */
          var player = new YT.Player(item.elementId, {
            width: "100%", height: "100%", videoId: item.videoId,
            playerVars: {
              autoplay: 1, mute: 1, controls: 0, rel: 0,
              modestbranding: 1, playsinline: 1, iv_load_policy: 3,
              disablekb: 1, loop: 0, enablejsapi: 1,
            },
            events: {
              onReady: function (e) { e.target.playVideo(); },
              onStateChange: item.onStateChange,
            }
          });
          ytPlayer = player;
        } else {
          pendingYTInits.push(item);
          loadYTApi();
        }
      });
    }
  }

  document.querySelectorAll(".cs-media--slider").forEach(initSlider);
})();
