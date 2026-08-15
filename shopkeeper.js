/* =========================================================
   SHOPKEEPER DASHBOARD
========================================================= */

const WORKER_URL =
    "https://my-demo-shop-api.mohitsaini12943.workers.dev";


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
   LOGIN CHECK
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
        document.getElementById(
            "adminAlert"
        );

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
   SESSION EXPIRED
========================================================= */

function handleSessionExpired() {

    sessionStorage.removeItem(
        "shopkeeperToken"
    );

    window.location.href =
        "shopkeeper-login.html";

}


/* =========================================================
   LOGOUT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                function () {

                    sessionStorage.removeItem(
                        "shopkeeperToken"
                    );

                    window.location.href =
                        "shopkeeper-login.html";

                }
            );

        }

    }
);


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
                            "Bearer " +
                            token,

                        "Accept":
                            "application/json"

                    },

                    cache: "no-store"

                }
            );


        const result =
            await readJSON(
                response
            );


        console.log(
            "GET /products:",
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
            !result.success
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
                "Worker did not return products array."
            );

        }


        products =
            result.products;


        displayProducts();


        showAlert(
            products.length +
            " products loaded."
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
        .forEach(
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
                    ).toUpperCase() ===
                    "YES";


                div.innerHTML = `

                    <img
    src="${image}"
    alt="${escapeHTML(product.name)}"
    class="product-image"
    loading="lazy"
    onerror="this.onerror=null; this.src='default-product.jpg';"
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
                    .querySelector(
                        ".edit-button"
                    )
                    .addEventListener(
                        "click",
                        function () {

                            editProduct(
                                product.id
                            );

                        }
                    );


                div
                    .querySelector(
                        ".delete-button"
                    )
                    .addEventListener(
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
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

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
                .value
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

        name,

        description,

        price,

        discount,

        imageURL,

        available

    };

}


/* =========================================================
   VALIDATE FORM
========================================================= */

function validateForm(product) {

    if (!product.name) {

        showAlert(
            "Enter product name."
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
            "Enter valid price."
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

async function addProduct(product) {

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
            "ADD RESPONSE:",
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
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to add product."
            );

        }


        showAlert(
            "Product added successfully."
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

async function updateProduct(
    id,
    product
) {

    const token =
        getToken();


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

                            product: {

                                id:
                                    Number(id),

                                ...product

                            }

                        })

                }
            );


        const result =
            await readJSON(
                response
            );


        console.log(
            "UPDATE RESPONSE:",
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
            !result.success
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

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "productForm"
            );


        if (!form) {

            console.error(
                "productForm not found"
            );

            return;

        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (!checkLogin()) {

                    return;

                }


                const product =
                    getFormProduct();


                if (
                    !validateForm(
                        product
                    )
                ) {

                    return;

                }


                if (
                    editingId === null
                ) {

                    await addProduct(
                        product
                    );

                }
                else {

                    await updateProduct(
                        editingId,
                        product
                    );

                }

            }
        );

    }
);


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
            product.available === true;


    updateImagePreview();


    document
        .getElementById(
            "cancelEdit"
        )
        .style.display =
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
            `Delete Product ID ${product.id} - ${product.name}?`
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
            "DELETE RESPONSE:",
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
            !result.success
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

    editingId =
        null;


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


    document
        .getElementById(
            "imagePreview"
        )
        .innerHTML =
            "";

}


/* =========================================================
   CANCEL EDIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

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

    }
);


/* =========================================================
   REFRESH
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

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

    }
);


/* =========================================================
   IMAGE PREVIEW
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

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

    }
);


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
            alt="Preview"
            onerror="
                this.style.display='none'
            "
        >

    `;

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkLogin()) {

            return;

        }


        loadProducts();

    }
);
