// --- Smooth Scrolling Logic ---
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        // Check if the link is an internal hash link (e.g., #section-id)
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const section = document.querySelector(href);
            if (section) {
                // Use smooth scroll behavior
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // If it's a link to another page (index.html, about.html, etc.), let the default behavior happen
    });
});


// --- Scroll Reveal Animation Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // Select all elements that should be animated on scroll
    // This will target any element with the class 'reveal' on any page
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length === 0) {
        // If no elements have the 'reveal' class, exit to save resources
        return;
    }

    // Configuration options for the Intersection Observer
    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the item must be visible to trigger
    };

    // Callback function executed when an element's visibility changes
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If the element is visible, add the 'active' class to trigger the animation
                entry.target.classList.add('active');
                // Stop observing this element once it has been revealed
                observer.unobserve(entry.target);
            }
        });
    };

    // Create the Intersection Observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Apply the observer to all elements with the 'reveal' class
    revealElements.forEach(element => {
        observer.observe(element);
    });
});
