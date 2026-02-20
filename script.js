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

  // --- Shows: set 6-month past date window + no-shows CTA ---
  function initShows() {
    var widget = document.getElementById('bit-widget');
    if (widget) {
      var sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      var dateStr = sixMonthsAgo.toISOString().split('T')[0];
      widget.setAttribute('data-display-start-date', dateStr);
    }

    var cta = document.getElementById('no-shows-cta');
    if (!cta) return;

    var checks = 0;
    var interval = setInterval(function () {
      checks++;
      var noEvents = document.querySelector('.bit-no-dates-container');
      if (noEvents) {
        clearInterval(interval);
        cta.style.display = 'block';
      } else if (checks > 20) {
        clearInterval(interval);
      }
    }, 500);
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
