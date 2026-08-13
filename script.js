let cart = [];

const PRODUCTS_URL =
    "products.json";


/* =========================
   CUSTOM ALERT
========================= */

function showCustomAlert(message) {

    const box =
        document.getElementById("customAlert");

    const text =
        document.getElementById(
            "customAlertMessage"
        );

    text.innerText = message;

    box.style.display = "block";

    setTimeout(() => {

        box.style.display = "none";

    }, 2000);
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    const container =
        document.getElementById(
            "productList"
        );

    try {

        const response =
            await fetch(
                PRODUCTS_URL +
                "?t=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Products could not be loaded"
            );

        }

        const products =
            await response.json();

        displayProducts(products);

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="no-products">

                Unable to load products.

            </div>

        `;

    }
}


/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts(products) {

    const container =
        document.getElementById(
            "productList"
        );

    container.innerHTML = "";

    const available =
        products.filter(
            product =>
                product.available === true
        );


    if (available.length === 0) {

        container.innerHTML = `

            <div class="no-products">

                No products available.

            </div>

        `;

        return;
    }


    available.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "product-card";

        card.dataset.name =
            product.name;

        card.dataset.price =
            product.price;

        card.dataset.id =
            product.id;


        let image =
            product.imageURL;

        if (!image) {

            image =
                "default-product.jpg";

        }


        card.innerHTML = `

            <img
                src="${image}"
                alt="${product.name}"
                onerror="
                    this.src='default-product.jpg'
                "
            >

            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>

                <div class="description">
                    ${product.description || ""}
                </div>

                <div class="price">
                    ₹${product.price}
                </div>

                ${
                    Number(product.discount) > 0
                    ?
                    `
                    <div class="discount">
                        ${product.discount}% OFF
                    </div>
                    `
                    :
                    ""
                }

                <div class="actions">

                    <div class="quantity">

                        <button
                            class="minus"
                            type="button">
                            −
                        </button>

                        <span class="qty">
                            1
                        </span>

                        <button
                            class="plus"
                            type="button">
                            +
                        </button>

                    </div>

                    <button
                        class="add-cart"
                        type="button">

                        Add to Cart

                    </button>

                </div>

            </div>

        `;


        container.appendChild(card);

    });


    initializeProductButtons();

    applySearch();
}


/* =========================
   PRODUCT BUTTONS
========================= */

function initializeProductButtons() {

    document
        .querySelectorAll(".product-card")
        .forEach(card => {

            const minus =
                card.querySelector(".minus");

            const plus =
                card.querySelector(".plus");

            const qty =
                card.querySelector(".qty");


            minus.onclick = () => {

                let value =
                    Number(qty.innerText);

                if (value > 1) {

                    value--;

                }

                qty.innerText = value;

            };


            plus.onclick = () => {

                let value =
                    Number(qty.innerText);

                value++;

                qty.innerText = value;

            };


            card
                .querySelector(".add-cart")
                .onclick = () => {

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


                    const existing =
                        cart.find(
                            item =>
                                item.name === name
                        );


                    if (existing) {

                        existing.quantity +=
                            quantity;

                    }

                    else {

                        cart.push({

                            name,
                            price,
                            image,
                            quantity

                        });

                    }


                    qty.innerText = "1";

                    updateCart();

                    showCustomAlert(
                        name +
                        " added to cart"
                    );

                };

        });

}


/* =========================
   CART
========================= */

function updateCart() {

    let count = 0;

    cart.forEach(item => {

        count += item.quantity;

    });

    document.getElementById(
        "cartCount"
    ).innerText = count;

    showCart();
}


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


    container.innerHTML = "";


    if (cart.length === 0) {

        empty.style.display = "block";

        bottom.style.display = "none";

        return;

    }


    empty.style.display = "none";

    bottom.style.display = "block";


    let total = 0;


    cart.forEach((item, index) => {

        total +=
            item.price *
            item.quantity;


        const row =
            document.createElement("div");

        row.className =
            "cart-row";


        row.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >

            <div class="cart-info">

                <strong>
                    ${item.name}
                </strong>

                <div>
                    ₹${item.price}
                </div>

                <div class="cart-controls">

                    <button
                        onclick="
                            cartMinus(${index})
                        "
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="
                            cartPlus(${index})
                        "
                    >
                        +
                    </button>

                </div>

                <button
                    class="remove"
                    onclick="
                        removeCart(${index})
                    "
                >
                    Remove
                </button>

            </div>

        `;

        container.appendChild(row);

    });


    document.getElementById(
        "cartTotal"
    ).innerText =
        "₹" + total;

}


function cartPlus(index) {

    if (!cart[index]) return;

    cart[index].quantity++;

    updateCart();
}


function cartMinus(index) {

    if (!cart[index]) return;

    cart[index].quantity--;

    if (
        cart[index].quantity <= 0
    ) {

        cart.splice(index, 1);

    }

    updateCart();
}


function removeCart(index) {

    cart.splice(index, 1);

    updateCart();
}


/* =========================
   CART MODAL
========================= */

document.getElementById(
    "cartButton"
).onclick = () => {

    showCart();

    document.getElementById(
        "cartModal"
    ).style.display = "block";

};


document.getElementById(
    "closeCart"
).onclick = () => {

    document.getElementById(
        "cartModal"
    ).style.display = "none";

};


/* =========================
   ORDER
========================= */

document.getElementById(
    "orderButton"
).onclick = () => {

    if (cart.length === 0) {

        showCustomAlert(
            "Cart is empty"
        );

        return;

    }

    showOrder();

    document.getElementById(
        "cartModal"
    ).style.display = "none";

    document.getElementById(
        "orderModal"
    ).style.display = "block";

};


function showOrder() {

    const container =
        document.getElementById(
            "orderItems"
        );

    container.innerHTML = "";

    let total = 0;


    cart.forEach(item => {

        const price =
            item.price *
            item.quantity;

        total += price;


        container.innerHTML += `

            <div class="order-line">

                <span>
                    ${item.name}
                    × ${item.quantity}
                </span>

                <strong>
                    ₹${price}
                </strong>

            </div>

        `;

    });


    document.getElementById(
        "orderTotal"
    ).innerText =
        "₹" + total;

}


document.getElementById(
    "closeOrder"
).onclick = () => {

    document.getElementById(
        "orderModal"
    ).style.display = "none";

};


/* =========================
   SEND ORDER
========================= */

document.getElementById(
    "sendOrder"
).onclick = () => {

    const name =
        document.getElementById(
            "customerName"
        ).value.trim();

    const mobile =
        document.getElementById(
            "customerMobile"
        ).value.trim();

    const message =
        document.getElementById(
            "customerMessage"
        ).value.trim();


    if (!name) {

        showCustomAlert(
            "Enter your name"
        );

        return;

    }


    if (!mobile) {

        showCustomAlert(
            "Enter mobile number"
        );

        return;

    }


    /*
       TEMPORARY ORDER TEST.

       Connect your Gmail sending
       method here later.
    */

    console.log({

        customer: name,

        mobile,

        message,

        products: cart

    });


    showCustomAlert(
        "Order submitted successfully!"
    );


    cart = [];

    updateCart();

    document.getElementById(
        "orderModal"
    ).style.display = "none";

};


/* =========================
   SEARCH
========================= */

document.getElementById(
    "searchInput"
).oninput = applySearch;


function applySearch() {

    const text =
        document.getElementById(
            "searchInput"
        ).value
        .toLowerCase()
        .trim();


    document
        .querySelectorAll(
            ".product-card"
        )
        .forEach(card => {

            const name =
                card.dataset.name
                .toLowerCase();


            card.style.display =
                name.includes(text)
                ? "flex"
                : "none";

        });

}


/* =========================
   GOOGLE MAP
========================= */

document.getElementById(
    "locationButton"
).onclick = () => {

    const latitude =
        "27.123456";

    const longitude =
        "75.123456";


    const url =
        "https://www.google.com/maps/dir/?api=1" +
        "&destination=" +
        latitude +
        "," +
        longitude;


    window.open(
        url,
        "_blank"
    );

};


/* =========================
   AUTO UPDATE
========================= */

loadProducts();

setInterval(
    loadProducts,
    10000
);
