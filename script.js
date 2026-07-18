const itemsContainer = document.getElementById("items");
const itemTemplate = document.getElementById("item-template");
const addItemButton = document.getElementById("add-item");
const themeToggleButton = document.getElementById("theme-toggle");
const themeToggleLabel = document.getElementById("theme-toggle-label");
const itemSearchModal = document.getElementById("item-search-modal");
const closeItemSearchButton = document.getElementById("close-item-search");
const itemSearchInput = document.getElementById("item-search-input");
const itemSearchResults = document.getElementById("item-search-results");
const addCustomItemButton = document.getElementById("add-custom-item");
const showSummaryButton = document.getElementById("show-summary");
const backToEditorButton = document.getElementById("back-to-editor");
const editorTabButton = document.getElementById("editor-tab");
const summaryTabButton = document.getElementById("summary-tab");
const editorScreen = document.getElementById("editor-screen");
const summaryScreen = document.getElementById("summary-screen");
const themeIndicator = document.getElementById("theme-indicator");
const itemCountEl = document.getElementById("item-count");
const heroTotalEl = document.getElementById("hero-total");
const summaryOrbTotalEl = document.getElementById("summary-orb-total");

const taxInput = document.getElementById("tax");
const shippingInput = document.getElementById("shipping");
const orderDiscountInput = document.getElementById("order-discount");

const subtotalEl = document.getElementById("subtotal");
const itemDiscountEl = document.getElementById("item-discount");
const taxAmountEl = document.getElementById("tax-amount");
const shippingAmountEl = document.getElementById("shipping-amount");
const orderDiscountAmountEl = document.getElementById("order-discount-amount");
const grandTotalEl = document.getElementById("grand-total");

const productCatalog = [
    {
        name: "Smart Watch Pro",
        price: 1999,
        discount: 5,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=220&q=80"
    },
    {
        name: "Pulse Headphones X",
        price: 999,
        discount: 8,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=220&q=80"
    },
    {
        name: "AirBuds Neo",
        price: 1499,
        discount: 10,
        image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=220&q=80"
    },
    {
        name: "Steel Water Bottle",
        price: 699,
        discount: 4,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=220&q=80"
    },
    {
        name: "Leather Backpack",
        price: 2499,
        discount: 7,
        image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=220&q=80"
    },
    {
        name: "Desk Lamp Aura",
        price: 1299,
        discount: 6,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=220&q=80"
    }
];

const themeStorageKey = "my-shop-theme";
const fallbackImage = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=220&q=80";

const formatINR = (value) => `Rs ${value.toFixed(2)}`;

function safeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    themeToggleLabel.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
    themeToggleButton.setAttribute("aria-pressed", String(theme === "dark"));
    themeIndicator.textContent = theme === "dark" ? "Dark Interface" : "Light Interface";
}

function initializeTheme() {
    const savedTheme = localStorage.getItem(themeStorageKey);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    applyTheme(initialTheme);
}

function setActiveScreen(screen) {
    const isSummary = screen === "summary";
    editorScreen.classList.toggle("is-active", !isSummary);
    summaryScreen.classList.toggle("is-active", isSummary);
    editorTabButton.classList.toggle("is-active", !isSummary);
    summaryTabButton.classList.toggle("is-active", isSummary);
    editorTabButton.setAttribute("aria-pressed", String(!isSummary));
    summaryTabButton.setAttribute("aria-pressed", String(isSummary));
}

function createItem(defaults = {}) {
    const fragment = itemTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".item-row");

    row.querySelector(".item-name").value = defaults.name || "New Item";
    row.querySelector(".price").value = defaults.price || 0;
    row.querySelector(".qty").value = defaults.qty || 1;
    row.querySelector(".discount").value = defaults.discount || 0;
    row.querySelector(".item-image").src = defaults.image || fallbackImage;

    row.addEventListener("input", calculateTotal);
    row.querySelector(".remove").addEventListener("click", () => {
        row.remove();
        calculateTotal();
    });

    itemsContainer.appendChild(fragment);
    calculateTotal();
}

function createSearchResultButton(product) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.innerHTML = `
        <img src="${product.image || fallbackImage}" alt="${product.name}">
        <span class="search-result-copy">
            <strong>${product.name}</strong>
            <small>${formatINR(product.price || 0)} • ${product.discount || 0}% off</small>
        </span>
    `;
    button.addEventListener("click", () => {
        createItem({
            name: product.name,
            price: product.price || 0,
            qty: 1,
            discount: product.discount || 0,
            image: product.image || fallbackImage
        });
        closeItemSearch();
    });
    return button;
}

function renderSearchResults(query = "") {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredProducts = productCatalog.filter((product) =>
        product.name.toLowerCase().includes(normalizedQuery)
    );

    itemSearchResults.innerHTML = "";

    if (filteredProducts.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "search-empty";
        emptyState.textContent = "No matching product found. You can still add it as a custom item.";
        itemSearchResults.appendChild(emptyState);
        return;
    }

    filteredProducts.forEach((product) => {
        itemSearchResults.appendChild(createSearchResultButton(product));
    });
}

function openItemSearch() {
    itemSearchModal.classList.add("is-open");
    itemSearchModal.setAttribute("aria-hidden", "false");
    itemSearchInput.value = "";
    renderSearchResults();
    setTimeout(() => itemSearchInput.focus(), 0);
}

function closeItemSearch() {
    itemSearchModal.classList.remove("is-open");
    itemSearchModal.setAttribute("aria-hidden", "true");
}

function addCustomItemFromSearch() {
    const customName = itemSearchInput.value.trim();
    if (!customName) {
        itemSearchInput.focus();
        return;
    }

    createItem({
        name: customName,
        price: 0,
        qty: 1,
        discount: 0,
        image: fallbackImage
    });
    closeItemSearch();
}

function calculateTotal() {
    let subtotal = 0;
    let itemDiscountTotal = 0;

    const rows = itemsContainer.querySelectorAll(".item-row");
    itemCountEl.textContent = String(rows.length).padStart(2, "0");

    rows.forEach((row) => {
        const price = safeNumber(row.querySelector(".price").value);
        const qty = safeNumber(row.querySelector(".qty").value);
        const discountPercent = Math.min(100, safeNumber(row.querySelector(".discount").value));

        const lineSubtotal = price * qty;
        const lineDiscount = lineSubtotal * (discountPercent / 100);
        const lineTotal = lineSubtotal - lineDiscount;

        subtotal += lineSubtotal;
        itemDiscountTotal += lineDiscount;
        row.querySelector(".line-total").textContent = formatINR(lineTotal);
    });

    const taxableAmount = subtotal - itemDiscountTotal;
    const taxPercent = safeNumber(taxInput.value);
    const taxAmount = taxableAmount * (taxPercent / 100);

    const shipping = safeNumber(shippingInput.value);
    const orderDiscount = safeNumber(orderDiscountInput.value);

    const grandTotal = Math.max(0, taxableAmount + taxAmount + shipping - orderDiscount);

    subtotalEl.textContent = formatINR(subtotal);
    itemDiscountEl.textContent = formatINR(itemDiscountTotal);
    taxAmountEl.textContent = formatINR(taxAmount);
    shippingAmountEl.textContent = formatINR(shipping);
    orderDiscountAmountEl.textContent = formatINR(orderDiscount);
    grandTotalEl.textContent = formatINR(grandTotal);
    heroTotalEl.textContent = formatINR(grandTotal);
    summaryOrbTotalEl.textContent = formatINR(grandTotal);
}

addItemButton.addEventListener("click", openItemSearch);

themeToggleButton.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
});

closeItemSearchButton.addEventListener("click", closeItemSearch);
itemSearchModal.querySelector(".modal-backdrop").addEventListener("click", closeItemSearch);
itemSearchInput.addEventListener("input", (event) => {
    renderSearchResults(event.target.value);
});
itemSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        addCustomItemFromSearch();
    }
    if (event.key === "Escape") {
        closeItemSearch();
    }
});
addCustomItemButton.addEventListener("click", addCustomItemFromSearch);

showSummaryButton.addEventListener("click", () => {
    calculateTotal();
    setActiveScreen("summary");
});

backToEditorButton.addEventListener("click", () => {
    setActiveScreen("editor");
});

editorTabButton.addEventListener("click", () => {
    setActiveScreen("editor");
});

summaryTabButton.addEventListener("click", () => {
    calculateTotal();
    setActiveScreen("summary");
});

[taxInput, shippingInput, orderDiscountInput].forEach((element) => {
    element.addEventListener("input", calculateTotal);
});

initializeTheme();
setActiveScreen("editor");
renderSearchResults();

createItem({
    name: productCatalog[0].name,
    price: productCatalog[0].price,
    qty: 1,
    discount: productCatalog[0].discount,
    image: productCatalog[0].image
});
createItem({
    name: productCatalog[1].name,
    price: productCatalog[1].price,
    qty: 1,
    discount: productCatalog[1].discount,
    image: productCatalog[1].image
});
createItem({
    name: productCatalog[2].name,
    price: productCatalog[2].price,
    qty: 1,
    discount: productCatalog[2].discount,
    image: productCatalog[2].image
});
