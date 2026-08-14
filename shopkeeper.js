
/* =========================================================
   SHOPKEEPER PRODUCT MANAGER
   Cloudflare Worker + GitHub Pages
========================================================= */

const WORKER_URL =
    "https://my-demo-shop-api.mohitsaini12943.workers.dev";

const PRODUCTS_URL =
    "products.json";

let products = [];
let editingId = null;


/* =========================================================
   TOKEN
========================================================= */

function getToken() {
    return sessionStorage.getItem("shopkeeperToken");
}


/* =========================================================
   ALERT
========================================================= */

function showAlert(message) {

    const box = document.getElementById("adminAlert");

    if (!box) {
        alert(message);
        return;
    }

    box.textContent = message;
    box.style.display = "block";

    setTimeout(() => {
        box.style.display = "none";
    }, 3000);
}


/* =========================================================
   LOGIN ERROR
========================================================= */

function showLoginError(message) {

    const box = document.getElementById("loginError");

    if (!box) {
        alert(message);
        return;
    }

    box.textContent = "⚠ " + message;
    box.style.display = "block";
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
   LOGIN
========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const username =
                document.getElementById(
                    "shopkeeperUsername"
                ).value.trim();

            const password =
                document.getElementById(
                    "shopkeeperPassword"
                ).value;


            if (!username) {

                showLoginError(
                    "Please enter your Shopkeeper ID."
                );

                return;
            }


            if (!password) {

                showLoginError(
                    "Please enter your password."
                );

                return;
            }


            const loginButton =
                document.getElementById(
                    "loginButton"
                );

            const loginText =
                document.getElementById(
                    "loginText"
                );

            const loginLoader =
                document.getElementById(
                    "loginLoader"
                );


            loginButton.disabled = true;

            loginText.textContent =
                "Signing in...";

            loginLoader.style.display =
                "inline-block";


            try {

                console.log(
                    "Login URL:",
                    WORKER_URL + "/login"
                );


                const response =
                    await fetch(
                        WORKER_URL + "/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    username:
                                        username,

                                    password:
                                        password
                                })
                        }
                    );


                console.log(
                    "Login HTTP status:",
                    response.status
                );


                const result =
                    await readJSON(response);


                console.log(
                    "Login result:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Invalid login details."
                    );
                }


                if (!result.token) {

                    throw new Error(
                        "Token was not received from Worker."
                    );
                }


                /*
                   Store JWT only in sessionStorage.
                */

                sessionStorage.setItem(
                    "shopkeeperToken",
                    result.token
                );


                loginText.textContent =
                    "Login successful ✓";


                /*
                   Show admin area.
                */

                document.getElementById(
                    "loginCard"
                ).style.display = "none";


                document.getElementById(
                    "adminArea"
                ).style.display = "block";


                loginLoader.style.display =
                    "none";


                loadProducts();

            }
            catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                showLoginError(
                    error.message ||
                    "Unable to login."
                );


                loginButton.disabled =
                    false;


                loginText.textContent =
                    "Login";


                loginLoader.style.display =
                    "none";
            }

        }
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    sessionStorage.removeItem(
        "shopkeeperToken"
    );

    products = [];

    editingId = null;


    document.getElementById(
        "adminArea"
    ).style.display = "none";


    document.getElementById(
        "loginCard"
    ).style.display = "block";


    document.getElementById(
        "shopkeeperUsername"
    ).value = "";


    document.getElementById(
        "shopkeeperPassword"
    ).value = "";
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

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
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products. HTTP " +
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


        products = data;


        displayProducts();


        showAlert(
            "Products loaded"
        );

    }
    catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        const container =
            document.getElementById(
                "adminProductList"
            );


        if (container) {

            container.innerHTML =
                `
                <div class="error-box">

                    <strong>
                        Unable to load products
                    </strong>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>
                `;
        }
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


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const count =
        document.getElementById(
            "productCount"
        );


    if (count) {
        count.textContent =
            products.length;
    }


    if (products.length === 0) {

        container.innerHTML =
            `
            <div class="empty-products">
                No products available.
            </div>
            `;

        return;
    }


    const sortedProducts =
        [...products].sort(
            (a, b) =>
                Number(a.id) -
                Number(b.id)
        );


    sortedProducts.forEach(
        function (product) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-product";


            const image =
                product.imageURL ||
                "default-product.jpg";


            const available =
                product.available === true ||
                String(product.available)
                    .trim()
                    .toUpperCase() === "YES";


            item.innerHTML =
                `
                <div class="product-image-container">

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            product.name
                        )}"
                        onerror="
                            this.src='default-product.jpg'
                        "
                    >

                </div>


                <div class="admin-product-info">

                    <span class="product-id">
                        Product ID:
                        ${escapeHTML(product.id)}
                    </span>


                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p class="description">
                        ${escapeHTML(
                            product.description || ""
                        )}
                    </p>


                    <div class="product-details">

                        <span>
                            Price:
                            ₹${Number(
                                product.price || 0
                            ).toFixed(2)}
                        </span>

                        <span>
                            Discount:
                            ${Number(
                                product.discount || 0
                            )}%
                        </span>

                    </div>


                    <p class="product-status">

                        ${
                            available
                                ? "✅ Available"
                                : "❌ Not Available"
                        }

                    </p>


                    <div class="admin-actions">

                        <button
                            type="button"
                            class="edit-button"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            type="button"
                            class="delete-button"
                        >
                            🗑 Delete
                        </button>

                    </div>

                </div>
                `;


            item.querySelector(
                ".edit-button"
            ).addEventListener(
                "click",
                () => editProduct(product.id)
            );


            item.querySelector(
                ".delete-button"
            ).addEventListener(
                "click",
                () => deleteProduct(product.id)
            );


            container.appendChild(item);
        }
    );
}


/* =========================================================
   PRODUCT FORM
========================================================= */

const productForm =
    document.getElementById(
        "productForm"
    );


if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "productName"
                ).value.trim();


            const description =
                document.getElementById(
                    "productDescription"
                ).value.trim();


            const price =
                Number(
                    document.getElementById(
                        "productPrice"
                    ).value
                );


            const discount =
                Number(
                    document.getElementById(
                        "productDiscount"
                    ).value
                );


            const imageURL =
                document.getElementById(
                    "productImage"
                ).value.trim();


            const available =
                document.getElementById(
                    "productAvailable"
                ).checked;


            if (!name) {

                showAlert(
                    "Enter product name."
                );

                return;
            }


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                showAlert(
                    "Enter a valid price."
                );

                return;
            }


            if (
                !Number.isFinite(discount) ||
                discount < 0 ||
                discount > 100
            ) {

                showAlert(
                    "Discount must be between 0 and 100."
                );

                return;
            }


            const product = {

                name,
                description,
                price,
                discount,
                imageURL,
                available

            };


            if (editingId !== null) {

                product.id =
                    editingId;
            }


            await saveProducts(
                product
            );
        }
    );
}


/* =========================================================
   SAVE PRODUCTS
========================================================= */

async function saveProducts(product) {

    const token =
        getToken();


    if (!token) {

        showLoginAgain();

        return;
    }


    try {

        showAlert(
            editingId !== null
                ? "Updating product..."
                : "Adding product..."
        );


        let finalProducts =
            [...products];


        /*
           EDIT
        */

        if (editingId !== null) {

            const index =
                finalProducts.findIndex(
                    item =>
                        String(item.id) ===
                        String(editingId)
                );


            if (index === -1) {

                throw new Error(
                    "Product not found."
                );
            }


            finalProducts[index] = {

                ...finalProducts[index],

                ...product,

                id:
                    finalProducts[index].id

            };
        }


        /*
           ADD
        */

        else {

            finalProducts.push({

                ...product,

                id:
                    "new-" +
                    Date.now()

            });
        }


        /*
           Your Worker expects:

           {
               products: [...]
           }
        */

        const response =
            await fetch(
                WORKER_URL + "/products",
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
                                finalProducts
                        })
                }
            );


        const result =
            await readJSON(response);


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            showLoginAgain();

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


        if (
            Array.isArray(
                result.products
            )
        ) {

            products =
                result.products;
        }
        else {

            /*
               Worker may not return products
               in some versions.
            */

            await loadProducts();

        }


        showAlert(
            editingId !== null
                ? "Product updated successfully."
                : "Product added successfully."
        );


        resetForm();


        displayProducts();

    }
    catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        showAlert(
            error.message ||
            "Unable to save product."
        );
    }
}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {

        showAlert(
            "Product not found."
        );

        return;
    }


    editingId =
        product.id;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Update Product";


    document.getElementById(
        "productId"
    ).value =
        product.id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price || 0;


    document.getElementById(
        "productDiscount"
    ).value =
        product.discount || 0;


    document.getElementById(
        "productImage"
    ).value =
        product.imageURL || "";


    document.getElementById(
        "productAvailable"
    ).checked =
        product.available === true ||
        String(product.available)
            .trim()
            .toUpperCase() === "YES";


    updateImagePreview();


    document.getElementById(
        "cancelEdit"
    ).style.display =
        "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
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


    const token =
        getToken();


    if (!token) {

        showLoginAgain();

        return;
    }


    try {

        showAlert(
            "Deleting product..."
        );


        const finalProducts =
            products.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );


        const response =
            await fetch(
                WORKER_URL + "/products",
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
                                finalProducts
                        })
                }
            );


        const result =
            await readJSON(response);


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            showLoginAgain();

            return;
        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to delete product."
            );
        }


        if (
            Array.isArray(
                result.products
            )
        ) {

            products =
                result.products;
        }
        else {

            products =
                finalProducts;
        }


        resetForm();

        displayProducts();


        showAlert(
            "Product deleted successfully."
        );

    }
    catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        showAlert(
            error.message ||
            "Unable to delete product."
        );
    }
}


/* =========================================================
   READ JSON
========================================================= */

async function readJSON(response) {

    try {

        return await response.json();

    }
    catch {

        return {
            success: false,
            message:
                "Invalid response from server."
        };
    }
}


/* =========================================================
   SESSION EXPIRED
========================================================= */

function showLoginAgain() {

    sessionStorage.removeItem(
        "shopkeeperToken"
    );


    alert(
        "Your login session has expired. Please login again."
    );


    document.getElementById(
        "adminArea"
    ).style.display =
        "none";


    document.getElementById(
        "loginCard"
    ).style.display =
        "block";
}


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

    editingId = null;


    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {
        form.reset();
    }


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add Product";


    document.getElementById(
        "productId"
    ).value =
        "";


    document.getElementById(
        "productAvailable"
    ).checked =
        true;


    document.getElementById(
        "cancelEdit"
    ).style.display =
        "none";


    document.getElementById(
        "imagePreview"
    ).innerHTML =
        "";
}


/* =========================================================
   CANCEL EDIT
========================================================= */

const cancelEdit =
    document.getElementById(
        "cancelEdit"
    );


if (cancelEdit) {

    cancelEdit.addEventListener(
        "click",
        resetForm
    );
}


/* =========================================================
   REFRESH
========================================================= */

const refreshButton =
    document.getElementById(
        "refreshButton"
    );


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadProducts
    );
}


/* =========================================================
   LOGOUT BUTTON
========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

const productImage =
    document.getElementById(
        "productImage"
    );


if (productImage) {

    productImage.addEventListener(
        "input",
        updateImagePreview
    );
}


function updateImagePreview() {

    const input =
        document.getElementById(
            "productImage"
        );


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (!input || !preview) {
        return;
    }


    const url =
        input.value.trim();


    if (!url) {

        preview.innerHTML =
            "";

        return;
    }


    preview.innerHTML =
        `
        <img
            src="${escapeHTML(url)}"
            alt="Product preview"
            onerror="
                this.style.display='none'
            "
        >
        `;
}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const token =
            getToken();


        if (token) {

            document.getElementById(
                "loginCard"
            ).style.display =
                "none";


            document.getElementById(
                "adminArea"
            ).style.display =
                "block";


            loadProducts();
        }

    }
);
