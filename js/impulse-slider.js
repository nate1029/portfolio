/* ============================================================
   impulse-slider.js
   Two-slide carousel for the Impulse IDE card:
     Slide 0 — YouTube intro video (autoplay, muted)
     Slide 1 — screenshot image
   Video plays once → holds last frame → auto-swipes to image.
   ============================================================ */

(function () {
  "use strict";

  /* ---- DOM refs ---- */
  var media    = document.getElementById("impulse-media");
  var dots     = media ? media.querySelectorAll(".cs-dot")   : [];
  var prevBtn  = media ? media.querySelector(".cs-arrow--prev") : null;
  var nextBtn  = media ? media.querySelector(".cs-arrow--next") : null;

  if (!media) return;

  /* ---- State ---- */
  var currentSlide = 0;
  var totalSlides  = 2;
  var ytPlayer     = null;
  var videoEnded   = false;

  /* ---- Slide to index ---- */
  function goTo(idx) {
    idx = Math.max(0, Math.min(totalSlides - 1, idx));
    currentSlide = idx;
    media.dataset.active = idx;
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === idx);
    });

    /* Pause video when leaving slide 0 */
    if (idx !== 0 && ytPlayer) {
      try { ytPlayer.pauseVideo(); } catch (e) {}
    }
    /* Resume / restart video when going back to slide 0,
       but only if it hasn't ended yet */
    if (idx === 0 && ytPlayer && !videoEnded) {
      try { ytPlayer.playVideo(); } catch (e) {}
    }
  }

  /* ---- Dots ---- */
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      goTo(parseInt(dot.dataset.target, 10));
    });
  });

  /* ---- Arrows ---- */
  if (prevBtn) prevBtn.addEventListener("click", function () { goTo(currentSlide - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { goTo(currentSlide + 1); });

  /* ---- Touch / swipe ---- */
  var touchStartX = null;
  media.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  media.addEventListener("touchend", function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 40) goTo(currentSlide + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---- YouTube IFrame API callback ---- */
  /* The global onYouTubeIframeAPIReady is called by the YT script */
  var _prev = window.onYouTubeIframeAPIReady || null;
  window.onYouTubeIframeAPIReady = function () {
    if (_prev) _prev();

    ytPlayer = new YT.Player("impulse-yt", {
      width:  "100%",
      height: "100%",
      videoId: "kYRS4bwMa9A",
      playerVars: {
        autoplay:       1,   /* autoplay */
        mute:           1,   /* must be muted for browser autoplay policy */
        controls:       0,   /* hide controls for clean look */
        rel:            0,   /* no related videos */
        modestbranding: 1,
        playsinline:    1,
        iv_load_policy: 3,   /* hide annotations */
        disablekb:      1,
        loop:           0,   /* play once */
        enablejsapi:    1,
      },
      events: {
        onReady: function (e) {
          /* Ensure it starts playing */
          e.target.playVideo();
        },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.ENDED) {
            videoEnded = true;

            /* Seek to a fraction before the end so the last frame is visible */
            var dur = ytPlayer.getDuration();
            if (dur > 0) {
              try { ytPlayer.seekTo(dur - 0.05, true); } catch (err) {}
            }
            /* Pause on the last frame */
            try { ytPlayer.pauseVideo(); } catch (err) {}

            /* After a short pause, swipe to the image slide */
            setTimeout(function () {
              goTo(1);
            }, 800);
          }
        },
      },
    });
  };
})();
