/* =========================================================
   SHOPKEEPER PRODUCT MANAGER

   ADD
   EDIT
   DELETE

   PRODUCT ID:
   - Automatically generated
   - Cannot be edited
   - Existing ID never changes
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const WORKER_URL =
    "https://YOUR-WORKER.workers.dev";


/* =========================================================
   GLOBAL
========================================================= */

let products = [];

let editingId = null;


/* =========================================================
   ALERT
========================================================= */

function showAlert(message) {

    const alertBox =
        document.getElementById("adminAlert");

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

    const container =
        document.getElementById(
            "adminProductList"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "Loading products...";


    try {

        const response =
            await fetch(
                "products.json?v=" +
                Date.now(),
                {
                    cache: "no-store"
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
                "products.json must contain an array"
            );

        }


        products = data;


        displayProducts();

    }

    catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        container.innerHTML =
            `
            <div class="no-products">

                ❌ Unable to load products.

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </div>
            `;

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


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        container.innerHTML =
            `
            <div class="no-products">

                No products available.

            </div>
            `;

        return;
    }


    products.forEach(function (product) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "admin-product";


        const imageURL =
            product.imageURL ||
            "default-product.jpg";


        const price =
            Number(product.price) || 0;


        const discount =
            Number(product.discount) || 0;


        const available =
            product.available === true ||
            String(product.available)
                .trim()
                .toUpperCase() === "YES";


        item.innerHTML =
            `

            <img
                src="${escapeHTML(imageURL)}"
                alt="${escapeHTML(
                    product.name
                )}"
                onerror="
                    this.src='default-product.jpg'
                "
            >


            <div class="admin-product-info">


                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>


                <p>
                    🆔 Product ID:
                    <strong>
                        ${escapeHTML(
                            product.id
                        )}
                    </strong>
                </p>


                <p>
                    💰 Price:
                    ₹${price.toFixed(2)}
                </p>


                <p>
                    🏷️ Discount:
                    ${discount}%
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
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        ✏️ Edit

                    </button>


                    <button
                        type="button"
                        class="delete-button"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        🗑️ Delete

                    </button>

                </div>


            </div>

            `;


        const editButton =
            item.querySelector(
                ".edit-button"
            );


        editButton.addEventListener(
            "click",
            function () {

                editProduct(
                    product.id
                );

            }
        );


        const deleteButton =
            item.querySelector(
                ".delete-button"
            );


        deleteButton.addEventListener(
            "click",
            function () {

                deleteProduct(
                    product.id
                );

            }
        );


        container.appendChild(item);

    });

}


/* =========================================================
   GENERATE NEXT PRODUCT ID
========================================================= */

function generateProductId() {

    let highestId = 0;


    products.forEach(function (product) {

        const id =
            Number(product.id);


        if (
            Number.isFinite(id) &&
            id > highestId
        ) {

            highestId = id;

        }

    });


    return highestId + 1;
}


/* =========================================================
   ADD / UPDATE PRODUCT
========================================================= */

async function saveProduct(event) {

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


    /* =====================================================
       VALIDATION
    ===================================================== */

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
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
    ) {

        showAlert(
            "Discount must be between 0 and 100"
        );

        return;
    }


    /* =====================================================
       EDIT EXISTING PRODUCT
    ===================================================== */

    if (editingId !== null) {

        const index =
            products.findIndex(
                function (product) {

                    return String(
                        product.id
                    ) === String(
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
           IMPORTANT:
           ID is NOT changed.
        */

        const oldId =
            products[index].id;


        products[index] = {

            id: oldId,

            name: name,

            description: description,

            price: price,

            discount: discount,

            imageURL: imageURL,

            available: available

        };


        await saveProducts();


        return;
    }


    /* =====================================================
       ADD NEW PRODUCT
    ===================================================== */

    const newId =
        generateProductId();


    const newProduct = {

        id: newId,

        name: name,

        description: description,

        price: price,

        discount: discount,

        imageURL: imageURL,

        available: available

    };


    products.push(
        newProduct
    );


    await saveProducts();

}


/* =========================================================
   SAVE TO CLOUDFLARE WORKER
========================================================= */

async function saveProducts() {

    try {

        showAlert(
            "Saving products..."
        );


        const response =
            await fetch(
                WORKER_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            products:
                                products

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Worker HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Worker response:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Save failed"
            );

        }


        showAlert(
            "✅ Products saved successfully"
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
            "❌ Unable to save products"
        );


        /*
           Reload original data
           so failed changes don't
           remain only in browser.
        */

        await loadProducts();

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
            "Product not found"
        );

        return;
    }


    editingId =
        product.id;


    /* =====================================================
       SHOW FORM AS EDIT
    ===================================================== */

    document.getElementById(
        "formTitle"
    ).innerText =
        "✏️ Edit Product";


    document.getElementById(
        "saveButton"
    ).innerText =
        "💾 Update Product";


    document.getElementById(
        "cancelEdit"
    ).style.display =
        "block";


    /* =====================================================
       PRODUCT ID
       READ ONLY
    ===================================================== */

    const idInput =
        document.getElementById(
            "productId"
        );


    if (idInput) {

        idInput.value =
            product.id;

        idInput.readOnly =
            true;

    }


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
            "Product not found"
        );

        return;
    }


    const confirmed =
        confirm(
            "Delete product?\n\n" +
            "Product ID: " +
            product.id +
            "\n" +
            product.name
        );


    if (!confirmed) {
        return;
    }


    products =
        products.filter(
            function (item) {

                return String(item.id) !==
                       String(id);

            }
        );


    await saveProducts();

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
        "➕ Add Product";


    document.getElementById(
        "saveButton"
    ).innerText =
        "💾 Add Product";


    document.getElementById(
        "cancelEdit"
    ).style.display =
        "none";


    /*
       ID is empty when adding.
       It will be generated automatically
       during save.
    */

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

function setupCancelEdit() {

    const button =
        document.getElementById(
            "cancelEdit"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            resetForm();

        }
    );

}


/* =========================================================
   REFRESH
========================================================= */

function setupRefresh() {

    const button =
        document.getElementById(
            "refreshButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            loadProducts();

        }
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


function setupImagePreview() {

    const input =
        document.getElementById(
            "productImage"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        updateImagePreview
    );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "SHOPKEEPER JS LOADED"
        );


        const form =
            document.getElementById(
                "productForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                saveProduct
            );

        }


        setupCancelEdit();

        setupRefresh();

        setupImagePreview();

        loadProducts();

    }
);
