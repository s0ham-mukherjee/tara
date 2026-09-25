/* TARA site.js v5 — base UX (loader, nav, reveal, counters, form)
   + GOATED SCROLL LAYER: progress bar, hero drift, velocity marquee,
   tall scrolly flight, ghost words, timeline fill, card tilt.
   Transform/opacity only, single rAF heartbeat, RM-safe. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  document.addEventListener("DOMContentLoaded", function () {
    initLoader();
    initNav();
    initSponsorCheckout();
    initReveal();
    initCounters();
    initForm();
    initYear();
    initScrollEngine();
    initScrollSpy();
    initToTop();
    initMagnetic();
    initCursor();
    initCopyEmail();
  });

  /* ---------------- Base ---------------- */

  function initLoader() {
    var loader = document.querySelector(".page-loader");
    if (!loader) {
      document.body.classList.add("is-ready");
      return;
    }
    var done = false;
    var dismiss = function () {
      if (done) return;
      done = true;
      loader.classList.add("is-loaded");
      loader.setAttribute("aria-hidden", "true");
      document.body.classList.add("is-ready"); // hero entrance choreography + scroll unlock
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 500);
    };
    if (document.readyState === "complete") {
      setTimeout(dismiss, 350);
    } else {
      window.addEventListener("load", function () { setTimeout(dismiss, 350); }, { once: true });
      setTimeout(dismiss, 2200);
    }
  }

  /* ----- Sponsorships: Dodo Payments checkout (coming-soon guard) -----
     The button goes live once its href is replaced with a real Dodo
     payment link (https://checkout.dodopayments.com/...). Until then,
     intercept the click and show the coming-soon note instead of
     following the placeholder URL. */
  function initSponsorCheckout() {
    var btns = document.querySelectorAll("[data-sponsor-checkout]");
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var url = btn.getAttribute("href") || "";
        if (url.indexOf("REPLACE-WITH-YOUR-PAYMENT-LINK") === -1) return; // live link: follow it
        e.preventDefault();
        var scope = btn.closest(".split") || btn.parentElement;
        var msg = scope ? scope.querySelector(".sponsor-message") : null;
        if (msg) {
          msg.textContent = "Sponsorship checkout via Dodo Payments opens soon — write to us at smukherjee_be26@thapar.edu to pledge early and we'll reserve your slot.";
          msg.style.display = "block";
        }
      });
    });
  }

  function initNav() {
    var toggle = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .section-header > div, .section-header > p, .split > div");
    if (!els.length) return;
    var groups = new Map();
    els.forEach(function (el) {
      var p = el.parentElement;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(el);
    });
    groups.forEach(function (list) {
      list.forEach(function (el, i) {
        if (i > 0 && i < 6) el.style.transitionDelay = Math.min(360, i * 70) + "ms";
      });
    });
    if (RM || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function initCounters() {
    var els = document.querySelectorAll(".stat strong");
    if (!els.length) return;
    var run = function (el) {
      var m = /^(\d+)(\D*)$/.exec(el.textContent.trim());
      if (!m) return;
      var target = parseInt(m[1], 10);
      var suf = m[2] || "";
      var pad = m[1].length;
      if (RM) { el.textContent = String(target).padStart(pad, "0") + suf; return; }
      var t0 = performance.now(), dur = 1100;
      var step = function (t) {
        var k = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        el.textContent = String(Math.round(target * e)).padStart(pad, "0") + suf;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var TO = ["smukherjee_be26@thapar.edu", "dpande_be26@thapar.edu"];
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (name) {
        var f = form.elements[name];
        return f ? String(f.value || "").trim() : "";
      };
      var name = get("name"), year = get("year"), email = get("email"),
          dept = get("department"), message = get("message");
      var subject = "TARA application — " + (name || "New applicant") + (dept ? " (" + dept + ")" : "");
      var body = ["Name: " + name, "Year / programme: " + year, "Email: " + email,
        "Preferred department: " + dept, "", "Why TARA?", message].join("\n");
      window.location.href = "mailto:" + TO.join(",") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      var msg = form.querySelector(".form-message");
      if (msg) {
        msg.textContent = "Opening your email app addressed to the TARA leads — hit send to deliver your application. We'll respond shortly.";
        msg.style.display = "block";
      }
      form.reset();
    });
  }

  /* ----- Scrollspy: highlight in-page nav anchors while in view ----- */
  function initScrollSpy() {
    var nav = document.querySelector(".nav-links");
    if (!nav || !("IntersectionObserver" in window)) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href*="#"]'));
    var pairs = [];
    links.forEach(function (a) {
      var url;
      try { url = new URL(a.getAttribute("href"), location.href); }
      catch (e) { return; }
      if (url.pathname !== location.pathname || !url.hash) return;
      var t = document.getElementById(url.hash.slice(1));
      if (t) pairs.push({ link: a, target: t });
    });
    if (!pairs.length) return;
    var fallback = nav.querySelector("a.active");
    var setActive = function (link) {
      nav.querySelectorAll("a").forEach(function (a) { a.classList.remove("active"); });
      (link || fallback).classList.add("active");
    };
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting;
      });
      var current = null;
      pairs.forEach(function (p) { if (visible[p.target.id]) current = p.link; });
      setActive(current);
    }, { rootMargin: "-38% 0px -52% 0px" });
    pairs.forEach(function (p) { io.observe(p.target); });
  }

  /* ----- Reticle cursor + cursor speedometer (fine pointers, motion-safe) -----
     Both elements are injected so every page gets them with zero markup
     edits. Skipped entirely for touch and reduced-motion users. */
  function initCursor() {
    if (!FINE || RM) return;
    var cur = document.createElement("div");
    cur.className = "reticle-cursor";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<span class="ret-ring"></span><span class="ret-tick t"></span><span class="ret-tick b"></span><span class="ret-tick l"></span><span class="ret-tick r"></span><span class="ret-dot"></span>';
    document.body.appendChild(cur);

    var speedo = document.createElement("div");
    speedo.className = "cursor-speedo";
    speedo.setAttribute("aria-hidden", "true");
    speedo.innerHTML = '<span>VEL <b>0 M/S</b></span><span class="speedo-track"><span class="speedo-burn"></span><span class="speedo-rocket"><svg viewBox="0 0 90 210" aria-hidden="true"><path d="M45 4C24 27 19 61 19 125l26 45 26-45C71 61 66 27 45 4Z" fill="#f5f2ec" stroke="#ff8a3d" stroke-width="7"/></svg></span></span>';
    document.body.appendChild(speedo);
    var readNum = speedo.querySelector("b");
    var burn = speedo.querySelector(".speedo-burn");
    var marker = speedo.querySelector(".speedo-rocket");
    var track = speedo.querySelector(".speedo-track");
    var trackW = 110;
    var measureTrack = function () { if (track) trackW = track.clientWidth || 110; };
    measureTrack();
    window.addEventListener("resize", measureTrack, { passive: true });

    document.documentElement.classList.add("has-cursor");

    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var tx = x, ty = y, shown = false;
    var sm = 0, lastT = 0, lastX = null, lastY = null, lastText = 0;

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") {
        document.documentElement.classList.remove("has-cursor"); // hybrid touch: restore native cursor
        return;
      }
      document.documentElement.classList.add("has-cursor");
      var now = performance.now();
      tx = e.clientX; ty = e.clientY;
      if (lastX !== null && now > lastT) {
        var d = Math.hypot(tx - lastX, ty - lastY);
        var v = d / Math.max(1, now - lastT) * 1000; // px/s
        sm = lerp(sm, Math.min(4000, v), 0.35);
      }
      lastX = tx; lastY = ty; lastT = now;
      if (!shown) { shown = true; cur.classList.add("on"); }
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", function () {
      cur.classList.remove("on"); shown = false; lastX = null;
    });

    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      cur.classList.toggle("hot", !!(t && t.closest && t.closest("a,button,input,select,textarea,label,summary")));
    });

    function frame(now) {
      x = lerp(x, tx, 0.35); y = lerp(y, ty, 0.35);
      cur.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      if (now - lastT > 90) sm = lerp(sm, 0, 0.18); // decay at rest
      var pct = clamp01(sm / 2600);
      cur.style.setProperty("--spread", (4 + pct * 9).toFixed(1) + "px");
      if (burn) burn.style.transform = "scaleX(" + pct.toFixed(3) + ")";
      if (marker) marker.style.transform = "translate(-50%,-50%) translateX(" + (pct * trackW).toFixed(1) + "px)";
      if (now - lastText > 100) {
        lastText = now;
        if (readNum) readNum.textContent = Math.round(sm / 6) + " M/S";
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ----- Copy-email fallback (for devices with no mail app set) ----- */
  function initCopyEmail() {
    var btns = document.querySelectorAll("[data-copy-email]");
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var addr = btn.getAttribute("data-copy-email") || "";
        var done = function () {
          var scope = btn.closest(".split") || btn.parentElement;
          var msg = scope ? scope.querySelector(".sponsor-message") : null;
          if (msg) {
            msg.textContent = "Email copied: " + addr + " — paste it into your mail app to pledge.";
            msg.style.display = "block";
          } else {
            btn.textContent = "Copied!";
            setTimeout(function () { btn.textContent = "Copy email"; }, 2000);
          }
        };
        var fallback = function () {
          var ta = document.createElement("textarea");
          ta.value = addr;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          if (ta.parentNode) ta.parentNode.removeChild(ta);
          done();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(addr).then(done, fallback);
        } else {
          fallback();
        }
      });
    });
  }

  /* ----- Back to top ----- */
  function initToTop() {
    var btn = document.createElement("button");
    btn.className = "to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = "&uarr;";
    document.body.appendChild(btn);
    var ticking = false;
    var update = function () {
      ticking = false;
      btn.classList.toggle("show", (window.scrollY || 0) > 700);
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" });
    });
    update();
  }

  /* ----- Magnetic buttons (fine pointers only) ----- */
  function initMagnetic() {
    if (!FINE || RM) return;
    document.querySelectorAll(".button, .nav-cta").forEach(function (el) {
      el.classList.add("magnetic");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var x = Math.max(-7, Math.min(7, dx * 0.12));
        var y = Math.max(-5, Math.min(5, dy * 0.16));
        el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------- Scroll engine ----------------
     One rAF heartbeat drives every effect from a single
     scrollY read. Effects self-skip when offscreen. */

  function initScrollEngine() {
    // Progress bar (injected so every page gets it, zero markup edits)
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "<i></i>";
    document.body.prepend(bar);
    var barFill = bar.querySelector("i");

    var hero = document.querySelector(".hero-content");
    var aboutHero = document.querySelector(".about-hero-content");
    var flight = document.querySelector("#rocket-flight");
    var ticker = document.querySelector(".ticker");
    var drifts = Array.prototype.slice.call(document.querySelectorAll("[data-drift]"));
    var parallaxes = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    var timelines = Array.prototype.slice.call(document.querySelectorAll(".timeline"));
    var tiltCards = (FINE && !RM)
      ? Array.prototype.slice.call(document.querySelectorAll(".dept-card, .hod-card"))
      : [];
    var header = document.querySelector(".site-header");
    var navLinks = document.querySelector(".nav-links");
    var hodImgs = RM
      ? []
      : Array.prototype.slice.call(document.querySelectorAll(".hod-photo img"));
    hodImgs.forEach(function (img) {
      img._hov = false;
      var card = img.closest(".hod-card");
      if (card) {
        card.addEventListener("pointerenter", function () { img._hov = true; });
        card.addEventListener("pointerleave", function () { img._hov = false; });
      }
    });
    if (!RM) setupQuotes();

    var flightParts = null;
    if (flight) flightParts = setupFlight(flight);
    if (ticker && !RM && window.innerWidth > 720) setupMarquee(ticker);
    timelines.forEach(function (tl) { tl.classList.add("goated"); });
    tiltCards.forEach(function (c) { c.classList.add("tilt"); });

    var lastY = window.scrollY || 0;
    var vel = 0;            // smoothed scroll velocity
    var marqueeX = 0;
    var marqueeBase = 0.6;  // px per frame at rest
    var ticking = false;

    var heroH = hero ? hero.offsetHeight : 0;
    var aboutH = aboutHero ? aboutHero.offsetHeight : 0;

    function frame() {
      ticking = false;
      var y = window.scrollY || 0;
      var vh = window.innerHeight || 800;
      var max = Math.max(1, document.documentElement.scrollHeight - vh);

      // 1 · progress
      barFill.style.transform = "scaleX(" + (y / max).toFixed(4) + ")";

      // 0 · header state (hide on scroll down, solidify)
      if (header && !RM) {
        header.classList.toggle("scrolled", y > 30);
        var menuOpen = navLinks && navLinks.classList.contains("open");
        if (!menuOpen && y > 560 && y > lastY + 3) header.classList.add("hide");
        else if (y < lastY - 3 || y <= 560) header.classList.remove("hide");
      }

      // velocity (smoothed, for marquee + tilt)
      var rawV = y - lastY;
      lastY = y;
      vel = lerp(vel, rawV, 0.12);

      // 2 · hero drift + fade (only while hero on screen)
      if (hero && y < heroH + vh * 0.5 && !RM) {
        var hp = clamp01(y / Math.max(1, heroH));
        hero.style.transform = "translate3d(0," + (hp * 90).toFixed(1) + "px,0)";
        hero.style.opacity = String((1 - hp * 1.15).toFixed(3));
      }
      if (aboutHero && y < aboutH + vh * 0.6 && !RM) {
        var ap = clamp01(y / Math.max(1, aboutH));
        aboutHero.style.transform = "translate3d(0," + (ap * 80).toFixed(1) + "px,0)";
        aboutHero.style.opacity = String((1 - ap * 1.1).toFixed(3));
      }

      // 3 · generic parallax + ghost drift
      if (!RM) {
        for (var i = 0; i < parallaxes.length; i++) {
          var el = parallaxes[i];
          if (el === hero) continue; // hero handled above
          var sp = parseFloat(el.getAttribute("data-parallax")) || 0;
          if (!sp) continue;
          var r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) continue;
          el.style.transform = "translate3d(0," + (y * sp).toFixed(1) + "px,0)";
        }
        for (var j = 0; j < drifts.length; j++) {
          var g = drifts[j];
          var gr = g.getBoundingClientRect();
          if (gr.bottom < -300 || gr.top > vh + 300) continue;
          var gp = clamp01((vh - gr.top) / (vh + gr.height));
          var speed = parseFloat(g.getAttribute("data-drift")) || 60;
          g.style.transform = "translate3d(" + ((gp - 0.5) * speed).toFixed(1) + "px,0,0)";
        }
      }

      // 4 · timelines fill + light items
      for (var k = 0; k < timelines.length; k++) {
        driveTimeline(timelines[k], vh);
      }

      // 5 · marquee advance (rest speed + velocity kick)
      if (ticker && ticker._goated) {
        var tr = ticker.getBoundingClientRect();
        if (tr.bottom > -100 && tr.top < vh + 100) {
          var half = ticker._half || 1;
          marqueeX -= marqueeBase + Math.min(14, Math.abs(vel) * 0.35);
          if (-marqueeX >= half) marqueeX += half;
          ticker._track.style.transform = "translate3d(" + marqueeX.toFixed(1) + "px,0,0)";
        }
      }

      // 6 · flight
      if (flightParts) driveFlight(flightParts);

      // 7 · tilt (fine pointers only, tiny skew from velocity)
      if (tiltCards.length) {
        var skew = Math.max(-4, Math.min(4, vel * 0.12));
        for (var m = 0; m < tiltCards.length; m++) {
          var c = tiltCards[m];
          var cr = c.getBoundingClientRect();
          if (cr.bottom < -160 || cr.top > vh + 160) {
            if (c._tilted) { c.style.transform = ""; c._tilted = false; }
            continue;
          }
          c.style.transform = "skewY(" + skew.toFixed(2) + "deg)";
          c._tilted = true;
        }
        if (Math.abs(skew) < 0.02) {
          for (var n = 0; n < tiltCards.length; n++) {
            tiltCards[n].style.transform = "";
            tiltCards[n]._tilted = false;
          }
        }
      }

      // 8 · quote word-scrub
      if (!RM) driveQuotes(vh);

      // 9 · HOD photo parallax + settle zoom
      if (hodImgs.length) drivePhotos(vh);
    }

    function request() {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", function () {
      heroH = hero ? hero.offsetHeight : 0;
      aboutH = aboutHero ? aboutHero.offsetHeight : 0;
      if (flightParts) measureFlight(flightParts);
      request();
    });
    frame();
  }

  /* ----- Velocity marquee: duplicate track, loop seamlessly ----- */
  function setupMarquee(ticker) {
    var track = ticker.querySelector(".ticker-track");
    if (!track || ticker._goated) return;
    ticker.classList.add("goated");
    track.innerHTML = track.innerHTML + track.innerHTML; // 2x for loop
    requestAnimationFrame(function () {
      ticker._track = track;
      ticker._half = track.scrollWidth / 2;
      ticker._goated = true;
    });
  }

  /* ----- Tall scrolly flight ----- */
  function setupFlight(section) {
    var rocket = section.querySelector(".scroll-rocket");
    var stage = section.querySelector(".rocket-flight-stage");
    var altitude = section.querySelector("#flight-altitude");
    var velChip = section.querySelector("#flight-velocity");
    var stageChip = section.querySelector("#flight-stage-name");
    var flame = section.querySelector(".rocket-flame");
    var stars = section.querySelector(".flight-stars");
    var steps = Array.prototype.slice.call(section.querySelectorAll(".flight-step"));
    if (!rocket || !stage) return null;

    var wide = window.innerWidth > 1000;
    if (!RM && wide) section.classList.add("goated");
    else {
      if (altitude) altitude.textContent = "10000";
      steps.forEach(function (s) { s.classList.remove("is-active"); });
      if (steps.length) steps[steps.length - 1].classList.add("is-active");
      return null;
    }

    // glow wash behind rocket, driven by --glow
    var glow = document.createElement("div");
    glow.className = "flight-stage-glow";
    glow.setAttribute("aria-hidden", "true");
    stage.appendChild(glow);

    var P = { section: section, rocket: rocket, stage: stage, altitude: altitude,
      velChip: velChip, stageChip: stageChip, flame: flame, stars: stars,
      steps: steps, names: ["STAND-UP", "BUILD-UP", "VERIFY", "LAUNCH"] };
    measureFlight(P);
    return P;
  }

  function measureFlight(P) {
    P.stageH = P.stage.clientHeight || 500;
    P.travel = Math.max(0, P.stageH - 200);
  }

  var FLIGHT_VMAX = 620; // m/s display peak for the velocity chip

  function driveFlight(P) {
    var rect = P.section.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    var total = Math.max(1, rect.height - vh);
    var p = clamp01((vh * 0.5 - rect.top) / total);
    var eased = p * p * (3 - 2 * p);

    P.rocket.style.transform =
      "translate3d(0," + ((1 - eased) * P.travel).toFixed(1) + "px,0)" +
      " rotate(" + ((p - 0.5) * 6).toFixed(2) + "deg)" +
      " scale(" + (0.94 + p * 0.1).toFixed(3) + ")";
    if (P.flame) P.flame.style.setProperty("--flame", (0.7 + p * 1.1).toFixed(2));
    P.stage.style.setProperty("--glow", (0.25 + p * 0.75).toFixed(2));
    if (P.stars) P.stars.style.transform = "translate3d(0," + (p * -70).toFixed(1) + "px,0)";

    if (P.altitude) P.altitude.textContent = String(Math.round(eased * 10000)).padStart(3, "0");
    if (P.velChip) {
      var v = Math.round(Math.sin(p * Math.PI) * FLIGHT_VMAX);
      P.velChip.innerHTML = "VEL <b>" + v + " M/S</b>";
    }
    var idx = Math.min(P.steps.length - 1, Math.floor(p * P.steps.length));
    P.steps.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
    if (P.stageChip && P.names[idx]) P.stageChip.innerHTML = "STAGE <b>" + P.names[idx] + "</b>";
  }

  /* ----- Timeline: fill line + light items by viewport progress ----- */
  /* ----- Quote word-scrub: split once, light words with scroll ----- */
  function setupQuotes() {
    document.querySelectorAll(".quote").forEach(function (q) {
      if (q._split) return;
      q._split = true;
      var nodes = Array.prototype.slice.call(q.childNodes);
      q.innerHTML = "";
      nodes.forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) q.appendChild(document.createTextNode(" "));
            else {
              var s = document.createElement("span");
              s.className = "w";
              s.textContent = part;
              q.appendChild(s);
            }
          });
        } else if (n.nodeType === 1) {
          var s = document.createElement("span");
          s.className = "w";
          s.appendChild(n);
          q.appendChild(s);
        }
      });
      q._words = Array.prototype.slice.call(q.querySelectorAll(".w"));
      q.classList.add("scrub");
    });
  }

  function driveQuotes(vh) {
    document.querySelectorAll(".quote.scrub").forEach(function (q) {
      if (!q._words || !q._words.length) return;
      var r = q.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = clamp01((vh * 0.85 - r.top) / Math.max(1, vh * 0.45));
      var n = q._words.length;
      q._words.forEach(function (w, i) {
        w.style.opacity = (p * (n + 2)) - 1 > i ? "1" : "";
      });
    });
  }

  /* ----- HOD photo parallax + settle zoom (owns img transform) ----- */
  function drivePhotos(vh) {
    for (var i = 0; i < hodImgs.length; i++) {
      var img = hodImgs[i];
      var box = img.closest(".hod-photo");
      if (!box) continue;
      var r = box.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120 || r.height < 2) continue;
      var center = r.top + r.height / 2 - vh / 2;
      var py = Math.max(-10, Math.min(10, center * -0.06));
      var vis = clamp01((vh * 0.92 - r.top) / Math.max(1, vh * 0.5));
      var e = 1 - Math.pow(1 - vis, 3);
      var s = 1.22 - 0.12 * e + (img._hov ? 0.03 : 0);
      img.style.transform = "translate3d(0," + py.toFixed(1) + "px,0) scale(" + s.toFixed(3) + ")";
    }
  }

  function driveTimeline(tl, vh) {
    var items = tl.querySelectorAll(".timeline-item");
    if (!items.length) return;
    var rect = tl.getBoundingClientRect();
    var p = clamp01((vh * 0.72 - rect.top) / Math.max(1, rect.height));
    tl.style.setProperty("--tp", p.toFixed(3));
    var lit = Math.round(p * items.length);
    items.forEach(function (it, i) { it.classList.toggle("lit", i < lit); });
  }
})();
