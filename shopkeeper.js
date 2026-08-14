```javascript
/* =========================================================
   SHOPKEEPER PRODUCT MANAGER
   Cloudflare Worker + GitHub Pages
========================================================= */


/* =========================================================
   CONFIGURATION
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

    }, 3000);

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
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

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
                    "shopkeeperUsername"
                );


            const passwordElement =
                document.getElementById(
                    "shopkeeperPassword"
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

                console.log(
                    "Sending login request..."
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
                    await readJSON(
                        response
                    );


                console.log(
                    "Login response:",
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
                        "Security token was not received."
                    );

                }


                /* =========================
                   SAVE JWT
                ========================== */

                sessionStorage.setItem(
                    "shopkeeperToken",
                    result.token
                );


                if (loginText) {

                    loginText.innerText =
                        "Login successful ✓";

                }


                /* =========================
                   SHOW ADMIN AREA
                ========================== */

                setTimeout(function () {

                    document.getElementById(
                        "loginCard"
                    ).style.display =
                        "none";


                    document.getElementById(
                        "adminArea"
                    ).style.display =
                        "block";


                    loadProducts();

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
    ).style.display =
        "none";


    document.getElementById(
        "loginCard"
    ).style.display =
        "block";


    const username =
        document.getElementById(
            "shopkeeperUsername"
        );

    const password =
        document.getElementById(
            "shopkeeperPassword"
        );


    if (username) {

        username.value = "";

    }


    if (password) {

        password.value = "";

    }

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


        products =
            data;


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
                <p>
                    Unable to load products.
                </p>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
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


            if (editingId !== null) {

                product.id =
                    editingId;

            }


            await saveProductsToWorker(
                product
            );

        }
    );

}


/* =========================================================
   SAVE PRODUCTS
   IMPORTANT:

   Your Worker currently expects:

   {
       products: [...]
   }

========================================================= */

async function saveProductsToWorker(
    product
) {

    const token =
        getToken();


    if (!token) {

        showLoginAgain();

        return;

    }


    try {

        showAlert(
            "Saving product..."
        );


        /*
           Make a copy of current
           products.
        */

        let newProducts =
            [...products];


        if (editingId !== null) {

            /*
               UPDATE
            */

            const index =
                newProducts.findIndex(
                    function (item) {

                        return String(item.id) ===
                            String(editingId);

                    }
                );


            if (index === -1) {

                throw new Error(
                    "Product not found."
                );

            }


            newProducts[index] = {

                ...newProducts[index],

                ...product,

                id:
                    newProducts[index].id

            };

        }

        else {

            /*
               NEW PRODUCT

               Temporary ID is used only
               for the browser request.

               Worker will assign permanent ID.
            */

            newProducts.push({

                ...product,

                id:
                    "new-" +
                    Date.now()

            });

        }


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
            await readJSON(
                response
            );


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


        /*
           Worker returns final products.
        */

        if (
            Array.isArray(
                result.products
            )
        ) {

            products =
                result.products;

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
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

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


    if (!token) {

        showLoginAgain();

        return;

    }


    try {

        showAlert(
            "Deleting product..."
        );


        /*
           Remove product locally.
        */

        const newProducts =
            products.filter(
                function (item) {

                    return String(item.id) !==
                        String(id);

                }
            );


        /*
           Send complete product array
           to the Worker.
        */

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
            await readJSON(
                response
            );


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
                newProducts;

        }


        showAlert(
            "Product deleted successfully."
        );


        resetForm();

        displayProducts();

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

    editingId =
        null;


    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {

        form.reset();

    }


    document.getElementById(
        "formTitle"
    ).innerText =
        "Add Product";


    document.getElementById(
        "productId"
    ).value =
        "";


    document.getElementById(
        "productAvailable"
    ).checked =
        true;


    const cancelButton =
        document.getElementById(
            "cancelEdit"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "none";

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
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           If an existing JWT is present,
           show dashboard directly.
        */

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
```

