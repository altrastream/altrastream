// Main application script for Altrastreams ISP website

// Global state management
const state = {
    currentTestimonial: 0,
    testimonialInterval: null,
    currentSpeed: 500,
    chatOpen: false
};

// Utility functions
const utils = {
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Smooth scroll to element
    scrollTo: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // Format slider values
    formatSliderValue: (type, value) => {
        switch (type) {
            case 'streaming':
                return value >= 10 ? '10+ devices' : `${value} device${value > 1 ? 's' : ''}`;
            case 'gaming':
                return value === 0 ? 'None' : `${value} user${value > 1 ? 's' : ''}`;
            case 'devices':
                return value >= 50 ? '50+ devices' : `${value} devices`;
            default:
                return value;
        }
    }
};

// Header scroll effect
const headerController = {
    init() {
        const header = document.getElementById('header');
        const toggleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', utils.debounce(toggleScroll, 10));
    }
};

// Mobile navigation
const mobileNav = {
    init() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', this.toggle.bind(this));
            
            // Close menu when clicking on links
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    this.close();
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    this.close();
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            });
        }
    },

    toggle() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    },

    close() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Mobile sticky CTA
const mobileCTA = {
    init() {
        const mobileCTA = document.getElementById('mobile-cta');
        const footer = document.querySelector('.footer');
        
        if (mobileCTA && footer) {
            const toggleCTA = () => {
                const footerRect = footer.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                if (footerRect.top <= windowHeight) {
                    mobileCTA.classList.add('hidden');
                } else {
                    mobileCTA.classList.remove('hidden');
                }
            };

            window.addEventListener('scroll', utils.debounce(toggleCTA, 10));
        }
    }
};

// Button click handler - ensures all buttons link to phone
const buttonController = {
    init() {
        // Select all buttons with class 'btn'
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            // Skip buttons that already have specific click handlers
            if (button.onclick || button.id === 'chat-btn' || button.classList.contains('testimonial-nav-btn') || button.classList.contains('speed-btn') || button.classList.contains('modal-close')) {
                return;
            }
            
            // Add phone link to all other buttons
            button.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'tel:+18334881043';
            });
        });
    }
};

// Plan recommendation system
const planRecommendation = {
    init() {
        const sliders = document.querySelectorAll('.plan-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', this.updateRecommendation.bind(this));
            this.updateSliderValue(slider);
        });
        
        // Initial recommendations
        this.calculateRecommendations();
    },

    updateSliderValue(slider) {
        const valueElement = slider.parentElement.querySelector('.slider-value');
        const type = slider.dataset.type;
        const value = parseInt(slider.value);
        
        valueElement.textContent = utils.formatSliderValue(type, value);
    },

    updateRecommendation(e) {
        this.updateSliderValue(e.target);
        utils.debounce(() => this.calculateRecommendations(), 300)();
    },

    calculateRecommendations() {
        const plans = ['essential', 'performance', 'ultimate'];
        const requirements = {
            essential: { streaming: 3, gaming: 1, devices: 15 },
            performance: { streaming: 6, gaming: 2, devices: 25 },
            ultimate: { streaming: 10, gaming: 4, devices: 40 }
        };

        plans.forEach(plan => {
            const sliders = document.querySelectorAll(`[data-plan="${plan}"]`);
            const recommendation = document.getElementById(`rec-${plan}`);
            
            let score = 0;
            let totalChecks = 0;

            sliders.forEach(slider => {
                const type = slider.dataset.type;
                const value = parseInt(slider.value);
                const planMax = requirements[plan][type];
                
                totalChecks++;
                if (value <= planMax) {
                    score++;
                }
            });

            const percentage = (score / totalChecks) * 100;
            
            if (percentage === 100) {
                recommendation.textContent = 'Perfect for your needs!';
                recommendation.style.background = 'rgba(34, 197, 94, 0.1)';
                recommendation.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                recommendation.style.color = '#22C55E';
            } else if (percentage >= 66) {
                recommendation.textContent = 'Good fit for most needs';
                recommendation.style.background = 'rgba(251, 191, 36, 0.1)';
                recommendation.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                recommendation.style.color = '#FBBF24';
            } else {
                recommendation.textContent = 'Consider upgrading';
                recommendation.style.background = 'rgba(239, 68, 68, 0.1)';
                recommendation.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                recommendation.style.color = '#EF4444';
            }
            
            recommendation.classList.add('updated');
            setTimeout(() => recommendation.classList.remove('updated'), 500);
        });
    }
};

// Testimonial carousel
const testimonialCarousel = {
    init() {
        const track = document.getElementById('testimonial-track');
        const navButtons = document.querySelectorAll('.testimonial-nav-btn');
        
        if (track && navButtons.length > 0) {
            // Set up navigation buttons
            navButtons.forEach((btn, index) => {
                btn.addEventListener('click', () => this.goToSlide(index));
            });
            
            // Auto-advance testimonials
            this.startAutoAdvance();
            
            // Pause on hover
            track.addEventListener('mouseenter', this.pauseAutoAdvance.bind(this));
            track.addEventListener('mouseleave', this.startAutoAdvance.bind(this));
            
            // Touch/swipe support
            this.initTouchSupport();
        }
    },

    goToSlide(index) {
        const track = document.getElementById('testimonial-track');
        const navButtons = document.querySelectorAll('.testimonial-nav-btn');
        const slideWidth = 100;
        
        state.currentTestimonial = index;
        track.style.transform = `translateX(-${index * slideWidth}%)`;
        
        // Update navigation
        navButtons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    },

    startAutoAdvance() {
        this.pauseAutoAdvance();
        state.testimonialInterval = setInterval(() => {
            const nextSlide = (state.currentTestimonial + 1) % 3;
            this.goToSlide(nextSlide);
        }, 5000);
    },

    pauseAutoAdvance() {
        if (state.testimonialInterval) {
            clearInterval(state.testimonialInterval);
            state.testimonialInterval = null;
        }
    },

    initTouchSupport() {
        const track = document.getElementById('testimonial-track');
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0 && state.currentTestimonial < 2) {
                    this.goToSlide(state.currentTestimonial + 1);
                } else if (diff < 0 && state.currentTestimonial > 0) {
                    this.goToSlide(state.currentTestimonial - 1);
                }
            }
            
            isDragging = false;
        });
    }
};

// Speed visualization
const speedVisualization = {
    init() {
        const speedButtons = document.querySelectorAll('.speed-btn');
        const capabilitiesGrid = document.getElementById('capabilities-grid');
        
        speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseInt(e.target.dataset.speed);
                this.updateSpeed(speed);
            });
        });
        
        // Initial state
        this.updateCapabilities(state.currentSpeed);
    },

    updateSpeed(speed) {
        state.currentSpeed = speed;
        
        // Update button states
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
        });
        
        // Update capabilities
        this.updateCapabilities(speed);
    },

    updateCapabilities(speed) {
        const capabilities = document.querySelectorAll('.capability-chip');
        
        capabilities.forEach(chip => {
            const minSpeed = parseInt(chip.dataset.minSpeed);
            chip.classList.toggle('active', speed >= minSpeed);
        });
    }
};

// Chat modal
const chatModal = {
    init() {
        const chatBtn = document.getElementById('chat-btn');
        const modal = document.getElementById('chat-modal');
        const closeBtn = document.getElementById('chat-close');
        const chatInput = document.querySelector('.chat-input-field');
        const sendBtn = document.querySelector('.chat-input .btn');
        
        if (chatBtn && modal && closeBtn) {
            chatBtn.addEventListener('click', this.open.bind(this));
            closeBtn.addEventListener('click', this.close.bind(this));
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && state.chatOpen) {
                    this.close();
                }
            });
            
            // Handle chat input
            if (chatInput && sendBtn) {
                sendBtn.addEventListener('click', this.sendMessage.bind(this));
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessage();
                    }
                });
            }
        }
    },

    open() {
        const modal = document.getElementById('chat-modal');
        modal.classList.add('active');
        state.chatOpen = true;
        
        // Focus on input
        setTimeout(() => {
            const input = document.querySelector('.chat-input-field');
            if (input) input.focus();
        }, 300);
    },

    close() {
        const modal = document.getElementById('chat-modal');
        modal.classList.remove('active');
        state.chatOpen = false;
    },

    sendMessage() {
        const input = document.querySelector('.chat-input-field');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            
            // Simulate agent response
            setTimeout(() => {
                this.addMessage('Thanks for your message! For immediate assistance, please call us at 833-488-1043. Our technical team is standing by 24/7.', 'agent');
            }, 1000);
        }
    },

    addMessage(text, sender) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const avatarHTML = sender === 'agent' ? 
            `<div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>` :
            `<div class="message-avatar" style="background: var(--color-accent-1);">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>`;
        
        messageDiv.innerHTML = `
            ${avatarHTML}
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">Just now</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
};

// Intersection Observer for reveal animations
const revealController = {
    init() {
        const revealElements = document.querySelectorAll('.reveal');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }
};

// Newsletter subscription
const newsletter = {
    init() {
        const form = document.querySelector('.newsletter-form');
        const input = document.querySelector('.newsletter-input');
        const button = document.querySelector('.newsletter-form .btn');
        
        if (form && input && button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const email = input.value.trim();
                if (this.validateEmail(email)) {
                    this.subscribe(email);
                } else {
                    this.showError('Please enter a valid email address');
                }
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    button.click();
                }
            });
        }
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    subscribe(email) {
        const button = document.querySelector('.newsletter-form .btn');
        const input = document.querySelector('.newsletter-input');
        
        // Show loading state
        button.textContent = 'Subscribing...';
        button.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            button.textContent = 'Subscribed!';
            input.value = '';
            
            setTimeout(() => {
                button.textContent = 'Subscribe';
                button.disabled = false;
            }, 2000);
        }, 1000);
    },

    showError(message) {
        const input = document.querySelector('.newsletter-input');
        input.style.borderColor = '#EF4444';
        
        // Reset after 3 seconds
        setTimeout(() => {
            input.style.borderColor = '';
        }, 3000);
    }
};

// Performance optimizations
const performanceOptimizer = {
    init() {
        // Lazy load images
        this.lazyLoadImages();
        
        // Optimize video loading
        this.optimizeVideo();
        
        // Preload critical resources
        this.preloadCriticalResources();
    },

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    optimizeVideo() {
        const video = document.querySelector('.hero-video');
        if (video) {
            // Reduce quality on mobile
            if (window.innerWidth < 768) {
                video.style.transform = 'scale(1.1)';
            }
            
            // Pause video when not visible
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            });
            
            videoObserver.observe(video);
        }
    },

    preloadCriticalResources() {
        // Preload hero image
        const heroImg = new Image();
        heroImg.src = 'hero.jpg';
        
        // Preload logo
        const logoImg = new Image();
        logoImg.src = 'logo.svg';
    }
};

// Error handling
const errorHandler = {
    init() {
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    },

    handleError(event) {
        console.error('Global error caught:', event.error);
        // Could implement user-facing error reporting here
    },

    handlePromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    }
};

// Accessibility enhancements
const accessibilityController = {
    init() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFocusManagement();
    },

    setupKeyboardNavigation() {
        // Handle tab navigation for custom elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Ensure focus is visible
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },

    setupAriaLabels() {
        // Add ARIA labels to interactive elements that need them
        const interactiveElements = document.querySelectorAll('button:not([aria-label]), [role="button"]:not([aria-label])');
        
        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
                const context = this.getElementContext(element);
                if (context) {
                    element.setAttribute('aria-label', context);
                }
            }
        });
    },

    setupFocusManagement() {
        // Trap focus in modal when open
        const modal = document.getElementById('chat-modal');
        if (modal) {
            modal.addEventListener('keydown', this.trapFocus.bind(this));
        }
    },

    getElementContext(element) {
        // Try to infer appropriate aria-label from context
        const parent = element.closest('[data-context]');
        if (parent) {
            return parent.dataset.context;
        }
        
        const heading = element.closest('section')?.querySelector('h2, h3');
        if (heading) {
            return `${heading.textContent} action`;
        }
        
        return null;
    },

    trapFocus(e) {
        if (!state.chatOpen) return;
        
        const focusableElements = document.querySelectorAll(
            '#chat-modal button, #chat-modal input, #chat-modal textarea, #chat-modal [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    }
};

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functionality
    headerController.init();
    mobileNav.init();
    mobileCTA.init();
    buttonController.init();
    planRecommendation.init();
    testimonialCarousel.init();
    speedVisualization.init();
    chatModal.init();
    newsletter.init();
    revealController.init();
    performanceOptimizer.init();
    errorHandler.init();
    accessibilityController.init();

    // Add loading state management
    document.body.classList.add('loaded');
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations and reduce resource usage
        testimonialCarousel.pauseAutoAdvance();
    } else {
        // Resume normal operation
        if (!state.chatOpen) {
            testimonialCarousel.startAutoAdvance();
        }
    }
});

// Resize handler for responsive adjustments
window.addEventListener('resize', utils.debounce(() => {
    // Handle responsive adjustments
    if (window.innerWidth >= 768) {
        mobileNav.close();
    }
}, 250));