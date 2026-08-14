
/* =========================================================
   SHOPKEEPER DASHBOARD
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const WORKER_URL =
    "https://my-demo-shop-api.mohitsaini12943.workers.dev";

const PRODUCTS_URL =
    "products.json";


/* =========================================================
   DATA
========================================================= */

let products = [];

let editingId = null;


/* =========================================================
   TOKEN
========================================================= */

function getToken() {

    return sessionStorage.getItem(
        "shopkeeperToken"
    );

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function checkLogin() {

    const token =
        getToken();

    if (!token) {

        window.location.href =
            "shopkeeper-login.html";

        return false;

    }

    return true;

}


/* =========================================================
   ALERT
========================================================= */

function showAlert(message) {

    const box =
        document.getElementById(
            "adminAlert"
        );

    if (!box) {

        alert(message);

        return;

    }

    box.innerText =
        message;

    box.style.display =
        "block";


    setTimeout(
        function() {

            box.style.display =
                "none";

        },
        2500
    );

}


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        function() {

            sessionStorage.removeItem(
                "shopkeeperToken"
            );

            window.location.href =
                "shopkeeper-login.html";

        }
    );


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    if (!checkLogin()) {
        return;
    }


    try {

        showAlert(
            "Loading products..."
        );


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
                "products.json HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "products.json must contain an array."
            );

        }


        products =
            data;


        displayProducts();


        showAlert(
            "Products loaded"
        );

    }
    catch(error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        document
            .getElementById(
                "adminProductList"
            )
            .innerHTML =
                "<p>Unable to load products.</p>" +
                "<p>" +
                error.message +
                "</p>";

    }

}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts() {

    const container =
        document.getElementById(
            "adminProductList"
        );


    const count =
        document.getElementById(
            "productCount"
        );


    count.innerText =
        products.length;


    container.innerHTML =
        "";


    if (products.length === 0) {

        container.innerHTML =
            "<p>No products available.</p>";

        return;

    }


    products
        .sort(
            (a, b) =>
                Number(a.id) -
                Number(b.id)
        )
        .forEach(
            function(product) {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "admin-product";


                const image =
                    product.imageURL ||
                    "default-product.jpg";


                const available =
                    product.available === true ||
                    String(product.available)
                        .toUpperCase() ===
                    "YES";


                div.innerHTML = `

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(product.name)}"
                        onerror="
                            this.src='default-product.jpg'
                        "
                    >

                    <div class="admin-product-info">

                        <div class="product-id">
                            Product ID: ${escapeHTML(product.id)}
                        </div>

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                product.description || ""
                            )}
                        </p>

                        <p>
                            Price:
                            ₹${Number(
                                product.price || 0
                            ).toFixed(2)}
                        </p>

                        <p>
                            Discount:
                            ${Number(
                                product.discount || 0
                            )}%
                        </p>

                        <p class="product-status">
                            ${
                                available
                                ? "✅ Available"
                                : "❌ Not Available"
                            }
                        </p>

                        <div class="admin-actions">

                            <button
                                class="edit-button"
                                data-id="${product.id}"
                            >
                                ✏️ Edit
                            </button>

                            <button
                                class="delete-button"
                                data-id="${product.id}"
                            >
                                🗑 Delete
                            </button>

                        </div>

                    </div>

                `;


                div
                    .querySelector(".edit-button")
                    .addEventListener(
                        "click",
                        function() {

                            editProduct(
                                product.id
                            );

                        }
                    );


                div
                    .querySelector(".delete-button")
                    .addEventListener(
                        "click",
                        function() {

                            deleteProduct(
                                product.id
                            );

                        }
                    );


                container.appendChild(div);

            }
        );

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
   ADD / UPDATE PRODUCT
========================================================= */

document
    .getElementById("productForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!checkLogin()) {
                return;
            }


            const product = {

                name:
                    document
                        .getElementById(
                            "productName"
                        )
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "productDescription"
                        )
                        .value
                        .trim(),

                price:
                    Number(
                        document
                            .getElementById(
                                "productPrice"
                            )
                            .value
                    ),

                discount:
                    Number(
                        document
                            .getElementById(
                                "productDiscount"
                            )
                            .value
                    ),

                imageURL:
                    document
                        .getElementById(
                            "productImage"
                        )
                        .value
                        .trim(),

                available:
                    document
                        .getElementById(
                            "productAvailable"
                        )
                        .checked

            };


            if (!product.name) {

                showAlert(
                    "Enter product name."
                );

                return;

            }


            if (
                !Number.isFinite(product.price) ||
                product.price < 0
            ) {

                showAlert(
                    "Enter valid price."
                );

                return;

            }


            if (
                !Number.isFinite(product.discount) ||
                product.discount < 0 ||
                product.discount > 100
            ) {

                showAlert(
                    "Discount must be 0-100."
                );

                return;

            }


            let newProducts;


            if (editingId === null) {

                /* ADD */

                newProducts =
                    [
                        ...products,
                        product
                    ];

            }
            else {

                /* UPDATE */

                newProducts =
                    products.map(
                        function(item) {

                            if (
                                String(item.id) ===
                                String(editingId)
                            ) {

                                return {
                                    ...item,
                                    ...product,
                                    id: item.id
                                };

                            }

                            return item;

                        }
                    );

            }


            await saveProducts(
                newProducts
            );

        }
    );


/* =========================================================
   SAVE PRODUCTS TO WORKER
========================================================= */

async function saveProducts(
    newProducts
) {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "shopkeeper-login.html";

        return;

    }


    try {

        showAlert(
            "Saving products..."
        );


        const response =
            await fetch(
                WORKER_URL +
                "/products",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token

                    },

                    body:
                        JSON.stringify({

                            products:
                                newProducts

                        })

                }
            );


        const result =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            sessionStorage.removeItem(
                "shopkeeperToken"
            );

            window.location.href =
                "shopkeeper-login.html";

            return;

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to save products."
            );

        }


        /*
           Worker returns final products
           with permanent IDs.
        */

        if (
            Array.isArray(
                result.products
            )
        ) {

            products =
                result.products;

        }


        displayProducts();

        resetForm();


        showAlert(
            "Products saved successfully."
        );

    }
    catch(error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        showAlert(
            error.message ||
            "Unable to save products."
        );

    }

}


/* =========================================================
   EDIT
========================================================= */

function editProduct(id) {

    const product =
        products.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!product) {

        showAlert(
            "Product not found."
        );

        return;

    }


    editingId =
        product.id;


    document
        .getElementById("formTitle")
        .innerText =
            "Update Product";


    document
        .getElementById("productId")
        .value =
            product.id;


    document
        .getElementById("productName")
        .value =
            product.name || "";


    document
        .getElementById("productDescription")
        .value =
            product.description || "";


    document
        .getElementById("productPrice")
        .value =
            product.price || 0;


    document
        .getElementById("productDiscount")
        .value =
            product.discount || 0;


    document
        .getElementById("productImage")
        .value =
            product.imageURL || "";


    document
        .getElementById("productAvailable")
        .checked =
            product.available === true ||
            String(product.available)
                .toUpperCase() ===
            "YES";


    updateImagePreview();


    document
        .getElementById("cancelEdit")
        .style.display =
            "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   DELETE
========================================================= */

async function deleteProduct(id) {

    const product =
        products.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!product) {

        showAlert(
            "Product not found."
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete Product ID " +
            product.id +
            " - " +
            product.name +
            "?"
        );


    if (!confirmed) {
        return;
    }


    /*
       Remove locally and send the
       complete remaining array.
    */

    const newProducts =
        products.filter(
            function(item) {

                return String(item.id) !==
                    String(id);

            }
        );


    await saveProducts(
        newProducts
    );

}


/* =========================================================
   RESET
========================================================= */

function resetForm() {

    editingId =
        null;


    document
        .getElementById("productForm")
        .reset();


    document
        .getElementById("formTitle")
        .innerText =
            "Add Product";


    document
        .getElementById("productId")
        .value =
            "";


    document
        .getElementById("productAvailable")
        .checked =
            true;


    document
        .getElementById("cancelEdit")
        .style.display =
            "none";


    document
        .getElementById("imagePreview")
        .innerHTML =
            "";

}


/* =========================================================
   CANCEL EDIT
========================================================= */

document
    .getElementById("cancelEdit")
    .addEventListener(
        "click",
        resetForm
    );


/* =========================================================
   REFRESH
========================================================= */

document
    .getElementById("refreshButton")
    .addEventListener(
        "click",
        loadProducts
    );


/* =========================================================
   IMAGE PREVIEW
========================================================= */

document
    .getElementById("productImage")
    .addEventListener(
        "input",
        updateImagePreview
    );


function updateImagePreview() {

    const url =
        document
            .getElementById(
                "productImage"
            )
            .value
            .trim();


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (!url) {

        preview.innerHTML =
            "";

        return;

    }


    preview.innerHTML = `

        <img
            src="${escapeHTML(url)}"
            alt="Preview"
            onerror="
                this.style.display='none'
            "
        >

    `;

}


/* =========================================================
   START DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (!checkLogin()) {
            return;
        }

        loadProducts();

    }
);
