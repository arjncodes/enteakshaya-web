
document.addEventListener('DOMContentLoaded', () => {
    const whatsappIntroSection = document.querySelector('.whatsapp-intro-section');
    const newTransitionOverlay = document.querySelector('.new-transition-overlay');
    const mainContent = document.querySelector('.main-content');
    const introChatBubbles = document.querySelectorAll('.intro-showcase-bubble');

    // Enhanced viewport handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const introSection = document.querySelector('.whatsapp-intro-section');
            if (introSection && !introSection.classList.contains('fade-out')) {
                introSection.style.height = '100vh';
            }
        }, 100);
    });

    // Handle iOS Safari viewport issues
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 500);
        });
    }

    // Initially hide main content and ensure intro section is visible
    if (mainContent) {
        mainContent.classList.remove('visible');
    }
    if (whatsappIntroSection) {
        whatsappIntroSection.classList.remove('fade-out');
    }
    if (newTransitionOverlay) {
        newTransitionOverlay.classList.remove('active');
    }
    document.body.style.overflowY = 'hidden';

    // Function to trigger the transition from intro to main content
    const triggerMainContentTransition = () => {
        if (whatsappIntroSection && !whatsappIntroSection.classList.contains('fade-out')) {
            if (newTransitionOverlay) {
                newTransitionOverlay.classList.add('active');
            }

            setTimeout(() => {
                if (whatsappIntroSection) {
                    whatsappIntroSection.classList.add('fade-out');
                }
                if (mainContent) {
                    mainContent.classList.add('visible');
                }
                document.body.style.overflowY = 'auto';
            }, 800);

            setTimeout(() => {
                if (whatsappIntroSection) {
                    whatsappIntroSection.style.display = 'none';
                }
                if (newTransitionOverlay) {
                    newTransitionOverlay.style.display = 'none';
                }
            }, 2300);
        }
    };

    setTimeout(() => {
        triggerMainContentTransition();
    }, 4000);

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector(".nav-menu");
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", function () {
            navMenu.classList.toggle("active");
        });
    }

    // Service Modal (Keep this for compatibility)
    const serviceModal = document.getElementById("service-modal");
    const modalClose = document.getElementById("modal-close-btn");

    if (modalClose) {
        modalClose.addEventListener("click", () => {
            if (serviceModal) {
                serviceModal.style.display = "none";
                serviceModal.classList.remove('active');
            }
            document.body.classList.remove('modal-open');
        });
    }

    if (serviceModal) {
        window.addEventListener("click", (e) => {
            if (e.target === serviceModal) {
                serviceModal.style.display = "none";
                serviceModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Testimonial Slider
    const testimonialSlide = document.querySelector(".testimonial-slide");
    const testimonials = document.querySelectorAll(".testimonial");
    const prevBtn = document.getElementById("testimonial-prev");
    const nextBtn = document.getElementById("testimonial-next");
    let currentIndex = 0;

    function updateSlider() {
        if (testimonialSlide) {
            testimonialSlide.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1;
            updateSlider();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentIndex = currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0;
            updateSlider();
        });
    }

    // Auto slide testimonials
    if (testimonials.length > 1) {
        setInterval(() => {
            currentIndex = currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0;
            updateSlider();
        }, 5000);
    }

    // Timeline animation on scroll
    const timelineItems = document.querySelectorAll(".timeline-item");

    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function handleScrollForTimeline() {
        timelineItems.forEach((item) => {
            if (isInViewport(item)) {
                item.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", handleScrollForTimeline);
    handleScrollForTimeline();

    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            const introSection = document.querySelector('.whatsapp-intro-section');
            if (introSection && !introSection.classList.contains('fade-out')) {
                introSection.style.display = 'none';
                introSection.offsetHeight;
                introSection.style.display = 'flex';
            }
        }, 100);
    });
});



// Contact form -> POST to GAS
(function wireContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Your GAS web app URL (no query string needed for POST)
  const API = 'https://script.google.com/macros/s/AKfycbx3BRtrM6u6YbHVkl-MxnDLWrMvcteAX3U2pgRmj12cHRkCblzCpEM0h0h2Dg2XuNmrQA/exec';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('name')?.value?.trim() || '',
      email: document.getElementById('email')?.value?.trim() || '',
      phone: document.getElementById('phone')?.value?.trim() || '',
      message: document.getElementById('message')?.value?.trim() || ''
    };

    // Simple client-side guard
    if (!payload.name || !payload.phone) {
      alert('Please enter your name and phone.');
      return;
    }

    try {
      const res = await fetch(API, {
    method: 'POST',
    // IMPORTANT: use a "simple" content type so the browser skips preflight
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    // Do NOT add any other custom headers (e.g., no "Accept", no auth headers)
    body: JSON.stringify(payload)
    });

    const json = await res.json(); // this will now work
      if (json.ok) {
        alert('Thanks! We have received your message.');
        form.reset();
      } else {
        console.error(json);
        alert('Sorry, something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  });
})();


// ===== Enhancer: non-invasive UI for status + button disable =====
(function enhanceContactFormUI() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn = form.querySelector('button[type="submit"]');
  const statusDiv = document.getElementById('formStatus');
  if (!statusDiv) return;

  const nativeAlert = window.alert;

  function paint(message, type) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    statusDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    statusDiv.style.color = type === 'success' ? '#155724' : '#721c24';
    statusDiv.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`;
    clearTimeout(paint._t);
    paint._t = setTimeout(() => { statusDiv.style.display = 'none'; }, 4000);
  }

  // Show "Sending..." immediately when submit starts (capture runs before your handler)
  form.addEventListener('submit', () => {
    if (btn) btn.disabled = true;
    paint('Sending your message...', 'success');
  }, true); // capture = true (no change to your handler)

  // Mirror all alerts into the status box and re-enable button
  window.alert = (msg) => {
    const m = String(msg || '');
    const type = /Thanks|success|received/i.test(m) ? 'success' : 'error';
    paint(m, type);
    if (btn) btn.disabled = false;
    return nativeAlert.apply(window, [msg]); // keep original alert behavior
  };

  // Safety: re-enable on unhandled promise rejections
  window.addEventListener('unhandledrejection', () => { if (btn) btn.disabled = false; });
})();

document.querySelector('.get-in-touch').addEventListener('click', () => {
  window.open('https://wa.me/919946280727?text=Hello%20Enteakshaya', '_blank');});


  // Mobile drawer lock helper
(function () {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const menu    = document.querySelector('.nav-menu');
  let overlay   = document.querySelector('.nav-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  const openMenu = () => {
    menu?.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.classList.add('menu-lock');
  };

  const closeMenu = () => {
    menu?.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.classList.remove('menu-lock');
  };

  menuBtn?.addEventListener('click', () => {
    if (menu?.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // Safety: always unlock on navigation/resizes
  window.addEventListener('resize', closeMenu);
  window.addEventListener('pageshow', closeMenu);
})();
