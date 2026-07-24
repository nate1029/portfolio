/* ============================================================
   impulse-slider.js
   Media slider initializer for work portfolio cards (Impulse IDE, Smart SOS Helmet, etc.):
     Slide 0 — YouTube video (autoplay, muted)
     Slide 1 — image
   Video plays once → holds last frame → auto-swipes to image.
   Supports touch swiping (both left & right), dot indicators, and prev/next arrows.
   ============================================================ */

(function () {
  "use strict";

  var pendingYTInits = [];

  function initSlider(media) {
    var dots     = media.querySelectorAll(".cs-dot");
    var prevBtn  = media.querySelector(".cs-arrow--prev");
    var nextBtn  = media.querySelector(".cs-arrow--next");
    var ytWrap   = media.querySelector(".cs-yt-wrap");

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

      /* Pause video when leaving slide 0 */
      if (idx !== 0 && ytPlayer) {
        try { ytPlayer.pauseVideo(); } catch (e) {}
      }

      /* When returning to slide 0, reset & replay video */
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

    /* ---- Dots ---- */
    dots.forEach(function (dot) {
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        goTo(parseInt(dot.dataset.target, 10));
      });
    });

    /* ---- Arrows ---- */
    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        goTo(currentSlide - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        goTo(currentSlide + 1);
      });
    }

    /* ---- Touch / Swipe navigation ---- */
    var touchStartX = null;
    var touchStartY = null;

    media.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    media.addEventListener("touchend", function (e) {
      if (touchStartX === null || touchStartY === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;

      /* Horizontal gesture check (>40px and more horizontal than vertical) */
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          /* Swiped left -> Next slide */
          goTo(currentSlide + 1);
        } else {
          /* Swiped right -> Previous slide (back to video) */
          goTo(currentSlide - 1);
        }
      }
    }, { passive: true });

    /* ---- Queue YouTube Player Init ---- */
    if (ytWrap && ytWrap.id && ytWrap.dataset.videoId) {
      pendingYTInits.push({
        elementId: ytWrap.id,
        videoId: ytWrap.dataset.videoId,
        onPlayerCreated: function (player) {
          ytPlayer = player;
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
        }
      });
    }
  }

  /* Initialize all sliders on DOM ready */
  document.querySelectorAll(".cs-media--slider").forEach(initSlider);

  /* ---- YouTube IFrame API callback ---- */
  var _prev = window.onYouTubeIframeAPIReady || null;
  window.onYouTubeIframeAPIReady = function () {
    if (_prev) _prev();

    pendingYTInits.forEach(function (item) {
      var player = new YT.Player(item.elementId, {
        width:  "100%",
        height: "100%",
        videoId: item.videoId,
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
            e.target.playVideo();
          },
          onStateChange: item.onStateChange
        }
      });
      item.onPlayerCreated(player);
    });
  };
})();
