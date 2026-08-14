/* =========================================================
   SHOPKEEPER PRODUCT MANAGER
   Cloudflare Worker secured version
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const WORKER_URL =
    "https://YOUR-WORKER.workers.dev";

const PRODUCTS_URL =
    "products.json";


/* =========================================================
   DATA
========================================================= */

let products = [];

let editingId = null;


/* =========================================================
   SECURITY
========================================================= */

function getToken() {

    return sessionStorage.getItem(
        "shopkeeperToken"
    );

}


/* =========================================================
   ALERT
========================================================= */

function showAlert(message) {

    const alertBox =
        document.getElementById(
            "adminAlert"
        );

    if (!alertBox) {

        alert(message);

        return;

    }

    alertBox.innerText =
        message;

    alertBox.style.display =
        "block";


    setTimeout(function () {

        alertBox.style.display =
            "none";

    }, 2500);

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function checkLogin() {

    const token =
        getToken();

    if (!token) {

        window.location.href =
            "shopkeeper.html";

        return false;

    }

    return true;

}


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const usernameElement =
                document.getElementById(
                    "username"
                );


            const passwordElement =
                document.getElementById(
                    "password"
                );


            const username =
                usernameElement
                    ? usernameElement.value.trim()
                    : "";


            const password =
                passwordElement
                    ? passwordElement.value
                    : "";


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


            if (loginButton) {

                loginButton.disabled =
                    true;

            }


            if (loginText) {

                loginText.innerText =
                    "Signing in...";

            }


            if (loginLoader) {

                loginLoader.style.display =
                    "inline-block";

            }


            try {

                const response =
                    await fetch(
                        WORKER_URL +
                        "/login",
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


                let result = {};

                try {

                    result =
                        await response.json();

                }
                catch (jsonError) {

                    throw new Error(
                        "Invalid server response."
                    );

                }


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
                        "Security token was not received."
                    );

                }


                /*
                   Store only the session token.

                   GitHub token is NEVER stored
                   in browser.
                */

                sessionStorage.setItem(
                    "shopkeeperToken",
                    result.token
                );


                if (loginText) {

                    loginText.innerText =
                        "Login successful ✓";

                }


                /*
                   Go to dashboard.
                */

                setTimeout(function () {

                    window.location.href =
                        "shopkeeper-dashboard.html";

                }, 500);


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


                if (loginButton) {

                    loginButton.disabled =
                        false;

                }


                if (loginText) {

                    loginText.innerText =
                        "Login";

                }


                if (loginLoader) {

                    loginLoader.style.display =
                        "none";

                }

            }

        }
    );

}


/* =========================================================
   LOGIN ERROR
========================================================= */

function showLoginError(message) {

    const errorBox =
        document.getElementById(
            "loginError"
        );


    if (!errorBox) {

        alert(message);

        return;

    }


    errorBox.innerText =
        "⚠ " + message;


    errorBox.style.display =
        "block";

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    sessionStorage.removeItem(
        "shopkeeperToken"
    );

    editingId = null;

    window.location.href =
        "shopkeeper.html";

}


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
                "Invalid products.json format."
            );

        }


        products =
            data;


        displayProducts();


        showAlert(
            "Products loaded"
        );


    }
    catch (error) {

        console.error(
            "LOAD ERROR:",
            error
        );


        const container =
            document.getElementById(
                "adminProductList"
            );


        if (container) {

            container.innerHTML =
                `
                <p>
                    Unable to load products.
                </p>

                <p>
                    ${escapeHTML(error.message)}
                </p>
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


    container.innerHTML =
        "";


    const count =
        document.getElementById(
            "productCount"
        );


    if (count) {

        count.innerText =
            products.length;

    }


    if (products.length === 0) {

        container.innerHTML =
            "<p>No products available.</p>";

        return;

    }


    /*
       Sort only for display.

       IDs are NOT changed.
    */

    const sortedProducts =
        [...products].sort(
            function (a, b) {

                return Number(a.id) -
                    Number(b.id);

            }
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
                    .toUpperCase() ===
                    "YES";


            item.innerHTML =
                `
                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="
                        this.src='default-product.jpg'
                    "
                >


                <div
                    class="admin-product-info">


                    <div
                        class="product-id">

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


                    <p
                        class="product-status">

                        ${
                            available
                                ? "✅ Available"
                                : "❌ Not Available"
                        }

                    </p>


                    <div
                        class="admin-actions">


                        <button
                            type="button"
                            class="edit-button"
                            data-id="${escapeHTML(product.id)}">

                            ✏️ Edit

                        </button>


                        <button
                            type="button"
                            class="delete-button"
                            data-id="${escapeHTML(product.id)}">

                            🗑 Delete

                        </button>


                    </div>


                </div>
                `;


            /*
               Event listeners instead of
               putting user data directly
               inside onclick.
            */

            const editButton =
                item.querySelector(
                    ".edit-button"
                );


            const deleteButton =
                item.querySelector(
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
                item
            );

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


            if (!checkLogin()) {

                return;

            }


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


            /*
               IMPORTANT:

               ID is NOT generated here.

               Cloudflare Worker generates
               the ID when adding.
            */

            if (editingId !== null) {

                await updateProductOnServer({

                    id:
                        editingId,

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

                });

            }
            else {

                await addProductOnServer({

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

                });

            }

        }
    );

}


/* =========================================================
   ADD PRODUCT
========================================================= */

async function addProductOnServer(product) {

    const token =
        getToken();


    if (!token) {

        showAlert(
            "Please login first."
        );

        return;

    }


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
            await readJSON(response);


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


        /*
           Worker returns the newly
           generated product ID.
        */

        if (result.product) {

            console.log(
                "New Product ID:",
                result.product.id
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
            "ADD ERROR:",
            error
        );


        showAlert(
            error.message ||
            "Unable to add product."
        );

    }

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    if (!checkLogin()) {

        return;

    }


    const product =
        products.find(
            function (item) {

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


    document.getElementById(
        "formTitle"
    ).innerText =
        "Update Product";


    /*
       Product ID is displayed
       but cannot be changed.
    */

    const idInput =
        document.getElementById(
            "productId"
        );


    idInput.value =
        product.id;


    idInput.readOnly =
        true;


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
            .toUpperCase() ===
            "YES";


    updateImagePreview();


    const cancelButton =
        document.getElementById(
            "cancelEdit"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "block";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   UPDATE PRODUCT ON SERVER
========================================================= */

async function updateProductOnServer(product) {

    const token =
        getToken();


    if (!token) {

        showAlert(
            "Please login first."
        );

        return;

    }


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
                                product

                        })

                }
            );


        const result =
            await readJSON(response);


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
            "UPDATE ERROR:",
            error
        );


        showAlert(
            error.message ||
            "Unable to update product."
        );

    }

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
                                product.id

                        })

                }
            );


        const result =
            await readJSON(response);


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


        /*
           IMPORTANT:

           Frontend does NOT generate
           the next ID.

           The Worker permanently
           remembers used IDs.
        */


        showAlert(
            "Product deleted successfully."
        );


        resetForm();


        await loadProducts();

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
   READ JSON SAFELY
========================================================= */

async function readJSON(response) {

    try {

        return await response.json();

    }
    catch (error) {

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

function handleSessionExpired() {

    sessionStorage.removeItem(
        "shopkeeperToken"
    );


    alert(
        "Your login session has expired. Please login again."
    );


    window.location.href =
        "shopkeeper.html";

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


    const title =
        document.getElementById(
            "formTitle"
        );


    if (title) {

        title.innerText =
            "Add Product";

    }


    const idInput =
        document.getElementById(
            "productId"
        );


    if (idInput) {

        idInput.value =
            "";

        idInput.readOnly =
            true;

    }


    const cancelButton =
        document.getElementById(
            "cancelEdit"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }


    const available =
        document.getElementById(
            "productAvailable"
        );


    if (available) {

        available.checked =
            true;

    }


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (preview) {

        preview.innerHTML =
            "";

    }

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
        function () {

            resetForm();

        }
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
        function () {

            loadProducts();

        }
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


/* =========================================================
   UPDATE IMAGE PREVIEW
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
   DASHBOARD START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Only run dashboard functions
           when dashboard elements exist.
        */

        const adminArea =
            document.getElementById(
                "adminArea"
            );


        if (!adminArea) {

            return;

        }


        if (!checkLogin()) {

            return;

        }


        loadProducts();

    }
);
