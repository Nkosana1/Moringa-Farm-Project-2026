// Hamburger Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Update aria-expanded attribute for accessibility
            const isExpanded = nav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close menu when clicking on a link (mobile)
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Only close on mobile (when menu is visible)
                if (window.innerWidth < 768) {
                    nav.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        // Close menu when clicking outside (mobile)
        document.addEventListener('click', function(event) {
            if (window.innerWidth < 768) {
                const isClickInsideNav = nav.contains(event.target);
                const isClickOnToggle = menuToggle.contains(event.target);
                
                if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const statusEl = contactForm.querySelector('.form-status');
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            statusEl.classList.remove('error');
            statusEl.textContent = '';

            const formData = {
                name: contactForm.name.value.trim(),
                email: contactForm.email.value.trim(),
                phone: contactForm.phone.value.trim(),
                message: contactForm.message.value.trim()
            };

            if (!formData.name || !formData.email || !formData.message) {
                statusEl.textContent = 'Please fill in all required fields.';
                statusEl.classList.add('error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                if (response.ok) {
                    statusEl.textContent = 'Thanks! Your message has been sent.';
                    contactForm.reset();
                } else {
                    statusEl.textContent = data?.error || 'Something went wrong. Please try again.';
                    statusEl.classList.add('error');
                }
            } catch (error) {
                statusEl.textContent = 'Unable to send message at this time.';
                statusEl.classList.add('error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Inquiry';
            }
        });
    }
});

