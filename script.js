// Chara's Hair - Main Script
document.addEventListener('DOMContentLoaded', () => {
  console.log("Chara's Hair website successfully loaded.");

  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    const links = navLinks.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Add class for scroll-driven animations indicating JavaScript is enabled
  const servicesSection = document.getElementById('services');
  if (servicesSection) {
    servicesSection.classList.add('js-enabled');
  }

  // Scroll active state & timeline progress line logic
  const timelineProgress = document.querySelector('.timeline-line-progress');
  const serviceItems = document.querySelectorAll('.service-item');
  const timelineContainer = document.querySelector('.services-timeline-container');

  function updateTimeline() {
    if (!timelineContainer || serviceItems.length === 0) return;

    // 1. Calculate and update timeline line progress
    const firstDot = serviceItems[0].querySelector('.service-dot');
    const lastDot = serviceItems[serviceItems.length - 1].querySelector('.service-dot');
    
    if (firstDot && lastDot) {
      const firstDotRect = firstDot.getBoundingClientRect();
      const lastDotRect = lastDot.getBoundingClientRect();
      
      const totalDist = lastDotRect.top - firstDotRect.top;
      // Center of screen relative to first dot
      const centerLine = window.innerHeight / 2;
      const currentDist = centerLine - firstDotRect.top;
      
      let progressPercent = (currentDist / totalDist) * 100;
      progressPercent = Math.max(0, Math.min(100, progressPercent));
      
      if (timelineProgress) {
        timelineProgress.style.height = `${progressPercent}%`;
      }
    }

    // 2. Determine which item is active (closest to the viewport center line)
    const centerLine = window.innerHeight / 2;
    let closestItem = null;
    let minDistance = Infinity;

    serviceItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemMiddle = rect.top + rect.height / 2;
      const distance = Math.abs(itemMiddle - centerLine);

      if (distance < minDistance) {
        minDistance = distance;
        closestItem = item;
      }
    });

    serviceItems.forEach(item => {
      const dot = item.querySelector('.service-dot');
      if (item === closestItem) {
        item.classList.add('active');
        if (dot) dot.classList.add('active');
      } else {
        item.classList.remove('active');
        if (dot) dot.classList.remove('active');
      }
    });
  }

  // Throttle scroll events with requestAnimationFrame for performance
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateTimeline();
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateTimeline);
  
  // Run once initially to set the correct active state on load
  updateTimeline();

  // --- Gallery Slideshow Logic ---
  const galleryTrack = document.querySelector('.gallery-slides-track');
  const gallerySlides = document.querySelectorAll('.gallery-slide');
  const galleryDots = document.querySelectorAll('.gallery-dot');
  const btnPrev = document.querySelector('.gallery-prev');
  const btnNext = document.querySelector('.gallery-next');

  if (galleryTrack && gallerySlides.length > 0) {
    let currentSlideIndex = 0;
    const totalSlides = gallerySlides.length;

    function goToSlide(index) {
      // Ensure index stays in bounds
      if (index < 0) {
        currentSlideIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentSlideIndex = 0;
      } else {
        currentSlideIndex = index;
      }

      // Slide track
      galleryTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

      // Update active slide classes and play/pause videos
      gallerySlides.forEach((slide, idx) => {
        const video = slide.querySelector('video');
        if (idx === currentSlideIndex) {
          slide.classList.add('active');
          if (video) {
            video.currentTime = 0;
            video.play().catch(err => console.log('Video play failed or blocked:', err));
          }
        } else {
          slide.classList.remove('active');
          if (video) {
            video.pause();
          }
        }
      });

      // Update dots state
      galleryDots.forEach((dot, idx) => {
        if (idx === currentSlideIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Navigation buttons listeners
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        goToSlide(currentSlideIndex - 1);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        goToSlide(currentSlideIndex + 1);
      });
    }

    // Dot indicators listeners
    galleryDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(index)) {
          goToSlide(index);
        }
      });
    });

    // Touch Swiping support for mobile users
    let touchStartX = 0;
    let touchEndX = 0;
    
    galleryTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    }, { passive: true });

    function handleSwipeGesture() {
      const swipeThreshold = 50; // minimum pixels to count as swipe
      if (touchStartX - touchEndX > swipeThreshold) {
        goToSlide(currentSlideIndex + 1);
      } else if (touchEndX - touchStartX > swipeThreshold) {
        goToSlide(currentSlideIndex - 1);
      }
    }

    // Autoplay feature: slide every 5 seconds unless hovered
    let autoplayTimer = setInterval(() => {
      goToSlide(currentSlideIndex + 1);
    }, 5000);

    const sliderContainer = document.querySelector('.gallery-slider-viewport');
    if (sliderContainer) {
      // Pause autoplay on mouse hover, resume on leave
      sliderContainer.addEventListener('mouseenter', () => {
        clearInterval(autoplayTimer);
      });
      sliderContainer.addEventListener('mouseleave', () => {
        autoplayTimer = setInterval(() => {
          goToSlide(currentSlideIndex + 1);
        }, 5000);
      });
      
      // Pause autoplay on mobile tap
      sliderContainer.addEventListener('touchstart', () => {
        clearInterval(autoplayTimer);
      }, { passive: true });
    }
  }

  // --- Booking / Order Form Controller Logic ---
  const serviceSelect = document.getElementById('service-select');
  const optionsWigs = document.getElementById('options-wigs');
  const optionsProducts = document.getElementById('options-products');
  const optionsStyling = document.getElementById('options-styling');

  function updateConditionalFields() {
    if (!serviceSelect || !optionsWigs || !optionsProducts || !optionsStyling) return;
    
    const selectedService = serviceSelect.value;
    
    // Hide all panels
    optionsWigs.classList.add('hidden');
    optionsProducts.classList.add('hidden');
    optionsStyling.classList.add('hidden');

    // Show appropriate panel
    if (selectedService === 'wigs') {
      optionsWigs.classList.remove('hidden');
    } else if (selectedService === 'products') {
      optionsProducts.classList.remove('hidden');
    } else if (selectedService === 'styling') {
      optionsStyling.classList.remove('hidden');
    }
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', updateConditionalFields);
  }

  // --- Smart Connection: Link Services Arrows to Booking Form ---
  const serviceArrows = document.querySelectorAll('.service-arrow');
  serviceArrows.forEach(arrow => {
    arrow.addEventListener('click', (e) => {
      e.preventDefault();
      
      const serviceItem = arrow.closest('.service-item');
      if (!serviceItem || !serviceSelect) return;

      let serviceValue = '';
      if (serviceItem.id === 'service-wigs') {
        serviceValue = 'wigs';
      } else if (serviceItem.id === 'service-products') {
        serviceValue = 'products';
      } else if (serviceItem.id === 'service-styling') {
        serviceValue = 'styling';
      }

      if (serviceValue) {
        serviceSelect.value = serviceValue;
        updateConditionalFields();
      }

      // Scroll smoothly to book-now
      const bookingSection = document.getElementById('book-now');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- WhatsApp & Email Order Submission Handlers ---
  const btnWhatsapp = document.getElementById('btn-whatsapp');
  const btnEmail = document.getElementById('btn-email');
  const clientNameInput = document.getElementById('client-name');
  const clientPhoneInput = document.getElementById('client-phone');
  const orderNotesInput = document.getElementById('order-notes');

  // Contact configurations (Client can update these values)
  const WHATSAPP_PHONE = '447123456789'; // format: country code + number without '+' or spaces
  const EMAIL_ADDRESS = 'orders@charashair.com';

  function getOrderData() {
    const name = clientNameInput ? clientNameInput.value.trim() : '';
    const phone = clientPhoneInput ? clientPhoneInput.value.trim() : '';
    const service = serviceSelect ? serviceSelect.value : '';

    if (!name || !phone || !service) {
      alert('Please fill in your Name, Phone Number, and select a Service first.');
      if (!name) clientNameInput?.focus();
      else if (!phone) clientPhoneInput?.focus();
      else if (!service) serviceSelect?.focus();
      return null;
    }

    let serviceLabel = '';
    let specs = {};

    if (service === 'wigs') {
      serviceLabel = 'Custom Wig Order';
      specs = {
        'Type of Wig': document.getElementById('wig-type')?.value,
        'Type of Hair': document.getElementById('hair-type')?.value,
        'Hair Origin': document.getElementById('human-hair-origin')?.value,
        'Cap Type': document.getElementById('cap-type')?.value,
        'Head Size': document.getElementById('head-size')?.value
      };
    } else if (service === 'products') {
      serviceLabel = 'Premium Hair Products';
      specs = {
        'Product Item': document.getElementById('product-select')?.value,
        'Quantity': document.getElementById('product-quantity')?.value
      };
    } else if (service === 'styling') {
      serviceLabel = 'Styling Appointment';
      specs = {
        'Styling Service': document.getElementById('styling-type')?.value,
        'Preferred Date': document.getElementById('styling-date')?.value || 'Not specified',
        'Preferred Time': document.getElementById('styling-time')?.value || 'Not specified'
      };
    }

    const notes = orderNotesInput ? orderNotesInput.value.trim() : '';
    return { name, phone, serviceLabel, specs, notes };
  }

  function buildOrderMessage(data, isWhatsApp = true) {
    if (!data) return '';

    const boldChar = isWhatsApp ? '*' : '';
    
    let msg = `👑 ${boldChar}CHARA'S HAIR - NEW ORDER${boldChar} 👑\n`;
    msg += `----------------------------------\n`;
    msg += `👤 ${boldChar}Client Name:${boldChar} ${data.name}\n`;
    msg += `📞 ${boldChar}Phone:${boldChar} ${data.phone}\n`;
    msg += `💇‍♀️ ${boldChar}Service Type:${boldChar} ${data.serviceLabel}\n\n`;
    
    msg += `📋 ${boldChar}SPECIFICATIONS:${boldChar}\n`;
    for (const [key, val] of Object.entries(data.specs)) {
      msg += `▫️ ${boldChar}${key}:${boldChar} ${val}\n`;
    }
    
    if (data.notes) {
      msg += `\n📝 ${boldChar}SPECIAL REQUESTS:${boldChar}\n"${data.notes}"\n`;
    }
    msg += `----------------------------------\n`;
    msg += `Generated from Chara's Hair Website.`;
    return msg;
  }

  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      const data = getOrderData();
      if (!data) return;

      const messageText = buildOrderMessage(data, true);
      const encodedText = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
      
      window.open(whatsappUrl, '_blank');
    });
  }

  if (btnEmail) {
    btnEmail.addEventListener('click', () => {
      const data = getOrderData();
      if (!data) return;

      const messageText = buildOrderMessage(data, false);
      const encodedBody = encodeURIComponent(messageText);
      const encodedSubject = encodeURIComponent(`New Chara's Hair Order - ${data.name}`);
      const emailUrl = `mailto:${EMAIL_ADDRESS}?subject=${encodedSubject}&body=${encodedBody}`;
      
      window.location.href = emailUrl;
    });
  }

  // --- Floating WhatsApp Chat Widget Controller Logic ---
  const waTrigger = document.getElementById('wa-trigger');
  const waChatWindow = document.getElementById('wa-chat-window');
  const waCloseChat = document.getElementById('wa-close-chat');
  const waChatTime = document.getElementById('wa-chat-time');
  const waCtaLink = document.getElementById('wa-cta-link');

  // Format and update the chat bubble timestamp dynamically
  function updateChatTimestamp() {
    if (!waChatTime) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    waChatTime.textContent = `${hours}:${minutes} ${ampm}`;
  }

  // Synchronize widget CTA button link with script WHATSAPP_PHONE configuration
  if (waCtaLink) {
    const starterMessage = "Hey! I'm interested in ordering custom wigs or extensions. How do we get started?";
    const encodedStarter = encodeURIComponent(starterMessage);
    waCtaLink.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedStarter}`;
  }

  if (waTrigger && waChatWindow) {
    // Open chat window
    waTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      waChatWindow.classList.toggle('hidden');
      if (!waChatWindow.classList.contains('hidden')) {
        updateChatTimestamp();
      }
    });

    // Close chat window via cross button
    if (waCloseChat) {
      waCloseChat.addEventListener('click', (e) => {
        e.stopPropagation();
        waChatWindow.classList.add('hidden');
      });
    }

    // Close chat window when clicking outside the widget
    document.addEventListener('click', (e) => {
      if (!waChatWindow.classList.contains('hidden')) {
        const isClickInside = waChatWindow.contains(e.target) || waTrigger.contains(e.target);
        if (!isClickInside) {
          waChatWindow.classList.add('hidden');
        }
      }
    });
  }
});
