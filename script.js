/* =========================================================
   SHOP CUSTOMER WEBSITE
   Products: products.json
   Order: Email App
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const SHOP_LATITUDE = "27.123456";
const SHOP_LONGITUDE = "75.123456";

const SHOPKEEPER_EMAIL = "pankajsal880@gmail.com";

const PRODUCTS_JSON = "./products.json";


/* =========================================================
   CART
========================================================= */

let cart = [];


/* =========================================================
   CUSTOM ALERT
========================================================= */

function showCustomAlert(message) {

    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("customAlertMessage");

    if (!alertBox || !alertMessage) {
        alert(message);
        return;
    }

    alertMessage.innerText = message;
    alertBox.style.display = "block";

    setTimeout(function () {
        alertBox.style.display = "none";
    }, 2000);
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = String(value ?? "");

    return div.innerHTML;
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

function loadProducts() {

    const container = document.getElementById("productList");

    if (!container) {
        console.error("productList not found");
        return;
    }

    container.innerHTML = `
        <div class="loading-products">
            Loading products...
        </div>
    `;

    const url = PRODUCTS_JSON + "?v=" + Date.now();

    console.log("Fetching products:", url);

    fetch(url)

        .then(function (response) {

            console.log(
                "products.json HTTP status:",
                response.status
            );

            if (!response.ok) {
                throw new Error(
                    "HTTP Error: " + response.status
                );
            }

            return response.json();
        })

        .then(function (products) {

            console.log("Products received:", products);

            if (!Array.isArray(products)) {

                throw new Error(
                    "products.json must contain an array"
                );
            }

            displayProducts(products);
        })

        .catch(function (error) {

            console.error(
                "PRODUCT LOADING ERROR:",
                error
            );

            container.innerHTML = `
                <div class="no-products">
                    Unable to load products.
                    <br><br>
                    ${escapeHTML(error.message)}
                </div>
            `;
        });
}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts(products) {

    const container = document.getElementById("productList");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const availableProducts = products.filter(function (product) {

        return (
            product.available === true ||
            String(product.available)
                .trim()
                .toUpperCase() === "YES"
        );

    });

    if (availableProducts.length === 0) {

        container.innerHTML = `
            <div class="no-products">
                No products available.
            </div>
        `;

        return;
    }

    availableProducts.forEach(function (product) {

        createProductCard(product, container);

    });

    initializeProducts();

    applyCurrentSearch();
}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product, container) {

    const card = document.createElement("div");

    card.className = "product-card";

    card.dataset.id = String(product.id ?? "");

    card.dataset.name = String(product.name ?? "");

    const price = Number(product.price) || 0;

    const discount = Number(product.discount) || 0;

    let finalPrice = price;

    if (discount > 0) {

        finalPrice =
            price - (price * discount / 100);
    }

    let imageURL =
        String(product.imageURL ?? "").trim();

    if (imageURL === "") {
        imageURL = "default-product.jpg";
    }

    const name =
        String(product.name ?? "Product");

    const description =
        String(product.description ?? "");

    card.dataset.price =
        String(finalPrice);

    card.innerHTML = `

        <img
            src="${escapeHTML(imageURL)}"
            alt="${escapeHTML(name)}"
            onerror="this.src='default-product.jpg'"
        >

        <div class="product-info">

            <h3>
                ${escapeHTML(name)}
            </h3>

            <p>
                ${escapeHTML(description)}
            </p>

            <div class="price">

                ₹${finalPrice.toFixed(2)}

                ${
                    discount > 0
                        ? `
                            <span
                                style="
                                    text-decoration: line-through;
                                    color: #888;
                                    font-size: 13px;
                                    margin-left: 5px;
                                "
                            >
                                ₹${price.toFixed(2)}
                            </span>
                        `
                        : ""
                }

            </div>

            ${
                discount > 0
                    ? `
                        <div class="product-discount">
                            ${discount}% OFF
                        </div>
                    `
                    : ""
            }

            <div class="actions">

                <div class="quantity">

                    <button
                        type="button"
                        class="minus"
                    >
                        −
                    </button>

                    <span class="qty">
                        1
                    </span>

                    <button
                        type="button"
                        class="plus"
                    >
                        +
                    </button>

                </div>

                <button
                    type="button"
                    class="add-cart"
                >
                    Add to Cart
                </button>

            </div>

        </div>
    `;

    container.appendChild(card);
}


/* =========================================================
   INITIALIZE PRODUCT BUTTONS
========================================================= */

function initializeProducts() {

    document
        .querySelectorAll(".product-card")
        .forEach(function (card) {

            const minus =
                card.querySelector(".minus");

            const plus =
                card.querySelector(".plus");

            const qty =
                card.querySelector(".qty");

            const addButton =
                card.querySelector(".add-cart");

            if (!minus || !plus || !qty || !addButton) {
                return;
            }

            minus.addEventListener(
                "click",
                function () {

                    let value =
                        Number(qty.innerText) || 1;

                    if (value > 1) {
                        value--;
                    }

                    qty.innerText = value;
                }
            );

            plus.addEventListener(
                "click",
                function () {

                    let value =
                        Number(qty.innerText) || 1;

                    value++;

                    qty.innerText = value;
                }
            );

            addButton.addEventListener(
                "click",
                function () {

                    const id =
                        card.dataset.id;

                    const name =
                        card.dataset.name;

                    const price =
                        Number(card.dataset.price) || 0;

                    const imageElement =
                        card.querySelector("img");

                    const image =
                        imageElement
                            ? imageElement.src
                            : "";

                    const quantity =
                        Number(qty.innerText) || 1;

                    const existing =
                        cart.find(function (item) {

                            return item.id === id;

                        });

                    if (existing) {

                        existing.quantity += quantity;

                    } else {

                        cart.push({

                            id: id,

                            name: name,

                            price: price,

                            image: image,

                            quantity: quantity
                        });
                    }

                    qty.innerText = "1";

                    updateCart();

                    showCustomAlert(
                        name + " added to cart"
                    );
                }
            );

        });
}


/* =========================================================
   UPDATE CART
========================================================= */

function updateCart() {

    let count = 0;

    cart.forEach(function (item) {

        count += item.quantity;

    });

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {

        cartCount.innerText = count;
    }

    showCart();
}


/* =========================================================
   SHOW CART
========================================================= */

function showCart() {

    const container =
        document.getElementById("cartItems");

    const empty =
        document.getElementById("emptyCart");

    const bottom =
        document.getElementById("cartBottom");

    if (!container || !empty || !bottom) {
        return;
    }

    container.innerHTML = "";

    if (cart.length === 0) {

        empty.style.display = "block";

        bottom.style.display = "none";

        return;
    }

    empty.style.display = "none";

    bottom.style.display = "block";

    let total = 0;

    cart.forEach(function (item, index) {

        const itemTotal =
            Number(item.price) *
            Number(item.quantity);

        total += itemTotal;

        const row =
            document.createElement("div");

        row.className = "cart-row";

        row.innerHTML = `

            <img
                src="${escapeHTML(item.image)}"
                alt="${escapeHTML(item.name)}"
            >

            <div class="cart-info">

                <strong>
                    ${escapeHTML(item.name)}
                </strong>

                <div>
                    ₹${Number(item.price).toFixed(2)}
                </div>

                <div class="cart-controls">

                    <button
                        type="button"
                        onclick="cartMinus(${index})"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        type="button"
                        onclick="cartPlus(${index})"
                    >
                        +
                    </button>

                </div>

                <div>
                    ₹${itemTotal.toFixed(2)}
                </div>

                <button
                    type="button"
                    class="remove"
                    onclick="removeCart(${index})"
                >
                    Remove
                </button>

            </div>
        `;

        container.appendChild(row);
    });

    const cartTotal =
        document.getElementById("cartTotal");

    if (cartTotal) {

        cartTotal.innerText =
            "₹" + total.toFixed(2);
    }
}


/* =========================================================
   CART PLUS
========================================================= */

function cartPlus(index) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity++;

    updateCart();
}


/* =========================================================
   CART MINUS
========================================================= */

function cartMinus(index) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity--;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);
    }

    updateCart();
}


/* =========================================================
   REMOVE CART
========================================================= */

function removeCart(index) {

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    updateCart();
}


/* =========================================================
   CART SETUP
========================================================= */

function setupCart() {

    const cartButton =
        document.getElementById("cartButton");

    if (cartButton) {

        cartButton.addEventListener(
            "click",
            function () {

                showCart();

                const cartModal =
                    document.getElementById("cartModal");

                if (cartModal) {

                    cartModal.style.display = "block";
                }
            }
        );
    }

    const closeCart =
        document.getElementById("closeCart");

    if (closeCart) {

        closeCart.addEventListener(
            "click",
            function () {

                const cartModal =
                    document.getElementById("cartModal");

                if (cartModal) {

                    cartModal.style.display = "none";
                }
            }
        );
    }
}


/* =========================================================
   ORDER BUTTON
========================================================= */

function setupOrderButton() {

    const orderButton =
        document.getElementById("orderButton");

    if (!orderButton) {
        return;
    }

    orderButton.addEventListener(
        "click",
        function () {

            if (cart.length === 0) {

                showCustomAlert(
                    "Cart is empty"
                );

                return;
            }

            showOrder();

            const cartModal =
                document.getElementById("cartModal");

            const orderModal =
                document.getElementById("orderModal");

            if (cartModal) {

                cartModal.style.display = "none";
            }

            if (orderModal) {

                orderModal.style.display = "block";
            }
        }
    );
}


/* =========================================================
   SHOW ORDER
========================================================= */

function showOrder() {

    const container =
        document.getElementById("orderItems");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    let total = 0;

    cart.forEach(function (item) {

        const itemTotal =
            Number(item.price) *
            Number(item.quantity);

        total += itemTotal;

        container.innerHTML += `

            <div class="order-line">

                <span>
                    ${escapeHTML(item.name)}
                    × ${item.quantity}
                </span>

                <strong>
                    ₹${itemTotal.toFixed(2)}
                </strong>

            </div>
        `;
    });

    const orderTotal =
        document.getElementById("orderTotal");

    if (orderTotal) {

        orderTotal.innerText =
            "₹" + total.toFixed(2);
    }
}


/* =========================================================
   SEND ORDER → EMAIL APP
========================================================= */

function setupSendOrder() {

    const sendOrder = document.getElementById("sendOrder");

    if (!sendOrder) {
        console.error("sendOrder button not found");
        return;
    }

    sendOrder.addEventListener("click", function () {

        const nameInput = document.getElementById("customerName");
        const mobileInput = document.getElementById("customerMobile");
        const addressInput = document.getElementById("customerAddress");

        const name = nameInput ? nameInput.value.trim() : "";
        const mobile = mobileInput ? mobileInput.value.trim() : "";
        const address = addressInput ? addressInput.value.trim() : "";

        /* =========================
           VALIDATION
        ========================= */

        if (name === "") {
            showCustomAlert("Enter your name");
            return;
        }

        /* Only exactly 10 digits */
        if (!/^\d{10}$/.test(mobile)) {
            showCustomAlert("Enter valid 10 digit mobile number");
            return;
        }

        if (address === "") {
            showCustomAlert("Enter your address");
            return;
        }

        if (cart.length === 0) {
            showCustomAlert("Cart is empty");
            return;
        }

        /* =========================
           CREATE ORDER EMAIL
        ========================= */

        let orderText = "NEW SHOP ORDER\n\n";

        orderText += "Customer Name: " + name + "\n";

        orderText += "Mobile: " + mobile + "\n";

        orderText +=
            "Delivery Address:\n" +
            address +
            "\n\n";

        orderText += "PRODUCTS\n";

        orderText += "----------------------\n";

        let total = 0;

        cart.forEach(function (item) {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);

            total += itemTotal;

            orderText +=
                item.name +
                " × " +
                item.quantity +
                " = ₹" +
                itemTotal.toFixed(2) +
                "\n";
        });

        orderText +=
            "\nTotal: ₹" +
            total.toFixed(2);

        /* =========================
           OPEN EMAIL APP
        ========================= */

        const subject = encodeURIComponent(
            "New Order - My Local Shop"
        );

        const body = encodeURIComponent(
            orderText
        );

        const mailtoURL =
            "mailto:" +
            SHOPKEEPER_EMAIL +
            "?subject=" +
            subject +
            "&body=" +
            body;

        console.log("Opening email app");

        /*
         * Open email application
         */
        window.location.href = mailtoURL;

        /*
         * Clear cart after sending/opening
         */
        cart = [];

        updateCart();

        /*
         * Clear customer details
         */
        if (nameInput) {
            nameInput.value = "";
        }

        if (mobileInput) {
            mobileInput.value = "";
        }

        if (addressInput) {
            addressInput.value = "";
        }

    });
}

/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        function () {

            applyCurrentSearch();
        }
    );
}


function applyCurrentSearch() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    const text =
        searchInput.value
            .toLowerCase()
            .trim();

    document
        .querySelectorAll(".product-card")
        .forEach(function (card) {

            const name =
                (
                    card.dataset.name || ""
                ).toLowerCase();

            card.style.display =
                name.includes(text)
                    ? "flex"
                    : "none";
        });
}


 

/* =========================================================
   GET SHOP LOCATION → MAP APP
========================================================= */

function setupLocation() {

    const locationButton =
        document.getElementById("locationButton");

    if (!locationButton) {
        console.error("locationButton not found");
        return;
    }

    locationButton.addEventListener("click", function () {

        const latitude = SHOP_LATITUDE;
        const longitude = SHOP_LONGITUDE;

        /*
         * Google Maps app URL
         */
        const mapsAppURL =
            "google.navigation:q=" +
            encodeURIComponent(
                latitude + "," + longitude
            );

        /*
         * Open Google Maps app
         */
        window.location.href = mapsAppURL;

    });

}

/* =========================================================
   CLOSE MODALS OUTSIDE
========================================================= */

function setupModalOutsideClick() {

    window.addEventListener(
        "click",
        function (event) {

            const cartModal =
                document.getElementById("cartModal");

            const orderModal =
                document.getElementById("orderModal");

            if (
                cartModal &&
                event.target === cartModal
            ) {

                cartModal.style.display = "none";
            }

            if (
                orderModal &&
                event.target === orderModal
            ) {

                orderModal.style.display = "none";
            }
        }
    );
}


/* =========================================================
   START WEBSITE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("SCRIPT JS LOADED");

        loadProducts();

        setupCart();

        setupOrderButton();

        setupSendOrder();

        setupCloseOrder();

        setupSearch();

        setupLocation();

        setupModalOutsideClick();

    }
);


/* =========================================================
   AUTO REFRESH PRODUCTS
========================================================= */

setInterval(
    function () {

        loadProducts();

    },
    30000
);
