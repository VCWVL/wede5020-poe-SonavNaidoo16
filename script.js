// --- Global Utility Function ---
// Helper function to format currency as ZAR (South African Rand)
const formatZAR = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2
    }).format(amount);
};

// ---Smooth Scrolling Logic (Independent of DOMContentLoaded) ---
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const section = document.querySelector(href);
            if (section) {
                // Use smooth scroll behavior
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});


// ---DOMContentLoaded for all Page-Specific Logic ---
document.addEventListener('DOMContentLoaded', () => {

    // ---Scroll Reveal Animation Logic ---
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        const observerOptions = {
            root: null, 
            rootMargin: '0px',
            threshold: 0.1 
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                const targetElement = entry.target;
                if (entry.isIntersecting) {
                    targetElement.classList.add('active');
                    observer.unobserve(targetElement);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        revealElements.forEach(element => {
            observer.observe(element);
        });
    }


    // ---Search Filter Logic (Applies primarily to quote.html and services.html) ---
    const searchInput = document.getElementById('search');

    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const query = searchInput.value.toLowerCase();

            document.querySelectorAll('.service-category').forEach((category) => {
                let hasVisibleItem = false;
                const categoryElement = category;

                category.querySelectorAll('.item-row').forEach((row) => {
                    const rowElement = row;
                    // Use dataset access, with fallback for safety
                    const itemName = (rowElement.dataset.name || '').toLowerCase(); 
                    if (itemName.includes(query)) {
                        rowElement.style.display = ''; 
                        hasVisibleItem = true;
                    } else {
                        rowElement.style.display = 'none'; 
                    }
                });

                categoryElement.style.display = hasVisibleItem ? '' : 'none';
            });
        });
    }


    // ---Quote Calculator and Checkout Logic (Applies primarily to quote.html) ---
    const quoteForm = document.getElementById('quoteForm');

    if (quoteForm) {
        const VAT_RATE = 0.15; // 15% VAT
        const subTotalSpan = document.getElementById('subTotal');
        const vatSpan = document.getElementById('vat');
        const totalSpan = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');

        // Main calculation function
        const recalc = () => {
            let subTotal = 0;
            const selectedItems = [];

            document.querySelectorAll('.item-row').forEach((row) => {
                const rowElement = row;
                const checkbox = rowElement.querySelector('.itemChk');
                const qtyInput = rowElement.querySelector('.qty');

                if (checkbox && checkbox.checked && qtyInput) {
                    // Use Number() for robust conversion from string, with fallback
                    const itemPrice = Number(rowElement.dataset.price) || 0; 
                    const itemName = rowElement.dataset.name || 'Unknown Item';
                    const quantity = Number(qtyInput.value) || 0;

                    const itemTotal = itemPrice * quantity;
                    subTotal += itemTotal;

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

            const vat = subTotal * VAT_RATE;
            const total = subTotal + vat;

            subTotalSpan.textContent = formatZAR(subTotal);
            vatSpan.textContent = formatZAR(vat);
            totalSpan.textContent = formatZAR(total);

            checkoutBtn.disabled = selectedItems.length === 0;

            // Save object to localStorage for checkout.html
            localStorage.setItem('quoteItems', JSON.stringify(selectedItems));
            localStorage.setItem('quoteTotal', JSON.stringify({ subTotal, vat, total }));
        };

        // --- Event Listeners for Quote Form ---

        // Submit form (Checkout Button Click)
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const storedItems = localStorage.getItem('quoteItems');
            if (storedItems && JSON.parse(storedItems).length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert('Please select at least one item to proceed to checkout.');
            }
        });

        // Change events (Checkbox and Quantity)
        quoteForm.addEventListener('change', (e) => {
            const target = e.target;

            if (target && target.classList.contains('itemChk')) {
                const itemRow = target.closest('.item-row');
                const qtyInput = itemRow.querySelector('.qty');

                qtyInput.disabled = !target.checked;
                // Value must be set as a string
                qtyInput.value = target.checked ? '1' : '0'; 
                
                recalc();
            }
        });

        // Input events (Quantity)
        quoteForm.addEventListener('input', (e) => {
            const target = e.target;

            if (target && target.classList.contains('qty')) {
                // Read as number
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

        recalc();
    } // End of quoteForm logic


    // ---Checkout Page Logic (Applies primarily to checkout.html) ---
    const checkoutSummaryTableBody = document.getElementById('checkoutSummaryBody');

    if (checkoutSummaryTableBody) {
        
        const loadCheckoutItems = () => {
            const itemsJson = localStorage.getItem('quoteItems');
            const totalJson = localStorage.getItem('quoteTotal');
            
            if (itemsJson && totalJson) {
                const selectedItems = JSON.parse(itemsJson);
                const totals = JSON.parse(totalJson);

                checkoutSummaryTableBody.innerHTML = ''; 

                if (selectedItems.length === 0) {
                    checkoutSummaryTableBody.innerHTML = '<tr><td colspan="4">No items were added to the quote.</td></tr>';
                    return;
                }

                selectedItems.forEach((item) => {
                    const row = checkoutSummaryTableBody.insertRow(); 
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td class="text-end">${formatZAR(item.price)}</td>
                        <td class="text-center">${item.qty}</td>
                        <td class="text-end">${formatZAR(item.total)}</td>
                    `;
                });

                // Retrieve elements for display updates
                const subTotalElem = document.getElementById('checkoutSubTotal');
                const vatElem = document.getElementById('checkoutVAT');
                const totalElem = document.getElementById('checkoutTotal');

                if (subTotalElem) subTotalElem.textContent = formatZAR(totals.subTotal);
                if (vatElem) vatElem.textContent = formatZAR(totals.vat);
                if (totalElem) totalElem.textContent = formatZAR(totals.total);
            } else {
                 checkoutSummaryTableBody.innerHTML = '<tr><td colspan="4">Could not load quote data. Please return to the quote page.</td></tr>';
            }
        };

        loadCheckoutItems();
    } // End of checkoutSummaryTableBody logic


    // ---Gallery Lightbox Logic (Applies primarily to gallery.html) ---

    const galleryImages = document.querySelectorAll('.gallery-image');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (galleryImages.length > 0 && lightbox && lightboxImg && lightboxCaption && closeBtn) {
        galleryImages.forEach((image) => {
            image.addEventListener('click', () => {
                lightbox.style.display = "block";
                lightboxImg.src = image.src;
                lightboxCaption.textContent = image.alt;
            });
        });

        closeBtn.addEventListener('click', () => {
            lightbox.style.display = "none";
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && lightbox.style.display === "block") {
                lightbox.style.display = "none";
            }
        });
    }

}); // End of DOMContentLoaded