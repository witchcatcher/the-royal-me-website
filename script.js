/* ==========================================================================
   THE ROYAL ME — script.js
   ========================================================================== */

(function () {
  'use strict';

  // --- Star field generator ---
  function createStars() {
    const container = document.getElementById('stars');
    if (!container) return;

    const count = Math.floor(window.innerWidth * window.innerHeight / 800);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2.5 + 0.5;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.setProperty('--duration', (Math.random() * 4 + 2) + 's');
      star.style.setProperty('--max-opacity', (Math.random() * 0.7 + 0.3).toString());
      star.style.animationDelay = Math.random() * 4 + 's';
      fragment.appendChild(star);
    }

    container.appendChild(fragment);
  }

  // --- Navigation scroll behavior ---
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 80) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile nav toggle ---
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    // Close menu when a link is clicked
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var navHeight = document.getElementById('nav').offsetHeight;
        var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      });
    });
  }

  // --- Scroll-triggered fade-in animations ---
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // --- Photo carousel ---
  function initPhotoCarousel() {
    var track = document.getElementById('photo-track');
    var prevBtn = document.getElementById('photo-prev');
    var nextBtn = document.getElementById('photo-next');
    if (!track || !prevBtn || !nextBtn) return;

    var slides = track.querySelectorAll('.photo-slide');
    var currentIndex = 0;

    function getPerPage() {
      if (window.innerWidth <= 480) return 1;
      if (window.innerWidth <= 768) return 2;
      return 3;
    }

    function updateCarousel() {
      var perPage = getPerPage();
      var maxIndex = Math.max(0, slides.length - perPage);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      var slideWidth = track.parentElement.offsetWidth;
      var gap = 12; // 0.75rem
      var singleWidth = (slideWidth - gap * (perPage - 1)) / perPage;
      var offset = currentIndex * (singleWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';
    }

    prevBtn.addEventListener('click', function () {
      var perPage = getPerPage();
      currentIndex = Math.max(0, currentIndex - perPage);
      updateCarousel();
    });

    nextBtn.addEventListener('click', function () {
      var perPage = getPerPage();
      var maxIndex = Math.max(0, slides.length - perPage);
      currentIndex = Math.min(maxIndex, currentIndex + perPage);
      updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
  }

  // --- Photo lightbox ---
  function initLightbox() {
    var carousel = document.getElementById('photo-carousel');
    if (!carousel) return;

    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-nav lightbox-prev" aria-label="Previous">&lsaquo;</button>' +
      '<img src="" alt="">' +
      '<button class="lightbox-nav lightbox-next" aria-label="Next">&rsaquo;</button>';
    document.body.appendChild(lightbox);

    var lightboxImg = lightbox.querySelector('img');
    var slides = Array.from(carousel.querySelectorAll('.photo-slide'));
    var currentIndex = 0;

    function openLightbox(index) {
      if (index < 0 || index >= slides.length) return;
      currentIndex = index;
      var img = slides[index].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    function navigate(dir) {
      currentIndex = (currentIndex + dir + slides.length) % slides.length;
      var img = slides[currentIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }

    carousel.addEventListener('click', function (e) {
      var slide = e.target.closest('.photo-slide');
      if (!slide) return;
      var index = slides.indexOf(slide);
      if (index >= 0) openLightbox(index);
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function (e) {
      e.stopPropagation();
      navigate(-1);
    });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function (e) {
      e.stopPropagation();
      navigate(1);
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  // --- Video carousel ---
  function initVideoCarousel() {
    var videos = [
      'hXZBcf5A15Q',
      'O58VC3oU25I',
      'NFG_4Bky-xk',
      'QaMdXRGJ2aw',
      'PWnb8uWkoKI',
      'JwXDDcw0xoo',
      'vPE-0HXphHE',
      'iUtdWfEMux8',
      '-nE-6K9Q3kM',
      'I_3dShC2-Nw',
      'Hi34-HRkh6w',
      '8mYhIqagwzU',
      '3fIyqgxtPFo',
      'N0WBd1RBdl0'
    ];

    // Shuffle video order on each page load
    for (var i = videos.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = videos[i];
      videos[i] = videos[j];
      videos[j] = temp;
    }

    var player = document.getElementById('video-player');
    var prevBtn = document.getElementById('video-prev');
    var nextBtn = document.getElementById('video-next');
    var dotsContainer = document.getElementById('video-dots');
    if (!player || !prevBtn || !nextBtn || !dotsContainer) return;

    var currentIndex = 0;
    player.src = 'https://www.youtube.com/embed/' + videos[currentIndex];

    // Create dots
    videos.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'video-dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('aria-label', 'Video ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      currentIndex = index;
      player.src = 'https://www.youtube.com/embed/' + videos[currentIndex];
      dotsContainer.querySelectorAll('.video-dot').forEach(function (d, i) {
        d.classList.toggle('active', i === currentIndex);
      });
    }

    prevBtn.addEventListener('click', function () {
      goTo((currentIndex - 1 + videos.length) % videos.length);
    });

    nextBtn.addEventListener('click', function () {
      goTo((currentIndex + 1) % videos.length);
    });
  }

  // --- Shows: fetch from Bandsintown API + tabs ---
  function initShows() {
    var upcomingEl = document.getElementById('shows-upcoming');
    var pastEl = document.getElementById('shows-past');
    if (!upcomingEl || !pastEl) return;

    var API = 'https://rest.bandsintown.com/artists/id_2546533/events?app_id=squarespace-the-royal-me';
    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    upcomingEl.innerHTML = '<div class="shows-loading">Loading shows...</div>';

    // Fetch upcoming
    fetch(API)
      .then(function (r) { return r.json(); })
      .then(function (events) {
        if (!events.length) {
          upcomingEl.innerHTML =
            '<div class="shows-empty"><p>No upcoming shows right now.</p>' +
            '<a href="http://eepurl.com/dHknBz" class="btn btn-primary" target="_blank" rel="noopener">Sign up for shows near you &rarr;</a></div>';
          return;
        }
        upcomingEl.innerHTML = events.map(function (e) { return renderShow(e, true); }).join('');
      })
      .catch(function () {
        upcomingEl.innerHTML = '<div class="shows-loading">Could not load shows.</div>';
      });

    // Fetch past (lazy — only on first tab click)
    var pastLoaded = false;

    // Tab switching
    var tabs = document.querySelectorAll('.shows-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = this.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        upcomingEl.style.display = target === 'upcoming' ? '' : 'none';
        pastEl.style.display = target === 'past' ? '' : 'none';

        if (target === 'past' && !pastLoaded) {
          pastLoaded = true;
          pastEl.innerHTML = '<div class="shows-loading">Loading past shows...</div>';
          fetch(API + '&date=past')
            .then(function (r) { return r.json(); })
            .then(function (events) {
              if (!events.length) {
                pastEl.innerHTML = '<div class="shows-empty"><p>No past shows found.</p></div>';
                return;
              }
              events.reverse();
              pastEl.innerHTML = events.map(function (e) { return renderShow(e, false); }).join('');
            })
            .catch(function () {
              pastEl.innerHTML = '<div class="shows-loading">Could not load past shows.</div>';
            });
        }
      });
    });

    function renderShow(e, showTicket) {
      var d = new Date(e.datetime);
      var month = MONTHS[d.getMonth()];
      var day = d.getDate();
      var venue = e.venue.name || '';
      var city = [e.venue.city, e.venue.region, e.venue.country].filter(Boolean).join(', ');
      var lineup = (e.lineup || []).filter(function (a) {
        return a.toLowerCase() !== 'the royal me';
      });
      var ticketUrl = (e.offers && e.offers.length) ? e.offers[0].url : e.url;

      var html = '<div class="show-item">' +
        '<div class="show-date">' +
          '<div class="show-date-month">' + month + '</div>' +
          '<div class="show-date-day">' + day + '</div>' +
        '</div>' +
        '<div class="show-info">' +
          '<div class="show-venue">' + venue + '</div>' +
          '<div class="show-location">' + city + '</div>' +
          (lineup.length ? '<div class="show-lineup">w/ ' + lineup.join(', ') + '</div>' : '') +
        '</div>';
      if (showTicket && ticketUrl) {
        html += '<div class="show-ticket"><a href="' + ticketUrl + '" target="_blank" rel="noopener">Tickets</a></div>';
      }
      html += '</div>';
      return html;
    }
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    createStars();
    initNav();
    initMobileNav();
    initSmoothScroll();
    initScrollAnimations();
    initVideoCarousel();
    initPhotoCarousel();
    initLightbox();
    initShows();
  });
})();
