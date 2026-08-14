
/* =========================================================
   SHOPKEEPER DASHBOARD
   Works with your current Cloudflare Worker
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const WORKER_URL =
    "https://my-demo-shop-api.mohitsaini12943.workers.dev";


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

    const token = getToken();

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
        document.getElementById("adminAlert");

    if (!box) {

        alert(message);

        return;

    }

    box.textContent = message;

    box.style.display = "block";

    clearTimeout(
        window.alertTimer
    );

    window.alertTimer =
        setTimeout(function () {

            box.style.display = "none";

        }, 3000);

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    sessionStorage.removeItem(
        "shopkeeperToken"
    );

    window.location.href =
        "shopkeeper-login.html";

}


/* =========================================================
   SESSION EXPIRED
========================================================= */

function handleSessionExpired() {

    sessionStorage.removeItem(
        "shopkeeperToken"
    );

    alert(
        "Your login session has expired. Please login again."
    );

    window.location.href =
        "shopkeeper-login.html";

}


/* =========================================================
   SAFE JSON RESPONSE
========================================================= */

async function readJSON(response) {

    const text =
        await response.text();

    if (!text) {

        return {};

    }

    try {

        return JSON.parse(text);

    }
    catch (error) {

        console.error(
            "Invalid JSON response:",
            text
        );

        throw new Error(
            "Worker returned invalid JSON."
        );

    }

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
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    if (!checkLogin()) {

        return;

    }

    const token =
        getToken();

    try {

        showAlert(
            "Loading products..."
        );


        const response =
            await fetch(

                WORKER_URL +
                "/products",

                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    },

                    cache: "no-store"

                }

            );


        const result =
            await readJSON(
                response
            );


        console.log(
            "GET PRODUCTS:",
            response.status,
            result
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleSessionExpired();

            return;

        }


        if (!response.ok) {

            throw new Error(

                result.message ||
                "Unable to load products."

            );

        }


        if (
            result.success !== true
        ) {

            throw new Error(

                result.message ||
                "Unable to load products."

            );

        }


        if (
            !Array.isArray(
                result.products
            )
        ) {

            throw new Error(
                "Worker did not return a products array."
            );

        }


        products =
            result.products;


        displayProducts();


        showAlert(
            "Products loaded successfully."
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

            container.innerHTML = `

                <div class="error-box">

                    <h3>
                        Unable to load products
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                    <button
                        type="button"
                        onclick="loadProducts()"
                    >
                        Try Again
                    </button>

                </div>

            `;

        }


        showAlert(
            error.message ||
            "Unable to load products."
        );

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


    if (!container) {

        console.error(
            "adminProductList element not found"
        );

        return;

    }


    if (count) {

        count.textContent =
            products.length;

    }


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML = `

            <div class="empty-products">

                <p>
                    No products available.
                </p>

                <p>
                    Add your first product using the form above.
                </p>

            </div>

        `;

        return;

    }


    products.sort(

        function (a, b) {

            return (
                Number(a.id) -
                Number(b.id)
            );

        }

    );


    products.forEach(

        function (product) {


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
                String(
                    product.available
                ).toUpperCase() === "YES";


            const price =
                Number(
                    product.price || 0
                );


            const discount =
                Number(
                    product.discount || 0
                );


            div.innerHTML = `

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(
                        product.name
                    )}"
                    class="admin-product-image"
                    onerror="
                        this.onerror=null;
                        this.src='default-product.jpg';
                    "
                >


                <div class="admin-product-info">

                    <div class="product-id">
                        Product ID:
                        ${escapeHTML(product.id)}
                    </div>


                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            product.description || ""
                        )}
                    </p>


                    <p>
                        <strong>
                            Price:
                        </strong>

                        ₹${price.toFixed(2)}
                    </p>


                    <p>
                        <strong>
                            Discount:
                        </strong>

                        ${discount}%
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


            const editButton =
                div.querySelector(
                    ".edit-button"
                );


            const deleteButton =
                div.querySelector(
                    ".delete-button"
                );


            editButton.addEventListener(

                "click",

                function () {

                    editProduct(
                        product.id
                    );

                }

            );


            deleteButton.addEventListener(

                "click",

                function () {

                    deleteProduct(
                        product.id
                    );

                }

            );


            container.appendChild(
                div
            );

        }

    );

}


/* =========================================================
   GET FORM PRODUCT
========================================================= */

function getFormProduct() {

    const name =
        document
            .getElementById(
                "productName"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "productDescription"
            )
            .value
            .trim();


    const price =
        Number(
            document
                .getElementById(
                    "productPrice"
                )
                .value
        );


    const discount =
        Number(
            document
                .getElementById(
                    "productDiscount"
                )
                .value || 0
        );


    const imageURL =
        document
            .getElementById(
                "productImage"
            )
            .value
            .trim();


    const available =
        document
            .getElementById(
                "productAvailable"
            )
            .checked;


    return {

        name:
            name,

        description:
            description,

        price:
            price,

        discount:
            discount,

        imageURL:
            imageURL,

        available:
            available

    };

}


/* =========================================================
   VALIDATE FORM
========================================================= */

function validateFormProduct(product) {

    if (!product.name) {

        showAlert(
            "Please enter product name."
        );

        return false;

    }


    if (
        !Number.isFinite(
            product.price
        ) ||
        product.price < 0
    ) {

        showAlert(
            "Please enter a valid price."
        );

        return false;

    }


    if (
        !Number.isFinite(
            product.discount
        ) ||
        product.discount < 0 ||
        product.discount > 100
    ) {

        showAlert(
            "Discount must be between 0 and 100."
        );

        return false;

    }


    return true;

}


/* =========================================================
   ADD PRODUCT
========================================================= */

async function addProduct() {

    if (!checkLogin()) {

        return;

    }


    const product =
        getFormProduct();


    if (
        !validateFormProduct(
            product
        )
    ) {

        return;

    }


    const token =
        getToken();


    try {

        showAlert(
            "Adding product..."
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

                            action:
                                "add",

                            product:
                                product

                        })

                }

            );


        const result =
            await readJSON(
                response
            );


        console.log(
            "ADD PRODUCT:",
            response.status,
            result
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleSessionExpired();

            return;

        }


        if (
            !response.ok ||
            result.success !== true
        ) {

            throw new Error(

                result.message ||
                "Unable to add product."

            );

        }


        showAlert(
            "Product added successfully. ID: " +
            result.product.id
        );


        resetForm();


        await loadProducts();


    }
    catch (error) {

        console.error(
            "ADD PRODUCT ERROR:",
            error
        );


        showAlert(
            error.message ||
            "Unable to add product."
        );

    }

}


/* =========================================================
   UPDATE PRODUCT
========================================================= */

async function updateProduct() {

    if (!checkLogin()) {

        return;

    }


    if (editingId === null) {

        showAlert(
            "No product selected for update."
        );

        return;

    }


    const product =
        getFormProduct();


    if (
        !validateFormProduct(
            product
        )
    ) {

        return;

    }


    const token =
        getToken();


    const productToUpdate = {

        id:
            Number(editingId),

        name:
            product.name,

        description:
            product.description,

        price:
            product.price,

        discount:
            product.discount,

        imageURL:
            product.imageURL,

        available:
            product.available

    };


    try {

        showAlert(
            "Updating product..."
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

                            action:
                                "edit",

                            product:
                                productToUpdate

                        })

                }

            );


        const result =
            await readJSON(
                response
            );


        console.log(
            "UPDATE PRODUCT:",
            response.status,
            result
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleSessionExpired();

            return;

        }


        if (
            !response.ok ||
            result.success !== true
        ) {

            throw new Error(

                result.message ||
                "Unable to update product."

            );

        }


        showAlert(
            "Product updated successfully."
        );


        resetForm();


        await loadProducts();


    }
    catch (error) {

        console.error(
            "UPDATE PRODUCT ERROR:",
            error
        );


        showAlert(
            error.message ||
            "Unable to update product."
        );

    }

}


/* =========================================================
   FORM SUBMIT
========================================================= */

async function handleProductFormSubmit(
    event
) {

    event.preventDefault();


    if (editingId === null) {

        await addProduct();

    }
    else {

        await updateProduct();

    }

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        products.find(

            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

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
        .getElementById(
            "formTitle"
        )
        .textContent =
            "Update Product";


    document
        .getElementById(
            "productId"
        )
        .value =
            product.id;


    document
        .getElementById(
            "productName"
        )
        .value =
            product.name || "";


    document
        .getElementById(
            "productDescription"
        )
        .value =
            product.description || "";


    document
        .getElementById(
            "productPrice"
        )
        .value =
            product.price ?? 0;


    document
        .getElementById(
            "productDiscount"
        )
        .value =
            product.discount ?? 0;


    document
        .getElementById(
            "productImage"
        )
        .value =
            product.imageURL || "";


    document
        .getElementById(
            "productAvailable"
        )
        .checked =
            product.available === true ||
            String(
                product.available
            ).toUpperCase() === "YES";


    updateImagePreview();


    document
        .getElementById(
            "cancelEdit"
        )
        .style.display =
            "block";


    const saveButton =
        document.querySelector(
            "#productForm .save-button"
        );


    if (saveButton) {

        saveButton.textContent =
            "Update Product";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    if (!checkLogin()) {

        return;

    }


    const product =
        products.find(

            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }

        );


    if (!product) {

        showAlert(
            "Product not found."
        );

        return;

    }


    const confirmed =
        window.confirm(

            "Are you sure you want to delete Product ID " +
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


    try {

        showAlert(
            "Deleting product..."
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

                            action:
                                "delete",

                            productId:
                                Number(id)

                        })

                }

            );


        const result =
            await readJSON(
                response
            );


        console.log(
            "DELETE PRODUCT:",
            response.status,
            result
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleSessionExpired();

            return;

        }


        if (
            !response.ok ||
            result.success !== true
        ) {

            throw new Error(

                result.message ||
                "Unable to delete product."

            );

        }


        showAlert(
            "Product deleted successfully."
        );


        if (
            editingId !== null &&
            String(editingId) ===
            String(id)
        ) {

            resetForm();

        }


        await loadProducts();


    }
    catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );


        showAlert(
            error.message ||
            "Unable to delete product."
        );

    }

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


    document
        .getElementById(
            "formTitle"
        )
        .textContent =
            "Add Product";


    document
        .getElementById(
            "productId"
        )
        .value =
            "";


    document
        .getElementById(
            "productDiscount"
        )
        .value =
            "0";


    document
        .getElementById(
            "productAvailable"
        )
        .checked =
            true;


    document
        .getElementById(
            "cancelEdit"
        )
        .style.display =
            "none";


    const saveButton =
        document.querySelector(
            "#productForm .save-button"
        );


    if (saveButton) {

        saveButton.textContent =
            "Save Product";

    }


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (preview) {

        preview.innerHTML = "";

    }

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

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

        preview.innerHTML = "";

        return;

    }


    preview.innerHTML = `

        <img
            src="${escapeHTML(url)}"
            alt="Product preview"
            onerror="
                this.style.display='none';
            "
        >

    `;

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        /* ================================
           LOGIN CHECK
        ================================= */

        if (!checkLogin()) {

            return;

        }


        /* ================================
           LOGOUT
        ================================= */

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


        /* ================================
           PRODUCT FORM
        ================================= */

        const productForm =
            document.getElementById(
                "productForm"
            );


        if (productForm) {

            productForm.addEventListener(

                "submit",

                handleProductFormSubmit

            );

        }


        /* ================================
           CANCEL EDIT
        ================================= */

        const cancelButton =
            document.getElementById(
                "cancelEdit"
            );


        if (cancelButton) {

            cancelButton.addEventListener(

                "click",

                resetForm

            );

        }


        /* ================================
           REFRESH
        ================================= */

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


        /* ================================
           IMAGE PREVIEW
        ================================= */

        const imageInput =
            document.getElementById(
                "productImage"
            );


        if (imageInput) {

            imageInput.addEventListener(

                "input",

                updateImagePreview

            );

        }


        /* ================================
           LOAD PRODUCTS
        ================================= */

        loadProducts();

    }

);
