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
    // SCROLL REVEAL ANIMATION 
    const revealElements = document.querySelectorAll('.reveal');
    // If there are elements to animate
    if (revealElements.length > 0) {
        // Intersection Observer configuration
        const observerOptions = {
            root: null,          // Use the viewport
            rootMargin: '0px',   // No margin offset
            threshold: 0.1       // Trigger when 10% of the element is visible
        };

        // Callback: runs when an element enters the viewport
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                const targetElement = entry.target;
                if (entry.isIntersecting) {
                    targetElement.classList.add('active'); // Trigger animation
                    observer.unobserve(targetElement);     // Stop observing once revealed
                }
            });
        };
        // Create observer and attach it to all .reveal elements
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    //  SEARCH FILTER (for quote.html / services.html) 
    const searchInput = document.getElementById('search');
    // Only run this if the page contains a search bar
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const query = searchInput.value.toLowerCase(); // Convert to lowercase for comparison

            // Loop through all service categories
            document.querySelectorAll('.service-category').forEach((category) => {
                let hasVisibleItem = false; // Track if this category has a match

                category.querySelectorAll('.item-row').forEach((row) => {
                    const itemName = (row.dataset.name || '').toLowerCase();
                    if (itemName.includes(query)) {
                        row.style.display = '';   // Show matching item
                        hasVisibleItem = true;
                    } else {
                        row.style.display = 'none'; // Hide non-matching item
                    }
                });

                // Hide entire category if it has no visible items
                category.style.display = hasVisibleItem ? '' : 'none';
            });
        });
    }

    // QUOTE CALCULATOR & CHECKOUT HANDLER 
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        const VAT_RATE = 0.15; // South African VAT = 15%

        // Get UI elements for live calculation updates
        const subTotalSpan = document.getElementById('subTotal');
        const vatSpan = document.getElementById('vat');
        const totalSpan = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');

        // Function to recalculate totals dynamically
        const recalc = () => {
            let subTotal = 0;
            const selectedItems = [];

            // Loop through each available service item
            document.querySelectorAll('.item-row').forEach((row) => {
                const checkbox = row.querySelector('.itemChk');
                const qtyInput = row.querySelector('.qty');

                if (checkbox && checkbox.checked && qtyInput) {
                    const itemPrice = Number(row.dataset.price) || 0;
                    const itemName = row.dataset.name || 'Unknown Item';
                    const quantity = Number(qtyInput.value) || 0;

                    const itemTotal = itemPrice * quantity;
                    subTotal += itemTotal;

                    // Only save if quantity is valid
                    if (quantity > 0) {
                        selectedItems.push({
                            name: itemName,
                            price: itemPrice,
                            qty: quantity,
                            total: itemTotal
                        });
                    }
                }
            });

            // Calculate VAT and total
            const vat = subTotal * VAT_RATE;
            const total = subTotal + vat;

            // Display formatted totals
            subTotalSpan.textContent = formatZAR(subTotal);
            vatSpan.textContent = formatZAR(vat);
            totalSpan.textContent = formatZAR(total);

            // Disable checkout if no items selected
            checkoutBtn.disabled = selectedItems.length === 0;

            // Save selections for the checkout page
            localStorage.setItem('quoteItems', JSON.stringify(selectedItems));
            localStorage.setItem('quoteTotal', JSON.stringify({ subTotal, vat, total }));
        };

        // FORM EVENT HANDLERS

        // Handle "Checkout" form submission
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const storedItems = localStorage.getItem('quoteItems');
            if (storedItems && JSON.parse(storedItems).length > 0) {
                window.location.href = 'checkout.html'; // Redirect to checkout
            } else {
                alert('Please select at least one item to proceed to checkout.');
            }
        });

        // Detect checkbox toggles (enable/disable quantity)
        quoteForm.addEventListener('change', (e) => {
            const target = e.target;
            if (target && target.classList.contains('itemChk')) {
                const itemRow = target.closest('.item-row');
                const qtyInput = itemRow.querySelector('.qty');

                // Enable quantity if checked
                qtyInput.disabled = !target.checked;
                qtyInput.value = target.checked ? '1' : '0';
                recalc();
            }
        });

        // Detect quantity input changes
        quoteForm.addEventListener('input', (e) => {
            const target = e.target;
            if (target && target.classList.contains('qty')) {
                let currentValue = Number(target.value);
                if (currentValue < 0 || target.value === '') {
                    target.value = '0';
                    currentValue = 0;
                }
                const itemRow = target.closest('.item-row');
                const checkbox = itemRow.querySelector('.itemChk');
                if (currentValue > 0) {
                    checkbox.checked = true;
                    target.disabled = false;
                } else {
                    checkbox.checked = false;
                    target.disabled = true;
                }
                recalc();
            }
        });
        // Perform initial total calculation on load
        recalc();
    }

    // CHECKOUT PAGE: LOAD SAVED QUOTE DATA 
    const checkoutSummaryTableBody = document.getElementById('checkoutSummaryBody');

    if (checkoutSummaryTableBody) {

        const loadCheckoutItems = () => {
            const itemsJson = localStorage.getItem('quoteItems');
            const totalJson = localStorage.getItem('quoteTotal');

            if (itemsJson && totalJson) {
                const selectedItems = JSON.parse(itemsJson);
                const totals = JSON.parse(totalJson);
                checkoutSummaryTableBody.innerHTML = '';

                // If no items exist
                if (selectedItems.length === 0) {
                    checkoutSummaryTableBody.innerHTML = '<tr><td colspan="4">No items were added to the quote.</td></tr>';
                    return;
                }

                // Dynamically add each item to the table
                selectedItems.forEach((item) => {
                    const row = checkoutSummaryTableBody.insertRow();
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td class="text-end">${formatZAR(item.price)}</td>
                        <td class="text-center">${item.qty}</td>
                        <td class="text-end">${formatZAR(item.total)}</td>
                    `;
                });

                // Update total fields
                const subTotalElem = document.getElementById('checkoutSubTotal');
                const vatElem = document.getElementById('checkoutVAT');
                const totalElem = document.getElementById('checkoutTotal');

                if (subTotalElem) subTotalElem.textContent = formatZAR(totals.subTotal);
                if (vatElem) vatElem.textContent = formatZAR(totals.vat);
                if (totalElem) totalElem.textContent = formatZAR(totals.total);
            } else {
                // If no data found in storage
                checkoutSummaryTableBody.innerHTML = '<tr><td colspan="4">Could not load quote data. Please return to the quote page.</td></tr>';
            }
        };
        loadCheckoutItems();
    }

    // GALLERY LIGHTBOX FUNCTIONALITY 
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
}); // End of DOMContentLoaded