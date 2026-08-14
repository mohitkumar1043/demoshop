/* =========================================================
   SHOPKEEPER PRODUCT MANAGER
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const WORKER_URL =
    "https://YOUR-WORKER.workers.dev";

const PRODUCTS_URL =
    "products.json";


/*
   IMPORTANT

   This email is NOT security.

   Real security must be handled by
   the Cloudflare Worker.
*/

const SHOPKEEPER_EMAIL =
    "pankajsal880@gmail.com";


/* =========================================================
   DATA
========================================================= */

let products = [];

let editingId = null;


/*
   Highest ID ever seen during this session.

   Deleted IDs are never selected again
   during the session.
*/

let highestKnownId = 0;


/* =========================================================
   SECURITY SESSION
========================================================= */

let loggedIn = false;


/* =========================================================
   ALERT
========================================================= */

function showAlert(message) {

    const alert =
        document.getElementById(
            "adminAlert"
        );


    if (!alert) {

        alert(message);

        return;

    }


    alert.innerText =
        message;


    alert.style.display =
        "block";


    setTimeout(function () {

        alert.style.display =
            "none";

    }, 2500);

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
   LOGIN
========================================================= */

document.getElementById(
    "loginForm"
).addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "shopkeeperEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "shopkeeperPassword"
            ).value;


        if (!email || !password) {

            showAlert(
                "Enter email and password"
            );

            return;

        }


        try {

            showAlert(
                "Checking login..."
            );


            /*
               IMPORTANT:

               Login must be checked by
               Cloudflare Worker.

               Do NOT check password like:

               if(password === "1234")

               because anyone can see
               JavaScript source code.
            */


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

                        body: JSON.stringify({

                            email:
                                email,

                            password:
                                password

                        })

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Login failed"
                );

            }


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Invalid login"
                );

            }


            /*
               Worker should return a token.
            */

            if (!result.token) {

                throw new Error(
                    "No security token received"
                );

            }


            sessionStorage.setItem(
                "shopkeeperToken",
                result.token
            );


            loggedIn = true;


            document.getElementById(
                "loginCard"
            ).style.display =
                "none";


            document.getElementById(
                "adminArea"
            ).style.display =
                "block";


            showAlert(
                "Login successful"
            );


            loadProducts();


        }

        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            showAlert(
                "Invalid email or password"
            );

        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    sessionStorage.removeItem(
        "shopkeeperToken"
    );


    loggedIn = false;


    location.reload();

}


/* =========================================================
   GET SECURITY TOKEN
========================================================= */

function getToken() {

    return sessionStorage.getItem(
        "shopkeeperToken"
    );

}


/* =========================================================
   GET NEXT ID
========================================================= */

function getNextProductId() {

    let highest =
        highestKnownId;


    products.forEach(
        function (product) {

            const id =
                Number(product.id);


            if (
                Number.isInteger(id) &&
                id > highest
            ) {

                highest = id;

            }

        }
    );


    const nextId =
        highest + 1;


    highestKnownId =
        nextId;


    return nextId;

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        const response =
            await fetch(
                PRODUCTS_URL +
                "?t=" +
                Date.now(),
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid products.json"
            );

        }


        products =
            data;


        /*
           Find highest existing ID.
        */

        products.forEach(
            function (product) {

                const id =
                    Number(product.id);


                if (
                    Number.isInteger(id) &&
                    id > highestKnownId
                ) {

                    highestKnownId =
                        id;

                }

            }
        );


        displayProducts();


    }

    catch (error) {

        console.error(
            "LOAD ERROR:",
            error
        );


        document.getElementById(
            "adminProductList"
        ).innerHTML =

            "Unable to load products.<br><br>" +
            escapeHTML(
                error.message
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
            "No products.";

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


            item.innerHTML = `

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
                            onclick="
                                editProduct(
                                    ${Number(product.id)}
                                )
                            ">

                            ✏️ Edit

                        </button>


                        <button
                            type="button"
                            class="delete-button"
                            onclick="
                                deleteProduct(
                                    ${Number(product.id)}
                                )
                            ">

                            🗑 Delete

                        </button>


                    </div>


                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   ADD / EDIT PRODUCT
========================================================= */

document.getElementById(
    "productForm"
).addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!getToken()) {

            showAlert(
                "Please login first"
            );

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
                "Enter product name"
            );

            return;

        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            showAlert(
                "Enter valid price"
            );

            return;

        }


        if (
            discount < 0 ||
            discount > 100
        ) {

            showAlert(
                "Invalid discount"
            );

            return;

        }


        /* =========================
           EDIT
        ========================= */

        if (editingId !== null) {


            const index =
                products.findIndex(
                    function (product) {

                        return Number(
                            product.id
                        ) === Number(
                            editingId
                        );

                    }
                );


            if (index === -1) {

                showAlert(
                    "Product not found"
                );

                return;

            }


            /*
               KEEP OLD ID.
            */

            products[index] = {

                ...products[index],

                id:
                    products[index].id,

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


        /* =========================
           ADD
        ========================= */

        else {


            const newId =
                getNextProductId();


            const newProduct = {

                id:
                    newId,

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


            products.push(
                newProduct
            );

        }


        await saveProducts();

    }
);


/* =========================================================
   SAVE PRODUCTS
========================================================= */

async function saveProducts() {

    const token =
        getToken();


    if (!token) {

        showAlert(
            "Login required"
        );

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

                    body: JSON.stringify({

                        products:
                            products

                    })

                }
            );


        if (
            response.status ===
            401
        ) {

            sessionStorage.removeItem(
                "shopkeeperToken"
            );


            alert(
                "Session expired. Please login again."
            );


            location.reload();


            return;

        }


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Save failed"
            );

        }


        showAlert(
            "Products saved successfully"
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
            "Unable to save products"
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

                return Number(item.id) ===
                       Number(id);

            }
        );


    if (!product) {

        return;

    }


    editingId =
        Number(product.id);


    document.getElementById(
        "formTitle"
    ).innerText =
        "Update Product";


    /*
       PRODUCT ID IS READ ONLY
    */

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
        product.available === true;


    updateImagePreview();


    document.getElementById(
        "cancelEdit"
    ).style.display =
        "block";


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


/* =========================================================
   DELETE
========================================================= */

async function deleteProduct(id) {

    if (!getToken()) {

        showAlert(
            "Login required"
        );

        return;

    }


    const product =
        products.find(
            function (item) {

                return Number(item.id) ===
                       Number(id);

            }
        );


    if (!product) {

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
       IMPORTANT:

       We DO NOT reduce highestKnownId.

       Therefore the deleted ID
       will never be selected again
       in this session.
    */

    products =
        products.filter(
            function (item) {

                return Number(item.id) !==
                       Number(id);

            }
        );


    await saveProducts();

}


/* =========================================================
   RESET
========================================================= */

function resetForm() {

    editingId =
        null;


    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "formTitle"
    ).innerText =
        "Add Product";


    document.getElementById(
        "productId"
    ).value =
        "";


    document.getElementById(
        "cancelEdit"
    ).style.display =
        "none";


    document.getElementById(
        "productAvailable"
    ).checked =
        true;


    document.getElementById(
        "imagePreview"
    ).innerHTML =
        "";

}


/* =========================================================
   CANCEL
========================================================= */

document.getElementById(
    "cancelEdit"
).addEventListener(
    "click",
    function () {

        resetForm();

    }
);


/* =========================================================
   REFRESH
========================================================= */

document.getElementById(
    "refreshButton"
).addEventListener(
    "click",
    function () {

        loadProducts();

    }
);


/* =========================================================
   IMAGE PREVIEW
========================================================= */

document.getElementById(
    "productImage"
).addEventListener(
    "input",
    updateImagePreview
);


function updateImagePreview() {

    const url =
        document.getElementById(
            "productImage"
        ).value.trim();


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
            alt="Product preview"
            onerror="
                this.style.display='none'
            "
        >

    `;

}
