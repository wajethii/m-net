// app.js - Contains all other page scripts

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('hidden');
});

// FAQ toggle
document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('svg');
        
        content.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
        
        // Update aria-expanded
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
    });
});

// Speed test simulation
document.getElementById('start-test').addEventListener('click', function() {
    const button = this;
    const speedBar = document.getElementById('speed-bar');
    const currentSpeed = document.getElementById('current-speed');
    const speedTestResult = document.getElementById('speed-test-result');
    const speedComparison = document.getElementById('speed-comparison');
    
    button.disabled = true;
    button.textContent = 'Testing...';
    button.setAttribute('aria-busy', 'true');
    
    // Simulate speed test
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        speedBar.style.width = `${Math.min(progress, 100)}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            const finalSpeed = Math.floor(Math.random() * 50) + 5;
            currentSpeed.textContent = finalSpeed;
            button.textContent = 'Test Complete';
            button.setAttribute('aria-busy', 'false');
            
            // Show comparison
            const comparisonText = finalSpeed < 100 ? 'slower' : 'faster';
            speedComparison.textContent = comparisonText;
            speedTestResult.classList.remove('hidden');
            
            // Focus on result for screen readers
            setTimeout(() => {
                speedTestResult.setAttribute('tabindex', '-1');
                speedTestResult.focus();
            }, 500);
        }
    }, 200);
});

// Counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(animateCounters, 1);
        } else {
            counter.innerText = target;
        }
    });
}

// Start counters when stats section is in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

observer.observe(document.querySelector('.grid.grid-cols-2'));

// Popup modal
const popupModal = document.getElementById('popup-modal');
const closePopup = document.getElementById('close-popup');

// Show popup after 5 seconds
setTimeout(() => {
    popupModal.classList.remove('hidden');
    popupModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}, 5000);

// Close popup
closePopup.addEventListener('click', () => {
    popupModal.classList.add('hidden');
    popupModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Re-enable scrolling
});

// Close when clicking outside
popupModal.addEventListener('click', (e) => {
    if (e.target === popupModal) {
        popupModal.classList.add('hidden');
        popupModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popupModal.classList.contains('hidden')) {
        popupModal.classList.add('hidden');
        popupModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
});

// Form submission handling
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Here you would typically send the form data to your server
    // For this example, we'll just show a success message
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});