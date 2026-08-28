// Highlights the current page in both nav lists.

document.addEventListener('DOMContentLoaded', function () {
  var currentPage = location.pathname.split('/').pop() || 'index.html';

  document
    .querySelectorAll('.site-nav a, .footer-nav a')
    .forEach(function (link) {
      var linkPage = link.getAttribute('href');
      if (linkPage === currentPage) {
        link.setAttribute('aria-current', 'page');
      }
    });
});

// Home page photo showcase: the three slots (one large, two small — see
// .photo-showcase in the CSS for the asymmetrical layout) cycle through
// further groups of three photos from the pool below, five seconds per
// group, cross-fading each slot's <img> independently (fade out, swap
// src once the next photo has actually loaded, fade back in — avoids a
// pop to a half-loaded image on a slow connection). The pool starts with
// a hand-picked sequence, then continues through the rest of the home
// gallery's photos in their original order, looping once it runs out.
// The initial HTML already shows group 0, so cycling starts from group 1.
// Skipped entirely under prefers-reduced-motion.

document.addEventListener('DOMContentLoaded', function () {
  var slots = document.querySelectorAll('.photo-showcase-slot img');
  if (!slots.length) return;

  var pool = [
    {
      src: 'assets/images/home/gallery/chris-and-christen.jpg',
      alt: 'Chris and Christen Colquitt',
      pos: 'center 27%',
    },
    {
      src: 'assets/images/home/gallery/gallery-07.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/gallery-13.jpg',
      alt: 'Trinity Presbyterian Church congregation',
      pos: 'center 80%',
    },
    {
      src: 'assets/images/home/gallery/gallery-01.jpg',
      alt: 'Trinity Presbyterian Church congregation',
      pos: '75% center',
    },
    {
      src: 'assets/images/home/gallery/gallery-05.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/gallery-08.jpg',
      alt: 'Trinity Presbyterian Church congregation',
      pos: 'center 25%',
    },
    {
      src: 'assets/images/home/gallery/gallery-04.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/walter-kim.jpg',
      alt: 'Walter Kim',
      pos: 'center 60%',
    },
    {
      src: 'assets/images/home/gallery/gallery-09.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/archive-scan-09.jpg',
      alt: 'An archival photo from Trinity’s history',
    },
    {
      src: 'assets/images/home/gallery/tpc-homecoming-05.jpg',
      alt: 'TPC Homecoming',
      pos: 'center 30%',
    },
    {
      src: 'assets/images/home/gallery/tpc-homecoming-01.jpg',
      alt: 'TPC Homecoming',
    },
    {
      src: 'assets/images/home/gallery/gallery-02.jpg',
      alt: 'Trinity Presbyterian Church congregation',
      pos: 'center 10%',
    },
    {
      src: 'assets/images/home/gallery/gallery-03.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/john-and-kathy-hall.jpg',
      alt: 'John and Kathy Hall',
    },
    {
      src: 'assets/images/home/gallery/john-hall.jpg',
      alt: 'John Hall',
      pos: 'center 10%',
    },
    {
      src: 'assets/images/home/gallery/gallery-06.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/easter-sunday-2014.jpg',
      alt: 'Easter Sunday, 2014',
    },
    {
      src: 'assets/images/home/gallery/gallery-10.jpg',
      alt: 'Trinity Presbyterian Church congregation',
      pos: 'center 15%',
    },
    {
      src: 'assets/images/home/gallery/gallery-11.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/gallery-14.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/evening-worship-2024.jpg',
      alt: 'Evening worship, January 2024',
      pos: 'center 36%',
    },
    {
      src: 'assets/images/home/gallery/gallery-15.jpg',
      alt: 'Trinity Presbyterian Church congregation',
      pos: 'center 14%',
    },
    {
      src: 'assets/images/home/gallery/gallery-16.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/gallery-17.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/gallery-18.jpg',
      alt: 'Trinity Presbyterian Church congregation',
      pos: 'center 28%',
    },
    {
      src: 'assets/images/home/gallery/gallery-19.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
    {
      src: 'assets/images/home/gallery/tpc-homecoming-06.jpg',
      alt: 'TPC Homecoming',
      pos: 'center 16%',
    },
    {
      src: 'assets/images/home/gallery/tpc-homecoming-02.jpg',
      alt: 'TPC Homecoming',
    },
    // Moved out of its original group (was alongside gallery-10/gallery-11,
    // too similar to them) — into the last group instead.
    {
      src: 'assets/images/home/gallery/gallery-12.jpg',
      alt: 'Trinity Presbyterian Church congregation',
    },
  ];

  // The initial markup shows group 0 (pool[0..slots.length - 1]) directly
  // in the HTML — apply those photos' focal points here too, so pos only
  // ever has to be edited in one place instead of also being hardcoded
  // (and liable to drift out of sync) as an inline style in index.html.
  slots.forEach(function (img, slotIndex) {
    img.style.objectPosition = pool[slotIndex].pos || '';
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var groupCount = Math.floor(pool.length / slots.length);
  if (groupCount <= 1) return;

  var FADE_MS = 600;
  var INTERVAL_MS = 12000;
  var STAGGER_MS = INTERVAL_MS / slots.length;
  var INITIAL_DELAY_MS = 4000;

  // Each slot runs its own independent timer, offset from the others by
  // STAGGER_MS, rather than one shared interval advancing all three at
  // once — reads as three photos each drifting at their own pace instead
  // of the whole showcase visibly "changing" in unison every 5 seconds.
  // A slot still only ever shows the photo assigned to its position
  // within a group (pool[groupIndex * slots.length + slotIndex]); only
  // the timing is staggered, not which photos pair up. INITIAL_DELAY_MS
  // gives the page a settled moment before anything moves, and START_ORDER
  // has one of the small photos change first rather than the large one —
  // a change in a small corner reads as a quieter opening move than the
  // big photo suddenly swapping.
  var START_ORDER = [1, 2, 0];

  slots.forEach(function (img, slotIndex) {
    var slotGroupIndex = 0;
    var startPosition = START_ORDER.indexOf(slotIndex);
    var timeoutId;

    function advance() {
      slotGroupIndex = (slotGroupIndex + 1) % groupCount;
      var photo = pool[slotGroupIndex * slots.length + slotIndex];
      var preload = new Image();
      preload.onload = function () {
        img.classList.add('is-fading');
        setTimeout(function () {
          img.src = photo.src;
          img.alt = photo.alt;
          // Not every photo needs a focal-point override — the ones that
          // don't just fall back to object-fit: cover's default centering.
          img.style.objectPosition = photo.pos || '';
          img.classList.remove('is-fading');
        }, FADE_MS);
      };
      preload.src = photo.src;
      timeoutId = setTimeout(advance, INTERVAL_MS);
    }

    // Clicking a photo jumps that slot to the next one right away,
    // cancelling its pending automatic advance so it doesn't also fire a
    // moment later — the slot's timer effectively just restarts from here.
    img.style.cursor = 'pointer';
    img.addEventListener('click', function () {
      clearTimeout(timeoutId);
      advance();
    });

    timeoutId = setTimeout(advance, INITIAL_DELAY_MS + startPosition * STAGGER_MS);
  });
});

// Tags portrait (narrower-than-tall) photos in the Memory Wall popover
// with .photo-portrait so CSS can cap their width — a full-width portrait
// photo in that list reads as oversized next to the landscape ones.
// naturalWidth/naturalHeight aren't available until the image has
// actually loaded, so cards whose photos aren't already cached (e.g. the
// first time a particular card is opened) get checked on load instead.
function markPortraitPhotos(container) {
  container.querySelectorAll('img').forEach(function (img) {
    function check() {
      if (
        img.naturalWidth &&
        img.naturalHeight &&
        img.naturalWidth / img.naturalHeight < 1
      ) {
        img.classList.add('photo-portrait');
      }
    }
    if (img.complete) {
      check();
    } else {
      img.addEventListener('load', check);
    }
  });
}

// Memory Wall: each .memory-card's blockquote is visually clipped (see
// the CSS line-clamp on .memory-card blockquote). Clicking a card that has
// a blockquote and/or photo(s) opens its full, unclipped text plus any
// photos in a <dialog> popover. Multiple photos get the same
// fixed-footprint fanned-stack look as the Timeline (.timeline-photos,
// reused as-is; it's non-interactive here since the dialog is already the
// "expanded" view). Photo-only cards (no blockquote) still open, showing
// just the photos — and get a bigger, wider teaser stack (.memory-photos
// -wide) instead of the small square one, since there's no text to make
// room for. Left/right arrow keys, while the dialog is open, step through
// every clickable card in page order, same pattern as the gallery
// lightbox. The dialog itself is built once, lazily, on first use.

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

  dialog
    .querySelector('.memory-dialog-close')
    .addEventListener('click', function () {
      dialog.close();
    });

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });

  var openers = [];
  var currentIndex = -1;

  cards.forEach(function (card) {
    var blockquote = card.querySelector('blockquote');
    var images = Array.prototype.slice.call(
      card.querySelectorAll('.memory-photos img'),
    );
    if (!blockquote && !images.length) return;

    var nameEl = card.querySelector('.memory-name');

    if (!blockquote) {
      var photosEl = card.querySelector('.memory-photos');
      if (photosEl) photosEl.classList.add('memory-photos-wide');
    }

    card.classList.add('memory-card-clickable');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute(
      'aria-label',
      'Read full memory' +
        (nameEl ? ' from ' + nameEl.textContent.replace(/^—\s*/, '') : ''),
    );

    var index = openers.length;

    function open() {
      currentIndex = index;
      var photosHtml = '';
      if (images.length) {
        // Full-width list (same class the Timeline's own dialog uses) —
        // a higher-resolution look than the small fanned .memory-photos
        // stack the card teaser shows.
        photosHtml =
          '<div class="timeline-dialog-images">' +
          images
            .map(function (img) {
              return (
                '<img src="' +
                img.src +
                '" alt="' +
                img.alt.replace(/"/g, '&quot;') +
                '">'
              );
            })
            .join('') +
          '</div>';
      }
      var textHtml = blockquote ? blockquote.innerHTML : '';
      body.innerHTML = photosHtml + textHtml + (nameEl ? nameEl.outerHTML : '');
      markPortraitPhotos(body);
      // showModal() throws if the dialog is already open (arrow-key
      // navigation reuses the same open dialog instead of closing and
      // reopening it) — only call it the first time. Either way, reset
      // scroll after the dialog has actually finished opening: setting
      // scrollTop synchronously, before/alongside showModal(), doesn't
      // reliably stick once the dialog moves into the top layer.
      if (!dialog.open) dialog.showModal();
      requestAnimationFrame(function () {
        body.scrollTop = 0;
      });
    }

    openers.push(open);

    card.addEventListener('click', open);
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });

  document.addEventListener('keydown', function (event) {
    if (!dialog.open) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    var delta = event.key === 'ArrowLeft' ? -1 : 1;
    currentIndex = (currentIndex + delta + openers.length) % openers.length;
    openers[currentIndex]();
  });
});

// Randomizes the fan rotation on Timeline/Memory Wall photo stacks so
// every stack — even a single-photo one — gets its own slight, varied
// tilt instead of the same fixed angles (and a forced-flat front photo)
// for everyone. Front-to-back stacking order still comes from CSS
// nth-child z-index; this only touches transform. The same degree range
// reads as a much bigger tilt on the wide photo-only stacks
// (.memory-photos-wide) than on the small square ones, and on a lone
// photo (nothing else in the pile to visually balance it against) than
// on a multi-photo fan, so both get a narrower range.
document.addEventListener('DOMContentLoaded', function () {
  var stacks = document.querySelectorAll('.timeline-photos, .memory-photos');
  stacks.forEach(function (stack) {
    var items = stack.querySelectorAll(':scope > img, :scope > .photo-frame');
    var range =
      stack.classList.contains('memory-photos-wide') || items.length === 1
        ? 8
        : 24;
    items.forEach(function (item) {
      var angle = (Math.random() * range - range / 2).toFixed(1);
      item.style.transform = 'rotate(' + angle + 'deg)';
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
    document.documentElement.style.setProperty(
      '--nav-height',
      nav.offsetHeight + 'px',
    );
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
// popover, same click-to-popover pattern as the Memory Wall. Left/right
// arrow keys, while the dialog is open, step through every entry's stack
// in page order, same pattern as the gallery lightbox.

document.addEventListener('DOMContentLoaded', function () {
  var stacks = document.querySelectorAll('.timeline-photos');
  if (!stacks.length) return;

  var dialog = null;
  var imagesEl = null;
  var openers = [];
  var currentIndex = -1;

  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'timeline-dialog';
    dialog.setAttribute('aria-label', 'Photos');
    dialog.innerHTML =
      '<button type="button" class="timeline-dialog-close" aria-label="Close">&times;</button>' +
      '<div class="timeline-dialog-body"><div class="timeline-dialog-images"></div></div>';
    document.body.appendChild(dialog);
    imagesEl = dialog.querySelector('.timeline-dialog-images');

    dialog
      .querySelector('.timeline-dialog-close')
      .addEventListener('click', function () {
        dialog.close();
      });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    document.addEventListener('keydown', function (event) {
      if (!dialog.open) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var delta = event.key === 'ArrowLeft' ? -1 : 1;
      currentIndex = (currentIndex + delta + openers.length) % openers.length;
      openers[currentIndex]();
    });
  }

  stacks.forEach(function (stack) {
    var images = Array.prototype.slice.call(stack.querySelectorAll('img'));
    if (!images.length) return;

    stack.tabIndex = 0;
    stack.setAttribute('role', 'button');
    stack.setAttribute(
      'aria-label',
      images.length > 1
        ? 'View all ' + images.length + ' photos'
        : 'View photo',
    );

    var index = openers.length;

    function open() {
      ensureDialog();
      currentIndex = index;
      imagesEl.innerHTML = images
        .map(function (img) {
          return (
            '<img src="' +
            img.src +
            '" alt="' +
            img.alt.replace(/"/g, '&quot;') +
            '">'
          );
        })
        .join('');
      dialog.showModal();
    }

    openers.push(open);

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

    lightbox
      .querySelector('.gallery-lightbox-close')
      .addEventListener('click', function () {
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
    var isEditable =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);
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
      .map(function (item) {
        return item.querySelector('img');
      })
      .filter(Boolean);

    images.forEach(function (img, i) {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute(
        'aria-label',
        'View larger photo: ' + (img.alt || 'photo'),
      );
      img.addEventListener('click', function () {
        openLightbox(images, i);
      });
      img.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(images, i);
        }
      });
    });

    // .photo-gallery--flat opts a gallery out of pagination entirely (every
    // photo just shows at once in the grid) — for the inline galleries
    // dropped into prose, where paginating away one extra photo reads as
    // more machinery than the content warrants.
    if (gallery.classList.contains('photo-gallery--flat')) return;

    var pageCount = Math.ceil(items.length / PAGE_SIZE);
    if (pageCount <= 1) return;

    var controls = document.createElement('div');
    controls.className = 'gallery-pagination';
    controls.innerHTML =
      '<button type="button" class="gallery-prev" aria-label="Previous photos">&larr;</button>' +
      '<p class="gallery-count" aria-live="polite"></p>' +
      '<button type="button" class="gallery-next" aria-label="Next photos">&rarr;</button>';
    list.insertAdjacentElement('afterend', controls);

    var countEl = controls.querySelector('.gallery-count');
    var page = 0;

    function showPage(delta) {
      page = (page + delta + pageCount) % pageCount;
      items.forEach(function (item, idx) {
        item.hidden = idx < page * PAGE_SIZE || idx >= (page + 1) * PAGE_SIZE;
      });
      countEl.textContent = page + 1 + ' of ' + pageCount;
    }

    controls
      .querySelector('.gallery-prev')
      .addEventListener('click', function () {
        showPage(-1);
      });
    controls
      .querySelector('.gallery-next')
      .addEventListener('click', function () {
        showPage(1);
      });

    currentShowPage = showPage;
    showPage(0);
  });
});
