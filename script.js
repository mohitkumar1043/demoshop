
/* =========================================================
   SHOP CUSTOMER WEBSITE

   Products: products.json
   Order: Email App
   Location: Google Maps
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const SHOP_LATITUDE = "27.842087";

const SHOP_LONGITUDE = "75.264468";

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

    const alertBox =
        document.getElementById("customAlert");

    const alertMessage =
        document.getElementById("customAlertMessage");


    if (!alertBox || !alertMessage) {

        alert(message);

        return;
    }


    alertMessage.innerText =
        message;


    alertBox.style.display =
        "block";


    setTimeout(function () {

        alertBox.style.display =
            "none";

    }, 2000);
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value ?? "");


    return div.innerHTML;
}


/* =========================================================
   IMAGE URL
========================================================= */

function getImageURL(product) {

    let url = "";


    if (typeof product === "string") {

        url =
            product.trim();

    }
    else {

        url =
            String(
                product?.imageURL ??
                product?.imageUrl ??
                product?.image ??
                ""
            ).trim();

    }


    if (!url) {

        return "./default-product.jpg";
    }


    /*
       Google Drive FILE URL
    */

    let match =
        url.match(
            /drive\.google\.com\/file\/d\/([^/?]+)/
        );


    if (match && match[1]) {

        const fileId =
            match[1];


        return (
            "https://drive.google.com/thumbnail?id=" +
            encodeURIComponent(fileId) +
            "&sz=w1000"
        );
    }


    /*
       Google Drive OPEN URL
    */

    match =
        url.match(
            /drive\.google\.com\/open\?id=([^&]+)/
        );


    if (match && match[1]) {

        const fileId =
            match[1];


        return (
            "https://drive.google.com/thumbnail?id=" +
            encodeURIComponent(fileId) +
            "&sz=w1000"
        );
    }


    /*
       Google Drive UC URL
    */

    match =
        url.match(
            /drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&#]+)/
        );


    if (match && match[1]) {

        const fileId =
            match[1];


        return (
            "https://drive.google.com/thumbnail?id=" +
            encodeURIComponent(fileId) +
            "&sz=w1000"
        );
    }


    /*
       Already thumbnail URL
    */

    if (
        url.includes(
            "drive.google.com/thumbnail"
        )
    ) {

        return url;
    }


    /*
       Other Google Drive URLs
    */

    if (
        url.includes(
            "drive.google.com"
        )
    ) {

        match =
            url.match(
                /\/d\/([^/?]+)/
            );


        if (match && match[1]) {

            const fileId =
                match[1];


            return (
                "https://drive.google.com/thumbnail?id=" +
                encodeURIComponent(fileId) +
                "&sz=w1000"
            );
        }
    }


    /*
       Normal image URL
    */

    return url;
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

function loadProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    if (!container) {

        console.error(
            "productList not found"
        );

        return;
    }


    container.innerHTML = `
        <div class="loading-products">
            Loading products...
        </div>
    `;


    const url =
        PRODUCTS_JSON +
        "?v=" +
        Date.now();


    fetch(
        url,
        {
            method: "GET",
            cache: "no-store"
        }
    )

    .then(function (response) {

        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );
        }


        return response.text();

    })

    .then(function (text) {

        if (!text.trim()) {

            throw new Error(
                "products.json is empty."
            );
        }


        let products;


        try {

            products =
                JSON.parse(text);

        }
        catch (error) {

            console.error(
                "JSON PARSE ERROR:",
                error
            );


            throw new Error(
                "Invalid products.json format."
            );
        }


        /*
           Support:

           [
              {...},
              {...}
           ]

           OR:

           {
              "products": [...]
           }
        */

        if (!Array.isArray(products)) {

            if (
                products &&
                Array.isArray(
                    products.products
                )
            ) {

                products =
                    products.products;

            }
            else {

                throw new Error(
                    "products.json must contain a product array."
                );
            }
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

                <h3>
                    Unable to load products
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>
        `;

    });
}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts(products) {

    const container =
        document.getElementById(
            "productList"
        );


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    /*
       Available products
    */

    const availableProducts =
        products.filter(
            function (product) {

                if (!product) {

                    return false;
                }


                return (
                    product.available === true ||

                    String(
                        product.available ?? ""
                    )
                    .trim()
                    .toUpperCase() ===
                    "YES" ||

                    String(
                        product.available ?? ""
                    )
                    .trim()
                    .toLowerCase() ===
                    "true"
                );

            }
        );
availableProducts.reverse();

    if (
        availableProducts.length === 0
    ) {

        container.innerHTML = `
            <div class="no-products">
                No products available.
            </div>
        `;

        return;
    }


    availableProducts.forEach(
        function (product) {

            createProductCard(
                product,
                container
            );

        }
    );


    /*
       Product buttons
    */

    initializeProducts();


    /*
       Product click popup

       IMPORTANT:
       This is called AFTER
       product cards are created.
    */

    setupProductClickPopup();


    applyCurrentSearch();
}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(
    product,
    container
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "product-card";


    /*
       PRODUCT ID

       IMPORTANT:

       We use dataset.id
       everywhere.
    */

    card.dataset.id =
        String(
            product.id ??
            ""
        );


    /*
       PRODUCT NAME
    */

    card.dataset.name =
        String(
            product.name ??
            ""
        );


    /*
       PRICE
    */

    const price =
        Number(
            product.price
        ) || 0;


    /*
       DISCOUNT
    */

    const discount =
        Number(
            product.discount
        ) || 0;


    /*
       FINAL PRICE
    */

    let finalPrice =
        price;


    if (
        discount > 0 &&
        discount <= 100
    ) {

        finalPrice =
            price -
            (
                price *
                discount /
                100
            );
    }


    /*
       IMAGE
    */

    const imageURL =
        getImageURL(product);


    const name =
        String(
            product.name ??
            "Product"
        );


    const description =
        String(
            product.description ??
            ""
        );


    /*
       Save final price
    */

    card.dataset.price =
        String(
            finalPrice
        );


    /*
       PRODUCT HTML
    */

    card.innerHTML = `

        <div class="product-image-box">

            <img
                class="product-image"
                src="${escapeHTML(imageURL)}"
                alt="${escapeHTML(name)}"
                loading="lazy"
            >

        </div>


        <div class="product-info">

            <h3>
                ${escapeHTML(name)}
            </h3>


            <p class="description">
                ${escapeHTML(description)}
            </p>


            <div class="price">

                ₹${finalPrice.toFixed(2)}

                ${
                    discount > 0
                    ? `
                        <span class="old-price">
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
       IMAGE ERROR
    */

    const image =
        card.querySelector(
            ".product-image"
        );


    if (image) {

        image.addEventListener(
            "error",
            function () {

                if (
                    image.dataset.fallback ===
                    "true"
                ) {

                    return;
                }


                image.dataset.fallback =
                    "true";


                image.src =
                    "./default-product.jpg";

            }
        );
    }


    container.appendChild(
        card
    );
}


/* =========================================================
   INITIALIZE PRODUCT BUTTONS
========================================================= */

function initializeProducts() {

    document
        .querySelectorAll(
            "#productList .product-card"
        )
        .forEach(
            function (card) {

                const minus =
                    card.querySelector(
                        ".minus"
                    );


                const plus =
                    card.querySelector(
                        ".plus"
                    );


                const qty =
                    card.querySelector(
                        ".qty"
                    );


                const addButton =
                    card.querySelector(
                        ".add-cart"
                    );


                if (
                    !minus ||
                    !plus ||
                    !qty ||
                    !addButton
                ) {

                    return;
                }


                /*
                   MINUS
                */

                minus.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        let value =
                            Number(
                                qty.innerText
                            ) || 1;


                        if (
                            value > 1
                        ) {

                            value--;
                        }


                        qty.innerText =
                            value;

                    }
                );


                /*
                   PLUS
                */

                plus.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        let value =
                            Number(
                                qty.innerText
                            ) || 1;


                        value++;


                        qty.innerText =
                            value;

                    }
                );


                /*
                   ADD TO CART
                */

                addButton.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        const id =
                            card.dataset.id;


                        const name =
                            card.dataset.name;


                        const price =
                            Number(
                                card.dataset.price
                            ) || 0;


                        const imageElement =
                            card.querySelector(
                                ".product-image"
                            );


                        const image =
                            imageElement
                            ? imageElement.src
                            : "./default-product.jpg";


                        const quantity =
                            Number(
                                qty.innerText
                            ) || 1;


                        const existing =
                            cart.find(
                                function (item) {

                                    return (
                                        String(item.id) ===
                                        String(id)
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


                        qty.innerText =
                            "1";


                        updateCart();


                        showCustomAlert(
                            name +
                            " added to cart"
                        );

                    }
                );

            }
        );
}


/* =========================================================
   PRODUCT CLICK POPUP
========================================================= */

function setupProductClickPopup() {

    const productList =
        document.getElementById(
            "productList"
        );


    const modal =
        document.getElementById(
            "productModal"
        );


    const modalContent =
        document.getElementById(
            "productModalContent"
        );


    const closeButton =
        document.getElementById(
            "closeProductModal"
        );


    if (
        !productList ||
        !modal ||
        !modalContent ||
        !closeButton
    ) {

        console.error(
            "Product popup elements not found."
        );

        return;
    }


    /*
       Prevent adding multiple
       click listeners after
       auto refresh.
    */

    if (
        productList.dataset.popupReady ===
        "true"
    ) {

        return;
    }


    productList.dataset.popupReady =
        "true";


    /*
       CLICK PRODUCT
    */

    productList.addEventListener(
        "click",
        function (event) {

            /*
               Do not open popup when
               customer clicks action buttons.
            */

            if (
                event.target.closest(
                    ".actions"
                )
            ) {

                return;
            }


            const card =
                event.target.closest(
                    ".product-card"
                );


            if (!card) {

                return;
            }


            /*
               IMPORTANT:

               createProductCard()
               stores product ID as:

               card.dataset.id
            */

            const productId =
                card.dataset.id;


            if (!productId) {

                console.error(
                    "Product ID missing."
                );

                return;
            }


            /*
               Clone same product card
            */

            const clonedCard =
                card.cloneNode(true);


            clonedCard.id =
                "popupProductCard";


            /*
               Popup should not itself
               behave like a clickable
               product.
            */

            clonedCard.style.cursor =
                "default";


            /*
               Put cloned product
               inside popup
            */

            modalContent.innerHTML =
                "";


            modalContent.appendChild(
                clonedCard
            );


            /*
               Show popup
            */

            modal.style.display =
                "block";


            /*
               Setup popup buttons
            */

            setupPopupCartButton(
                clonedCard
            );

        }
    );


    /*
       CLOSE BUTTON
    */

    closeButton.addEventListener(
        "click",
        function () {

            closeProductPopup();

        }
    );


    /*
       CLICK OUTSIDE
    */

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                closeProductPopup();

            }

        }
    );


    /*
       ESC KEY
    */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                if (
                    modal.style.display ===
                    "block"
                ) {

                    closeProductPopup();

                }

            }

        }
    );

}


/* =========================================================
   CLOSE PRODUCT POPUP
========================================================= */

function closeProductPopup() {

    const modal =
        document.getElementById(
            "productModal"
        );


    const modalContent =
        document.getElementById(
            "productModalContent"
        );


    if (modal) {

        modal.style.display =
            "none";
    }


    if (modalContent) {

        modalContent.innerHTML =
            "";
    }
}


/* =========================================================
   POPUP CART BUTTON
========================================================= */

function setupPopupCartButton(card) {

    const minus =
        card.querySelector(
            ".minus"
        );


    const plus =
        card.querySelector(
            ".plus"
        );


    const qty =
        card.querySelector(
            ".qty"
        );


    const addButton =
        card.querySelector(
            ".add-cart"
        );


    if (
        !minus ||
        !plus ||
        !qty ||
        !addButton
    ) {

        return;
    }


    /*
       PLUS
    */

    plus.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            let value =
                Number(
                    qty.innerText
                ) || 1;


            value++;


            qty.innerText =
                value;

        }
    );


    /*
       MINUS
    */

    minus.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            let value =
                Number(
                    qty.innerText
                ) || 1;


            if (
                value > 1
            ) {

                value--;
            }


            qty.innerText =
                value;

        }
    );


    /*
       ADD TO CART
    */

    addButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const id =
                card.dataset.id;


            const name =
                card.dataset.name;


            const price =
                Number(
                    card.dataset.price
                ) || 0;


            const imageElement =
                card.querySelector(
                    ".product-image"
                );


            const image =
                imageElement
                ? imageElement.src
                : "./default-product.jpg";


            const quantity =
                Number(
                    qty.innerText
                ) || 1;


            if (!id) {

                showCustomAlert(
                    "Product ID missing"
                );

                return;
            }


            const existing =
                cart.find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(id)
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


            qty.innerText =
                "1";


            updateCart();


            showCustomAlert(
                name +
                " added to cart"
            );


            /*
               Close product popup
            */

            closeProductPopup();

        }
    );

}


/* =========================================================
   UPDATE CART
========================================================= */

function updateCart() {

    let count = 0;


    cart.forEach(
        function (item) {

            count +=
                Number(
                    item.quantity
                ) || 0;

        }
    );


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


    container.innerHTML =
        "";


    if (
        cart.length === 0
    ) {

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
                Number(item.price) *
                Number(item.quantity);


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
                    src="${escapeHTML(
                        item.image
                    )}"
                    alt="${escapeHTML(
                        item.name
                    )}"
                    onerror="
                        this.onerror=null;
                        this.src='./default-product.jpg';
                    "
                >


                <div class="cart-info">

                    <strong>
                        ${escapeHTML(
                            item.name
                        )}
                    </strong>


                    <div>
                        ₹${Number(
                            item.price
                        ).toFixed(2)}
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


            container.appendChild(
                row
            );

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
   CART SETUP
========================================================= */

function setupCart() {

    const cartButton =
        document.getElementById(
            "cartButton"
        );


    if (cartButton) {

        cartButton.addEventListener(
            "click",
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

            }
        );
    }


    const closeCart =
        document.getElementById(
            "closeCart"
        );


    if (closeCart) {

        closeCart.addEventListener(
            "click",
            function () {

                const cartModal =
                    document.getElementById(
                        "cartModal"
                    );


                if (cartModal) {

                    cartModal.style.display =
                        "none";
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
        document.getElementById(
            "orderButton"
        );


    if (!orderButton) {

        return;
    }


    orderButton.addEventListener(
        "click",
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

        }
    );
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


    container.innerHTML =
        "";


    let total = 0;


    cart.forEach(
        function (item) {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            total +=
                itemTotal;


            container.innerHTML += `

                <div class="order-line">

                    <span>

                        ${escapeHTML(
                            item.name
                        )}

                        × ${item.quantity}

                    </span>


                    <strong>

                        ₹${itemTotal.toFixed(2)}

                    </strong>

                </div>

            `;

        }
    );


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
   SEND ORDER
========================================================= */

function setupSendOrder() {

    const sendOrder =
        document.getElementById(
            "sendOrder"
        );


    if (!sendOrder) {

        return;
    }


    sendOrder.addEventListener(
        "click",
        function () {

            const nameInput =
                document.getElementById(
                    "customerName"
                );


            const mobileInput =
                document.getElementById(
                    "customerMobile"
                );


            const addressInput =
                document.getElementById(
                    "customerAddress"
                );


            const name =
                nameInput
                ? nameInput.value.trim()
                : "";


            const mobile =
                mobileInput
                ? mobileInput.value.trim()
                : "";


            const address =
                addressInput
                ? addressInput.value.trim()
                : "";


            if (!name) {

                showCustomAlert(
                    "Enter your name"
                );

                return;
            }


            if (
                !/^\d{10}$/.test(
                    mobile
                )
            ) {

                showCustomAlert(
                    "Enter valid 10 digit mobile number"
                );

                return;
            }


            if (!address) {

                showCustomAlert(
                    "Enter your address"
                );

                return;
            }


            if (
                cart.length === 0
            ) {

                showCustomAlert(
                    "Cart is empty"
                );

                return;
            }


            let orderText =
                "NEW SHOP ORDER\n\n";


            orderText +=
                "Customer Name: " +
                name +
                "\n";


            orderText +=
                "Mobile: " +
                mobile +
                "\n";


            orderText +=
                "Delivery Address:\n" +
                address +
                "\n\n";


            orderText +=
                "PRODUCTS\n";


            orderText +=
                "----------------------\n";


            let total = 0;


            cart.forEach(
                function (item) {

                    const itemTotal =
                        Number(item.price) *
                        Number(item.quantity);


                    total +=
                        itemTotal;


                    orderText +=
                        "Product ID: " +
                        item.id +
                        "\n" +

                        "Product: " +
                        item.name +
                        "\n" +

                        "Quantity: " +
                        item.quantity +
                        "\n" +

                        "Price: ₹" +
                        Number(
                            item.price
                        ).toFixed(2) +
                        "\n" +

                        "Item Total: ₹" +
                        itemTotal.toFixed(2) +
                        "\n\n";

                }
            );


            orderText +=
                "Total: ₹" +
                total.toFixed(2);


            const subject =
                encodeURIComponent(
                    "New Order - My Local Shop"
                );


            const body =
                encodeURIComponent(
                    orderText
                );


            const mailtoURL =
                "mailto:" +
                SHOPKEEPER_EMAIL +
                "?subject=" +
                subject +
                "&body=" +
                body;


            window.location.href =
                mailtoURL;


            /*
               Clear cart
            */

            cart = [];


            updateCart();


            if (nameInput) {

                nameInput.value =
                    "";
            }


            if (mobileInput) {

                mobileInput.value =
                    "";
            }


            if (addressInput) {

                addressInput.value =
                    "";
            }

        }
    );
}


/* =========================================================
   CLOSE ORDER
========================================================= */

function setupCloseOrder() {

    const closeOrder =
        document.getElementById(
            "closeOrder"
        );


    if (!closeOrder) {

        return;
    }


    closeOrder.addEventListener(
        "click",
        function () {

            const orderModal =
                document.getElementById(
                    "orderModal"
                );


            if (orderModal) {

                orderModal.style.display =
                    "none";
            }

        }
    );
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


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
            "#productList .product-card"
        )
        .forEach(
            function (card) {

                const name =
                    (
                        card.dataset.name ||
                        ""
                    )
                    .toLowerCase();


                card.style.display =
                    name.includes(text)
                    ? "flex"
                    : "none";

            }
        );
}


/* =========================================================
   GOOGLE MAPS
========================================================= */

function setupLocation() {

    const button =
        document.getElementById(
            "locationButton"
        );


    if (!button) {

        return;
    }


    button.addEventListener(
        "click",
        function () {

            if (
                !SHOP_LATITUDE ||
                !SHOP_LONGITUDE
            ) {

                showCustomAlert(
                    "Shop location is missing"
                );

                return;
            }


            const googleMapsURL =
                "https://www.google.com/maps/dir/?api=1" +
                "&destination=" +
                encodeURIComponent(
                    SHOP_LATITUDE +
                    "," +
                    SHOP_LONGITUDE
                );


            window.location.href =
                googleMapsURL;

        }
    );
}


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

function setupModalOutsideClick() {

    window.addEventListener(
        "click",
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
                cartModal &&
                event.target ===
                cartModal
            ) {

                cartModal.style.display =
                    "none";
            }


            if (
                orderModal &&
                event.target ===
                orderModal
            ) {

                orderModal.style.display =
                    "none";
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

        console.log(
            "CUSTOMER SCRIPT LOADED"
        );


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
   AUTO REFRESH
========================================================= */

setInterval(
    function () {

        /*
           Don't reload products while
           product popup is open.
        */

        const productModal =
            document.getElementById(
                "productModal"
            );


        if (
            productModal &&
            productModal.style.display ===
            "block"
        ) {

            return;
        }


        loadProducts();

    },
    30000
);


