// GLOBAL UTILITY FUNCTION 
// Helper function to format a number into South African Rand (ZAR) currency format
const formatZAR = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',       // Use currency formatting
        currency: 'ZAR',         // Specify South African Rand
        minimumFractionDigits: 2 // Always show two decimal places
    }).format(amount);           // Return formatted string (e.g. R1,234.56)
};


// SMOOTH SCROLLING FOR INTERNAL LINKS 
// Select all navigation links in the header
const navLinks = document.querySelectorAll('nav a');
// Loop through each link and add a click event
navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href'); // Get link target (e.g. #services)
        // Only apply smooth scrolling if the link is internal (starts with '#')
        if (href && href.startsWith('#')) {
            e.preventDefault(); // Prevent normal jump scrolling
            const section = document.querySelector(href); // Find the target section
            if (section) {
                // Smoothly scroll to the section
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});


// PAGE-SPECIFIC LOGIC (Runs after DOM loads) 
document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------------------
    // 1. SCROLL REVEAL ANIMATION 
    // This function adds a class to elements when they enter the viewport.
    // -----------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');

    // Check if there are elements to observe
    if (revealElements.length > 0) {
        // Options for the Intersection Observer
        const observerOptions = {
            root: null, // relative to the viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                // If the element is now intersecting (visible)
                if (entry.isIntersecting) {
                    // Add the 'active' class to start the CSS animation
                    entry.target.classList.add('active');
                    // Stop observing the element once it has been revealed
                    observer.unobserve(entry.target);
                }
            });
        };

        // Create the observer and attach it to all reveal elements
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    // -----------------------------------------------------------
    // 2. LIGHTBOX LOGIC FOR GALLERY.HTML 
    // Handles opening and closing a full-screen image view.
    // -----------------------------------------------------------
    const galleryImages = document.querySelectorAll('.gallery-image');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    // Check that all lightbox elements exist before adding logic
    if (galleryImages.length > 0 && lightbox && lightboxImg && lightboxCaption && closeBtn) {
        // Open lightbox when an image is clicked
        galleryImages.forEach((image) => {
            image.addEventListener('click', () => {
                lightbox.style.display = "block";
                lightboxImg.src = image.src;
                lightboxCaption.textContent = image.alt;
            });
        });

        // Close lightbox when close button is clicked
        closeBtn.addEventListener('click', () => {
            lightbox.style.display = "none";
        });

        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
            }
        });

        // Close lightbox when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && lightbox.style.display === "block") {
                lightbox.style.display = "none";
            }
        });
    }

    // -----------------------------------------------------------
    // 3. SERVICE SEARCH FILTER LOGIC FOR SERVICES.HTML 
    // This runs only if the search input with ID 'serviceSearch' exists.
    // -----------------------------------------------------------
    const serviceSearchInput = document.getElementById('serviceSearch');
    const serviceCards = document.querySelectorAll('.service-card');

    if (serviceSearchInput && serviceCards.length > 0) {
        serviceSearchInput.addEventListener('input', () => {
            const query = serviceSearchInput.value.trim().toLowerCase();

            serviceCards.forEach(card => {
                // Get all text content from the card (including heading and paragraph)
                const text = card.textContent.toLowerCase();

                if (text.includes(query)) {
                    card.style.display = 'block'; // Show the card
                } else {
                    card.style.display = 'none';  // Hide the card
                }
            });
        });
    }

}); // End of DOMContentLoaded
