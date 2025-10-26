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

// --- DOMContentLoaded for all Page-Specific Logic ---
document.addEventListener('DOMContentLoaded', () => {

    // ---Scroll Reveal Animation Logic ---
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        const observerOptions = {
            root: null, // relative to the viewport
            rootMargin: '0px',
            threshold: 0.1 // 10% of the item must be visible to trigger
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
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

            // Loop through all service categories/sections
            document.querySelectorAll('.service-category').forEach(category => {
                let hasVisibleItem = false;

                // Loop through each item in the category (assumes items have class .item-row)
                category.querySelectorAll('.item-row').forEach(row => {
                    // Uses the data-name attribute for searching
                    const itemName = row.dataset.name.toLowerCase();
                    if (itemName.includes(query)) {
                        row.style.display = ''; // show matching item
                        hasVisibleItem = true;
                    } else {
                        row.style.display = 'none'; // hide non-matching item
                    }
                });

                // Hide the entire category if it has no visible items
                category.style.display = hasVisibleItem ? '' : 'none';
            });
        });
    }


    // ---Quote Calculator and Checkout Logic ---
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

            // Iterate over all item rows in the form
            document.querySelectorAll('.item-row').forEach(row => {
                const checkbox = row.querySelector('.itemChk');
                const qtyInput = row.querySelector('.qty');

                if (checkbox && checkbox.checked) {
                    const itemPrice = parseFloat(row.dataset.price);
                    const itemName = row.dataset.name;
                    const quantity = parseInt(qtyInput.value) || 0;

                    const itemTotal = itemPrice * quantity;
                    subTotal += itemTotal;

                    // Store selected item details for checkout
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

            // Update the summary section
            subTotalSpan.textContent = formatZAR(subTotal);
            vatSpan.textContent = formatZAR(vat);
            totalSpan.textContent = formatZAR(total);

            // Enable/Disable checkout button based on items selected
            checkoutBtn.disabled = selectedItems.length === 0;

            // Save selected items and totals to localStorage for the checkout page
            localStorage.setItem('quoteItems', JSON.stringify(selectedItems));
            localStorage.setItem('quoteTotal', JSON.stringify({ subTotal, vat, total }));
        };

        // --- Event Listeners for Quote Form ---

        // Submit form (Checkout Button Click)
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const storedItems = localStorage.getItem('quoteItems');
            if (storedItems && JSON.parse(storedItems).length > 0) {
                // Navigate to checkout.html if items are selected
                window.location.href = 'checkout.html';
            } else {
                alert('Please select at least one item to proceed to checkout.');
            }
        });

        //  Change events (Checkbox and Quantity)
        quoteForm.addEventListener('change', e => {
            if (e.target.classList.contains('itemChk')) {
                const qtyInput = e.target.closest('.item-row').querySelector('.qty');
                
                // Toggle quantity input's disabled state
                qtyInput.disabled = !e.target.checked;
                
                // Set quantity to 1 if checked, 0 if unchecked
                qtyInput.value = e.target.checked ? 1 : 0;
                
                recalc();
            }
        });

        //  Input events (Quantity)
        quoteForm.addEventListener('input', e => {
            if (e.target.classList.contains('qty')) {
                // Ensure quantity is not negative
                if (parseInt(e.target.value) < 0 || e.target.value === '') {
                    e.target.value = 0;
                }
                
                const checkbox = e.target.closest('.item-row').querySelector('.itemChk');
                
                if (parseInt(e.target.value) > 0) {
                    // If user enters a quantity > 0, check the box and enable the input
                    checkbox.checked = true;
                    e.target.disabled = false;
                } else {
                    // If user clears quantity or sets it to 0, uncheck the box and disable the input
                    checkbox.checked = false;
                    e.target.disabled = true;
                }
                recalc();
            }
        });

        // Initial calculation on quote page load
        recalc();
    } // End of quoteForm logic


    // Checkout Page Logic (Applies primarily to checkout.html) 
    const checkoutSummaryTableBody = document.getElementById('checkoutSummaryBody');

    if (checkoutSummaryTableBody) {
        
        const loadCheckoutItems = () => {
            const itemsJson = localStorage.getItem('quoteItems');
            const totalJson = localStorage.getItem('quoteTotal');
            
            if (itemsJson && totalJson) {
                const selectedItems = JSON.parse(itemsJson);
                const totals = JSON.parse(totalJson);

                checkoutSummaryTableBody.innerHTML = ''; // Clear existing rows

                if (selectedItems.length === 0) {
                    checkoutSummaryTableBody.innerHTML = '<tr><td colspan="4">No items were added to the quote.</td></tr>';
                    return;
                }

                // Populate the table with selected items
                selectedItems.forEach(item => {
                    const row = checkoutSummaryTableBody.insertRow();
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td class="text-end">${formatZAR(item.price)}</td>
                        <td class="text-center">${item.qty}</td>
                        <td class="text-end">${formatZAR(item.total)}</td>
                    `;
                });

                // Update the totals in the summary section of the checkout page
                document.getElementById('checkoutSubTotal').textContent = formatZAR(totals.subTotal);
                document.getElementById('checkoutVAT').textContent = formatZAR(totals.vat);
                document.getElementById('checkoutTotal').textContent = formatZAR(totals.total);
            } else {
                 checkoutSummaryTableBody.innerHTML = '<tr><td colspan="4">Could not load quote data. Please return to the quote page.</td></tr>';
            }
        };

        // Load items when the checkout page is ready
        loadCheckoutItems();
    } // End of checkoutSummaryTableBody logic

}); 