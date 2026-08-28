// Highlights the current page in both nav lists.

document.addEventListener('DOMContentLoaded', function () {
  var currentPage = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.site-nav a, .footer-nav a').forEach(function (link) {
    var linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });
});

// Memory Wall: each .memory-card's blockquote is visually clipped (see
// the CSS line-clamp on .memory-card blockquote). Clicking a card that has
// one opens its full, unclipped text in a <dialog> popover. Cards with no
// blockquote (photo-only submissions) have nothing to expand and are left
// alone — the dialog itself is built once, lazily, on first use.

document.addEventListener('DOMContentLoaded', function () {
  var cards = document.querySelectorAll('.memory-card');
  if (!cards.length) return;

  var dialog = document.createElement('dialog');
  dialog.className = 'memory-dialog';
  dialog.setAttribute('aria-label', 'Full memory');
  dialog.innerHTML =
    '<button type="button" class="memory-dialog-close" aria-label="Close">&times;</button>' +
    '<div class="memory-dialog-body"></div>';
  document.body.appendChild(dialog);

  var body = dialog.querySelector('.memory-dialog-body');

  dialog.querySelector('.memory-dialog-close').addEventListener('click', function () {
    dialog.close();
  });

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });

  cards.forEach(function (card) {
    var blockquote = card.querySelector('blockquote');
    if (!blockquote) return;

    var nameEl = card.querySelector('.memory-name');

    card.classList.add('memory-card-clickable');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Read full memory' + (nameEl ? ' from ' + nameEl.textContent.replace(/^—\s*/, '') : ''));

    function open() {
      body.innerHTML = blockquote.innerHTML + (nameEl ? nameEl.outerHTML : '');
      dialog.showModal();
    }

    card.addEventListener('click', open);
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
});

// Measures the sticky site-nav's real height into --nav-height so other
// sticky elements (the timeline below) can clear it instead of guessing a
// fixed offset. Kept generic/global since more than one thing may want it.

document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  function setNavHeight() {
    document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');
  }

  setNavHeight();
  window.addEventListener('resize', setNavHeight);
  window.addEventListener('load', setNavHeight);
});

// Timeline: normal vertical page scroll drives the horizontal scroll of
// .timeline-list. .timeline-scroller is given extra height (viewport
// height + however far the strip needs to travel horizontally), and
// .timeline-sticky (position: sticky, see CSS) stays pinned for exactly
// that scroll distance. Scroll progress through that distance maps
// directly onto .timeline-list's scrollLeft. Skipped entirely under
// prefers-reduced-motion — the timeline is still fully usable there, just
// as a normal (manually, by drag/trackpad) horizontally-scrollable strip.

document.addEventListener('DOMContentLoaded', function () {
  var scroller = document.querySelector('.timeline-scroller');
  var sticky = scroller && scroller.querySelector('.timeline-sticky');
  var list = document.querySelector('.timeline-list');
  if (!scroller || !sticky || !list) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var lastWrapperHeight = null;
  var ticking = false;

  function update() {
    ticking = false;

    var horizontalDistance = list.scrollWidth - list.clientWidth;
    if (horizontalDistance <= 0) {
      if (lastWrapperHeight !== '') {
        scroller.style.height = '';
        lastWrapperHeight = '';
      }
      return;
    }

    var neededHeight = window.innerHeight + horizontalDistance;
    if (neededHeight !== lastWrapperHeight) {
      scroller.style.height = neededHeight + 'px';
      lastWrapperHeight = neededHeight;
    }

    var stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    var scrolled = stickyTop - scroller.getBoundingClientRect().top;
    var progress = Math.min(Math.max(scrolled / horizontalDistance, 0), 1);
    list.scrollLeft = progress * horizontalDistance;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);

  update();
});

// Timeline photo stacks: every .timeline-photos (one photo or several —
// see CSS for the fixed-footprint fanned-rotation look, same either way)
// is a clickable pile. Clicking/tapping it opens the full set in a dialog
// popover, same click-to-popover pattern as the Memory Wall.

document.addEventListener('DOMContentLoaded', function () {
  var stacks = document.querySelectorAll('.timeline-photos');
  if (!stacks.length) return;

  var dialog = null;
  var imagesEl = null;

  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'timeline-dialog';
    dialog.setAttribute('aria-label', 'Photos');
    dialog.innerHTML =
      '<button type="button" class="timeline-dialog-close" aria-label="Close">&times;</button>' +
      '<div class="timeline-dialog-images"></div>';
    document.body.appendChild(dialog);
    imagesEl = dialog.querySelector('.timeline-dialog-images');

    dialog.querySelector('.timeline-dialog-close').addEventListener('click', function () {
      dialog.close();
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  stacks.forEach(function (stack) {
    var images = Array.prototype.slice.call(stack.querySelectorAll('img'));
    if (!images.length) return;

    stack.tabIndex = 0;
    stack.setAttribute('role', 'button');
    stack.setAttribute('aria-label', images.length > 1 ? 'View all ' + images.length + ' photos' : 'View photo');

    function open() {
      ensureDialog();
      imagesEl.innerHTML = images
        .map(function (img) {
          return '<img src="' + img.src + '" alt="' + img.alt.replace(/"/g, '&quot;') + '">';
        })
        .join('');
      dialog.showModal();
    }

    stack.addEventListener('click', open);
    stack.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
});

// Photo galleries (Home/Gather/Grow/Go/Glorify): the grid shows at most
// PAGE_SIZE photos at a time — prev/next controls swap which page of the
// grid is visible, with an "X of N" page count, using the native hidden
// attribute so no extra layout CSS is needed for it. Independently,
// clicking/tapping any visible photo opens it in a dialog lightbox sized
// to fill as much of the viewport as it can while showing the whole image
// (object-fit: contain there, unlike the cover-cropped grid thumbnails —
// see CSS). Left/right arrow keys are shared between the two, page-wide
// (there's only one gallery per page, so no ambiguity): when the lightbox
// is open they step through every photo in the gallery, regardless of
// which grid page it's on; when it's closed they turn the grid page
// instead. A single keydown listener decides between the two rather than
// each registering its own, so they can never both react to the same
// keypress.

document.addEventListener('DOMContentLoaded', function () {
  var PAGE_SIZE = 6;

  var lightbox = null;
  var lightboxImg = null;
  var lightboxCaption = null;
  var lightboxImages = [];
  var lightboxIndex = 0;

  function ensureLightbox() {
    if (lightbox) return;
    lightbox = document.createElement('dialog');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('aria-label', 'Photo');
    lightbox.innerHTML =
      '<button type="button" class="gallery-lightbox-close" aria-label="Close">&times;</button>' +
      '<img class="gallery-lightbox-image" src="" alt="">' +
      '<p class="gallery-lightbox-caption"></p>';
    document.body.appendChild(lightbox);
    lightboxImg = lightbox.querySelector('.gallery-lightbox-image');
    lightboxCaption = lightbox.querySelector('.gallery-lightbox-caption');

    lightbox.querySelector('.gallery-lightbox-close').addEventListener('click', function () {
      lightbox.close();
    });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) lightbox.close();
    });
  }

  function showLightbox(i) {
    lightboxIndex = (i + lightboxImages.length) % lightboxImages.length;
    var img = lightboxImages[lightboxIndex];
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
  }

  function openLightbox(images, index) {
    ensureLightbox();
    lightboxImages = images;
    showLightbox(index);
    lightbox.showModal();
  }

  var currentShowPage = null;

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    var target = event.target;
    var isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (isEditable) return;

    var delta = event.key === 'ArrowLeft' ? -1 : 1;

    if (lightbox && lightbox.open) {
      event.preventDefault();
      showLightbox(lightboxIndex + delta);
    } else if (currentShowPage) {
      currentShowPage(delta);
    }
  });

  document.querySelectorAll('.photo-gallery').forEach(function (gallery) {
    var list = gallery.querySelector('ul');
    if (!list) return;

    var items = Array.prototype.slice.call(list.children);
    if (!items.length) return;

    var images = items
      .map(function (item) { return item.querySelector('img'); })
      .filter(Boolean);

    images.forEach(function (img, i) {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'View larger photo: ' + (img.alt || 'photo'));
      img.addEventListener('click', function () { openLightbox(images, i); });
      img.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(images, i);
        }
      });
    });

    var pageCount = Math.ceil(items.length / PAGE_SIZE);
    if (pageCount <= 1) return;

    var controls = document.createElement('div');
    controls.className = 'gallery-pagination';
    controls.innerHTML =
      '<button type="button" class="gallery-prev" aria-label="Previous photos">&lsaquo;</button>' +
      '<p class="gallery-count" aria-live="polite"></p>' +
      '<button type="button" class="gallery-next" aria-label="Next photos">&rsaquo;</button>';
    list.insertAdjacentElement('afterend', controls);

    var countEl = controls.querySelector('.gallery-count');
    var page = 0;

    function showPage(delta) {
      page = (page + delta + pageCount) % pageCount;
      items.forEach(function (item, idx) {
        item.hidden = idx < page * PAGE_SIZE || idx >= (page + 1) * PAGE_SIZE;
      });
      countEl.textContent = (page + 1) + ' of ' + pageCount;
    }

    controls.querySelector('.gallery-prev').addEventListener('click', function () { showPage(-1); });
    controls.querySelector('.gallery-next').addEventListener('click', function () { showPage(1); });

    currentShowPage = showPage;
    showPage(0);
  });
});
