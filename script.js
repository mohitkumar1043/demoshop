/* =========================================================
   SHOP CUSTOMER WEBSITE
   Product source: products.json
   Orders: Gmail/mail client
   ========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

// Your shop's real location
const SHOP_LATITUDE = "27.123456";
const SHOP_LONGITUDE = "75.123456";

// Shopkeeper Gmail address
// CHANGE THIS
const SHOPKEEPER_EMAIL = "yourshopkeeper@gmail.com";

// JSON file in the same GitHub repository
const PRODUCTS_JSON = "./products.json";


/* =========================================================
   CART
========================================================= */

let cart = [];


/* =========================================================
   CUSTOM ALERT
========================================================= */

function showCustomAlert(message) {

    const alertBox =
        document.getElementById("customAlert");

    const alertMessage =
        document.getElementById("customAlertMessage");

    if (!alertBox || !alertMessage) {
        return;
    }

    alertMessage.innerText = message;

    alertBox.style.display = "block";

    setTimeout(function () {

        alertBox.style.display = "none";

    }, 2000);
}


/* =========================================================
   LOAD PRODUCTS FROM products.json
========================================================= */

function loadProducts() {

    const container =
        document.getElementById("productList");

    if (!container) {
        console.error("productList not found");
        return;
    }

    container.innerHTML = `
        <div class="loading-products">
            Loading products...
        </div>
    `;


    /*
       Date.now() prevents the browser from
       showing an old cached products.json.
    */

    const url =
        PRODUCTS_JSON + "?v=" + Date.now();


    fetch(url)

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Unable to load products. HTTP status: " +
                    response.status
                );

            }

            return response.json();

        })

        .then(function (products) {

            console.log(
                "Products loaded:",
                products
            );

            displayProducts(products);

        })

        .catch(function (error) {

            console.error(
                "Product loading error:",
                error
            );

            container.innerHTML = `
                <div class="no-products">

                    Unable to load products.

                    <br><br>

                    Please try again later.

                </div>
            `;

        });
}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts(products) {

    const container =
        document.getElementById("productList");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!Array.isArray(products)) {

        console.error(
            "products.json must contain an array"
        );

        container.innerHTML = `
            <div class="no-products">
                Invalid product data.
            </div>
        `;

        return;
    }


    /*
       Show only available products.
    */

    const availableProducts =
        products.filter(function (product) {

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

        createProductCard(
            product,
            container
        );

    });


    initializeProducts();

    applyCurrentSearch();
}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product, container) {

    const card =
        document.createElement("div");


    card.className =
        "product-card";


    card.dataset.id =
        product.id || "";


    card.dataset.name =
        product.name || "";


    card.dataset.price =
        product.price || 0;


    /*
       Product image
    */

    let imageURL =
        product.imageURL || "";


    if (imageURL.trim() === "") {

        imageURL =
            "default-product.jpg";

    }


    /*
       Price
    */

    const price =
        Number(product.price) || 0;


    /*
       Discount
    */

    const discount =
        Number(product.discount) || 0;


    /*
       Calculate final price
    */

    let finalPrice =
        price;


    if (discount > 0) {

        finalPrice =
            price -
            (price * discount / 100);

    }


    /*
       Product description
    */

    const description =
        product.description || "";


    card.innerHTML = `

        <img
            src="${escapeHTML(imageURL)}"
            alt="${escapeHTML(product.name || "Product")}"
            onerror="this.src='default-product.jpg'"
        >


        <div class="product-info">

            <h3>
                ${escapeHTML(product.name || "Product")}
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
                                text-decoration:line-through;
                                color:#888;
                                font-size:13px;
                                margin-left:5px;
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


    /*
       Store final selling price.
    */

    card.dataset.price =
        finalPrice;


    container.appendChild(card);
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.innerText =
        value;

    return div.innerHTML;
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


            /*
               MINUS
            */

            minus.onclick =
                function () {

                    let value =
                        Number(qty.innerText);


                    if (value > 1) {

                        value--;

                    }


                    qty.innerText =
                        value;

                };


            /*
               PLUS
            */

            plus.onclick =
                function () {

                    let value =
                        Number(qty.innerText);


                    value++;


                    qty.innerText =
                        value;

                };


            /*
               ADD TO CART
            */

            const addButton =
                card.querySelector(".add-cart");


            addButton.onclick =
                function () {


                    const id =
                        card.dataset.id;


                    const name =
                        card.dataset.name;


                    const price =
                        Number(
                            card.dataset.price
                        );


                    const image =
                        card.querySelector(
                            "img"
                        ).src;


                    const quantity =
                        Number(
                            qty.innerText
                        );


                    /*
                       Check existing item
                    */

                    let existing =
                        cart.find(
                            function (item) {

                                return (
                                    item.id === id
                                );

                            }
                        );


                    if (existing) {

                        existing.quantity +=
                            quantity;

                    }

                    else {

                        cart.push({

                            id:
                                id,

                            name:
                                name,

                            price:
                                price,

                            image:
                                image,

                            quantity:
                                quantity

                        });

                    }


                    /*
                       Reset quantity
                    */

                    qty.innerText =
                        "1";


                    updateCart();


                    showCustomAlert(
                        name +
                        " added to cart"
                    );

                };

        });
}


/* =========================================================
   UPDATE CART
========================================================= */

function updateCart() {

    let count = 0;


    cart.forEach(function (item) {

        count +=
            item.quantity;

    });


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (cartCount) {

        cartCount.innerText =
            count;

    }


    showCart();
}


/* =========================================================
   SHOW CART
========================================================= */

function showCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    const empty =
        document.getElementById(
            "emptyCart"
        );


    const bottom =
        document.getElementById(
            "cartBottom"
        );


    if (
        !container ||
        !empty ||
        !bottom
    ) {

        return;
    }


    container.innerHTML = "";


    /*
       EMPTY CART
    */

    if (cart.length === 0) {

        empty.style.display =
            "block";


        bottom.style.display =
            "none";


        return;
    }


    empty.style.display =
        "none";


    bottom.style.display =
        "block";


    let total = 0;


    cart.forEach(
        function (item, index) {


            const itemTotal =
                item.price *
                item.quantity;


            total +=
                itemTotal;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "cart-row";


            row.innerHTML = `

                <img
                    src="${item.image}"
                    alt="${escapeHTML(item.name)}"
                >


                <div class="cart-info">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>


                    <div>
                        ₹${item.price.toFixed(2)}
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

        }
    );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (cartTotal) {

        cartTotal.innerText =
            "₹" +
            total.toFixed(2);

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


    if (
        cart[index].quantity <= 0
    ) {

        cart.splice(
            index,
            1
        );

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


    cart.splice(
        index,
        1
    );


    updateCart();
}


/* =========================================================
   OPEN CART
========================================================= */

const cartButton =
    document.getElementById(
        "cartButton"
    );


if (cartButton) {

    cartButton.onclick =
        function () {

            showCart();


            const cartModal =
                document.getElementById(
                    "cartModal"
                );


            if (cartModal) {

                cartModal.style.display =
                    "block";

            }

        };
}


/* =========================================================
   CLOSE CART
========================================================= */

const closeCart =
    document.getElementById(
        "closeCart"
    );


if (closeCart) {

    closeCart.onclick =
        function () {

            const cartModal =
                document.getElementById(
                    "cartModal"
                );


            if (cartModal) {

                cartModal.style.display =
                    "none";

            }

        };
}


/* =========================================================
   ORDER BUTTON
========================================================= */

const orderButton =
    document.getElementById(
        "orderButton"
    );


if (orderButton) {

    orderButton.onclick =
        function () {


            if (
                cart.length === 0
            ) {

                showCustomAlert(
                    "Cart is empty"
                );

                return;

            }


            showOrder();


            const cartModal =
                document.getElementById(
                    "cartModal"
                );


            const orderModal =
                document.getElementById(
                    "orderModal"
                );


            if (cartModal) {

                cartModal.style.display =
                    "none";

            }


            if (orderModal) {

                orderModal.style.display =
                    "block";

            }

        };
}


/* =========================================================
   SHOW ORDER
========================================================= */

function showOrder() {

    const container =
        document.getElementById(
            "orderItems"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    let total = 0;


    cart.forEach(function (item) {


        const price =
            item.price *
            item.quantity;


        total +=
            price;


        container.innerHTML += `

            <div class="order-line">

                <span>

                    ${escapeHTML(item.name)}

                    × ${item.quantity}

                </span>


                <strong>

                    ₹${price.toFixed(2)}

                </strong>

            </div>

        `;

    });


    const orderTotal =
        document.getElementById(
            "orderTotal"
        );


    if (orderTotal) {

        orderTotal.innerText =
            "₹" +
            total.toFixed(2);

    }
}


/* =========================================================
   CLOSE ORDER
========================================================= */

const closeOrder =
    document.getElementById(
        "closeOrder"
    );


if (closeOrder) {

    closeOrder.onclick =
        function () {

            const orderModal =
                document.getElementById(
                    "orderModal"
                );


            if (orderModal) {

                orderModal.style.display =
                    "none";

            }

        };
}


/* =========================================================
   SEND ORDER TO GMAIL
========================================================= */

const sendOrder =
    document.getElementById(
        "sendOrder"
    );


if (sendOrder) {

    sendOrder.onclick =
        function () {


            const nameInput =
                document.getElementById(
                    "customerName"
                );


            const mobileInput =
                document.getElementById(
                    "customerMobile"
                );



            const name =
                nameInput
                ? nameInput.value.trim()
                : "";


            const mobile =
                mobileInput
                ? mobileInput.value.trim()
                : "";


         const addressInput =
    document.getElementById("customerAddress");

const address =
    addressInput
        ? addressInput.value.trim()
        : "";


            /*
               VALIDATION
            */

            if (name === "") {

                showCustomAlert(
                    "Enter your name"
                );

                return;
            }


            if (mobile === "") {

                showCustomAlert(
                    "Enter mobile number"
                );

                return;
            }


            if (cart.length === 0) {

                showCustomAlert(
                    "Cart is empty"
                );

                return;
            }


            /*
               CREATE ORDER TEXT
            */

            let orderText =
                "NEW SHOP ORDER\n\n";


            orderText +=
                "Customer Name: " +
                name +
                "\n";


            orderText +=
                "Mobile: " +
                mobile +
                "\n\n";


            orderText +=
                "PRODUCTS\n";


            orderText +=
                "----------------------\n";


            let total = 0;


            cart.forEach(
                function (item) {

                    const itemTotal =
                        item.price *
                        item.quantity;


                    total +=
                        itemTotal;


                    orderText +=
                        item.name +
                        " × " +
                        item.quantity +
                        " = ₹" +
                        itemTotal.toFixed(2) +
                        "\n";

                }
            );


            orderText +=
                "\nTotal: ₹" +
                total.toFixed(2) +
                "\n";


            if (message !== "") {

                orderText +=
                    "\nCustomer Message:\n" +
                    message;

            }


            /*
               Gmail/mail client
            */

            const subject =
                encodeURIComponent(
                    "New Order - My Local Shop"
                );


            const body =
                encodeURIComponent(
                    orderText
                );


            const mailURL =
                "mailto:" +
                SHOPKEEPER_EMAIL +
                "?subject=" +
                subject +
                "&body=" +
                body;


            /*
               Open email application
            */

            window.location.href =
                mailURL;


            /*
               Do NOT immediately clear cart.
               Customer can return if email
               application was not opened.
            */

        };
}


/* =========================================================
   SEARCH
========================================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.oninput =
        function () {

            applyCurrentSearch();

        };
}


/* =========================================================
   APPLY SEARCH
========================================================= */

function applyCurrentSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    const text =
        searchInput.value
            .toLowerCase()
            .trim();


    document
        .querySelectorAll(
            ".product-card"
        )
        .forEach(
            function (card) {


                const name =
                    (
                        card.dataset.name ||
                        ""
                    )
                    .toLowerCase();


                if (
                    name.includes(text)
                ) {

                    card.style.display =
                        "flex";

                }

                else {

                    card.style.display =
                        "none";

                }

            }
        );
}


/* =========================================================
   GOOGLE MAP LOCATION
========================================================= */

const locationButton =
    document.getElementById(
        "locationButton"
    );


if (locationButton) {

    locationButton.onclick =
        function () {


            const url =
                "https://www.google.com/maps/dir/?api=1" +
                "&destination=" +
                encodeURIComponent(
                    SHOP_LATITUDE +
                    "," +
                    SHOP_LONGITUDE
                );


            window.open(
                url,
                "_blank"
            );

        };
}


/* =========================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================================= */

window.onclick =
    function (event) {


        const cartModal =
            document.getElementById(
                "cartModal"
            );


        const orderModal =
            document.getElementById(
                "orderModal"
            );


        if (
            event.target ===
            cartModal
        ) {

            cartModal.style.display =
                "none";

        }


        if (
            event.target ===
            orderModal
        ) {

            orderModal.style.display =
                "none";

        }

    };


/* =========================================================
   AUTO REFRESH PRODUCTS
========================================================= */

/*
   This checks products.json every 30 seconds.

   If the shopkeeper changes products.json,
   customers can receive the updated products
   without manually refreshing the page.
*/

setInterval(
    function () {

        loadProducts();

    },
    30000
);


/* =========================================================
   START WEBSITE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

    }
);
