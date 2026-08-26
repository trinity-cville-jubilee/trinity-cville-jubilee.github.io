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

// Turns every .photo-gallery's <ul> into an inline carousel: slides sit in
// a horizontal flex row inside a clipping viewport (both injected here, no
// HTML changes needed) and are positioned with a single translateX on the
// track. Prev/next controls and an "X of N" count are injected below it.
// Captions are the <figcaption> already in each slide's markup. Dragging
// (mouse or touch, via Pointer Events) moves the track live with the
// pointer; releasing past the threshold advances/reverses a slide with an
// animated snap. A plain click/tap (no real drag) instead goes by which
// half of the photo was pressed: left half back, right half forward. Left/
// right arrow keys also drive it, page-wide (safe since each page has only
// one gallery).

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.photo-gallery').forEach(function (gallery) {
    var list = gallery.querySelector('ul');
    if (!list) return;

    var slides = Array.prototype.slice.call(list.children);
    if (slides.length < 2) return;

    var viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';
    list.parentNode.insertBefore(viewport, list);
    viewport.appendChild(list);
    list.classList.add('carousel-track');

    var controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.innerHTML =
      '<button type="button" class="carousel-prev" aria-label="Previous photo">&lsaquo;</button>' +
      '<p class="carousel-count" aria-live="polite"></p>' +
      '<button type="button" class="carousel-next" aria-label="Next photo">&rsaquo;</button>';
    viewport.insertAdjacentElement('afterend', controls);

    var countEl = controls.querySelector('.carousel-count');
    var index = 0;
    var dragOffsetPx = 0;

    function setTransform(offsetPx) {
      list.style.transform = 'translateX(calc(' + (-index * 100) + '% + ' + offsetPx + 'px))';
    }

    function show(i) {
      index = (i + slides.length) % slides.length;
      list.classList.remove('is-dragging');
      setTransform(0);
      countEl.textContent = (index + 1) + ' of ' + slides.length;
    }

    controls.querySelector('.carousel-prev').addEventListener('click', function () { show(index - 1); });
    controls.querySelector('.carousel-next').addEventListener('click', function () { show(index + 1); });

    // Each page has only one .photo-gallery, so a page-wide arrow-key
    // listener is unambiguous — no need to scope it to a focused element.
    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isEditable) return;
      if (event.key === 'ArrowLeft') show(index - 1);
      else if (event.key === 'ArrowRight') show(index + 1);
    });

    var dragStartX = null;

    list.addEventListener('pointerdown', function (event) {
      // Without this, the browser starts its own native image-drag on
      // mousedown, which immediately fires pointercancel and cuts our drag
      // short before any movement registers — reading as a plain click.
      event.preventDefault();
      dragStartX = event.clientX;
      list.classList.add('is-dragging');
      list.setPointerCapture(event.pointerId);
    });

    list.addEventListener('pointermove', function (event) {
      if (dragStartX === null) return;
      dragOffsetPx = event.clientX - dragStartX;
      setTransform(dragOffsetPx);
    });

    function endDrag(event) {
      if (dragStartX === null) return;
      var SWIPE_THRESHOLD = 40;
      var delta = dragOffsetPx;
      dragStartX = null;
      dragOffsetPx = 0;

      if (delta > SWIPE_THRESHOLD) { show(index - 1); return; }
      if (delta < -SWIPE_THRESHOLD) { show(index + 1); return; }

      // A plain click/tap is a drag with ~no movement — which half of the
      // visible slide it landed on decides direction: left half back,
      // right half forward. Measured against the viewport, not the track —
      // the track's own box spans every slide side by side (only clipped
      // visually by the viewport), so its rect is nowhere near what's
      // actually on screen.
      var rect = viewport.getBoundingClientRect();
      var clickX = event.clientX - rect.left;
      if (clickX < rect.width / 2) show(index - 1);
      else show(index + 1);
    }

    list.addEventListener('pointerup', endDrag);
    list.addEventListener('pointercancel', endDrag);

    show(0);
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
