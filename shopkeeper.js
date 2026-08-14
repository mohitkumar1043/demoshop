/* =========================================================
   SHOPKEEPER DASHBOARD
   Works with the Cloudflare Worker API
========================================================= */

const WORKER_URL =
    "https://my-demo-shop-api.mohitsaini12943.workers.dev";

let products = [];
let editingId = null;


/* =========================================================
   TOKEN
========================================================= */

function getToken() {
    return sessionStorage.getItem("shopkeeperToken");
}


/* =========================================================
   LOGIN CHECK
========================================================= */

function checkLogin() {

    const token = getToken();

    if (!token) {
        window.location.href = "shopkeeper-login.html";
        return false;
    }

    return true;
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

    clearTimeout(window.alertTimer);

    window.alertTimer = setTimeout(() => {
        box.style.display = "none";
    }, 3000);
}


/* =========================================================
   SESSION EXPIRED
========================================================= */

function handleSessionExpired() {

    sessionStorage.removeItem("shopkeeperToken");

    alert("Your login session has expired. Please login again.");

    window.location.href = "shopkeeper-login.html";
}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = String(value ?? "");

    return div.innerHTML;
}


/* =========================================================
   READ JSON
   THIS WAS MISSING IN YOUR OLD CODE
========================================================= */

async function readJSON(response) {

    const text = await response.text();

    if (!text) {
        return {};
    }

    try {

        return JSON.parse(text);

    } catch (error) {

        console.error(
            "Invalid JSON received from Worker:",
            text
        );

        throw new Error(
            "Worker did not return valid JSON."
        );
    }
}


/* =========================================================
   LOGOUT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            sessionStorage.removeItem(
                "shopkeeperToken"
            );

            window.location.href =
                "shopkeeper-login.html";

        });

    }

});


/* =========================================================
   LOAD PRODUCTS
   GET /products
========================================================= */

async function loadProducts() {

    if (!checkLogin()) {
        return;
    }

    const token = getToken();

    const container =
        document.getElementById("adminProductList");

    try {

        if (container) {
            container.innerHTML =
                "<p>Loading products...</p>";
        }

        const response = await fetch(
            WORKER_URL + "/products",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + token,

                    "Accept":
                        "application/json"
                },

                cache: "no-store"
            }
        );


        console.log(
            "GET /products status:",
            response.status
        );


        const result =
            await readJSON(response);


        console.log(
            "GET /products response:",
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


        if (!result.success) {

            throw new Error(
                result.message ||
                "Worker returned an error."
            );
        }


        if (!Array.isArray(result.products)) {

            throw new Error(
                "Invalid products data received from Worker."
            );
        }


        products = result.products;


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
                        onclick="loadProducts()"
                    >
                        Try Again
                    </button>

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
        .forEach(product => {

            const div =
                document.createElement("div");

            div.className =
                "admin-product";


            const image =
                product.imageURL ||
                "default-product.jpg";


            const available =
                product.available === true ||
                String(product.available)
                    .toUpperCase() === "YES";


            div.innerHTML = `

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name)}"
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
                        ${escapeHTML(product.name)}
                    </h3>

                    <p>
                        ${escapeHTML(
                            product.description || ""
                        )}
                    </p>

                    <p>
                        <strong>Price:</strong>
                        ₹${Number(
                            product.price || 0
                        ).toFixed(2)}
                    </p>

                    <p>
                        <strong>Discount:</strong>
                        ${Number(
                            product.discount || 0
                        )}%
                    </p>

                    <p>
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


            div
                .querySelector(".edit-button")
                .addEventListener(
                    "click",
                    () => editProduct(product.id)
                );


            div
                .querySelector(".delete-button")
                .addEventListener(
                    "click",
                    () => deleteProduct(product.id)
                );


            container.appendChild(div);

        });

}


/* =========================================================
   FORM SUBMIT
   ADD OR UPDATE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("productForm");


    if (!form) {

        console.error(
            "productForm not found"
        );

        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!checkLogin()) {
                return;
            }


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
                    "Enter valid price."
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

                name: name,

                description: description,

                price: price,

                discount: discount,

                imageURL: imageURL,

                available: available

            };


            /* =========================================
               ADD
            ========================================= */

            if (editingId === null) {

                await addProduct(product);

            }

            /* =========================================
               UPDATE
            ========================================= */

            else {

                await updateProduct(
                    editingId,
                    product
                );

            }

        }
    );

});


/* =========================================================
   ADD PRODUCT
   POST /products
   action = add
========================================================= */

async function addProduct(product) {

    const token = getToken();

    if (!token) {
        handleSessionExpired();
        return;
    }


    try {

        showAlert(
            "Adding product..."
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
                            "Bearer " + token

                    },

                    body: JSON.stringify({

                        action: "add",

                        product: product

                    })

                }
            );


        const result =
            await readJSON(response);


        console.log(
            "ADD PRODUCT:",
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
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to add product."
            );

        }


        showAlert(
            "✅ Product added successfully. ID: " +
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
   POST /products
   action = update
========================================================= */

async function updateProduct(
    id,
    product
) {

    const token = getToken();

    if (!token) {
        handleSessionExpired();
        return;
    }


    try {

        showAlert(
            "Updating product..."
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
                            "Bearer " + token

                    },

                    body: JSON.stringify({

                        action: "update",

                        product: {

                            id: id,

                            ...product

                        }

                    })

                }
            );


        const result =
            await readJSON(response);


        console.log(
            "UPDATE PRODUCT:",
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
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to update product."
            );

        }


        showAlert(
            "✅ Product updated successfully."
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


    document
        .getElementById("formTitle")
        .textContent =
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
            product.price ?? 0;


    document
        .getElementById("productDiscount")
        .value =
            product.discount ?? 0;


    document
        .getElementById("productImage")
        .value =
            product.imageURL || "";


    document
        .getElementById("productAvailable")
        .checked =
            product.available === true ||
            String(product.available)
                .toUpperCase() === "YES";


    updateImagePreview();


    document
        .getElementById("cancelEdit")
        .style.display =
            "block";


    document
        .querySelector(".save-button")
        .textContent =
            "Update Product";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   DELETE PRODUCT
   POST /products
   action = delete
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
            "Are you sure you want to delete Product ID " +
            product.id +
            " - " +
            product.name +
            "?"
        );


    if (!confirmed) {
        return;
    }


    const token = getToken();


    if (!token) {

        handleSessionExpired();
        return;
    }


    try {

        showAlert(
            "Deleting product..."
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
                            "Bearer " + token

                    },

                    body: JSON.stringify({

                        action: "delete",

                        productId: id

                    })

                }
            );


        const result =
            await readJSON(response);


        console.log(
            "DELETE PRODUCT:",
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
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to delete product."
            );

        }


        showAlert(
            "✅ Product deleted successfully."
        );


        if (
            editingId !== null &&
            String(editingId) === String(id)
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
        .getElementById("formTitle")
        .textContent =
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
        .querySelector(".save-button")
        .textContent =
            "Save Product";


    document
        .getElementById("imagePreview")
        .innerHTML =
            "";

}


/* =========================================================
   CANCEL EDIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById(
            "cancelEdit"
        );


    if (button) {

        button.addEventListener(
            "click",
            resetForm
        );

    }

});


/* =========================================================
   REFRESH
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById(
            "refreshButton"
        );


    if (button) {

        button.addEventListener(
            "click",
            loadProducts
        );

    }

});


/* =========================================================
   IMAGE PREVIEW
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

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

});


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


    preview.innerHTML = `

        <img
            src="${escapeHTML(url)}"
            alt="Image Preview"
            onerror="
                this.style.display='none';
            "
        >

    `;

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!checkLogin()) {
            return;
        }

        loadProducts();

    }
);
