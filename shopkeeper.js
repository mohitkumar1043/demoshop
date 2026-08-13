const WORKER_URL =
    "https://YOUR-WORKER.workers.dev";


let products = [];

let editingId = null;


/* =========================
   ALERT
========================= */

function showAlert(message) {

    const alert =
        document.getElementById(
            "adminAlert"
        );

    alert.innerText = message;

    alert.style.display = "block";

    setTimeout(() => {

        alert.style.display = "none";

    }, 2500);

}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    try {

        const response =
            await fetch(
                "products.json?t=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products"
            );

        }


        products =
            await response.json();


        displayProducts();

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "adminProductList"
        ).innerHTML =

            "Unable to load products.";

    }

}


/* =========================
   DISPLAY
========================= */

function displayProducts() {

    const container =
        document.getElementById(
            "adminProductList"
        );


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML =
            "No products.";

        return;

    }


    products.forEach(product => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "admin-product";


        item.innerHTML = `

            <img
                src="${product.imageURL || "default-product.jpg"}"
                onerror="
                    this.src='default-product.jpg'
                "
            >

            <div class="admin-product-info">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ₹${product.price}
                </p>

                <p>
                    Discount:
                    ${product.discount || 0}%
                </p>

                <p>
                    ${
                        product.available
                        ? "✅ Available"
                        : "❌ Not Available"
                    }
                </p>


                <div class="admin-actions">

                    <button
                        class="edit-button"
                        onclick="
                            editProduct(${product.id})
                        "
                    >
                        Edit
                    </button>


                    <button
                        class="delete-button"
                        onclick="
                            deleteProduct(${product.id})
                        "
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;


        container.appendChild(item);

    });

}


/* =========================
   ADD / UPDATE
========================= */

document.getElementById(
    "productForm"
).onsubmit = async function(event) {

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


    if (!name || price < 0) {

        showAlert(
            "Enter valid product data"
        );

        return;

    }


    if (editingId !== null) {

        const index =
            products.findIndex(
                product =>
                    product.id ===
                    editingId
            );


        if (index !== -1) {

            products[index] = {

                ...products[index],

                name,
                description,
                price,
                discount,
                imageURL,
                available

            };

        }

    }

    else {

        const newProduct = {

            id:
                Date.now(),

            name,

            description,

            price,

            discount,

            imageURL,

            available

        };


        products.push(
            newProduct
        );

    }


    await saveProducts();

};


/* =========================
   SAVE TO GITHUB
========================= */

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

                    body: JSON.stringify({

                        products:
                            products

                    })

                }
            );


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

        console.error(error);

        showAlert(
            "Unable to save products"
        );

    }

}


/* =========================
   EDIT
========================= */

function editProduct(id) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) return;


    editingId = id;


    document.getElementById(
        "formTitle"
    ).innerText =
        "Update Product";


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


    document.getElementById(
        "cancelEdit"
    ).style.display =
        "block";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================
   DELETE
========================= */

async function deleteProduct(id) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) return;


    const confirmed =
        confirm(
            "Delete " +
            product.name +
            "?"
        );


    if (!confirmed) return;


    products =
        products.filter(
            item =>
                item.id !== id
        );


    await saveProducts();

}


/* =========================
   RESET
========================= */

function resetForm() {

    editingId = null;


    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "formTitle"
    ).innerText =
        "Add Product";


    document.getElementById(
        "cancelEdit"
    ).style.display =
        "none";

}


/* =========================
   CANCEL
========================= */

document.getElementById(
    "cancelEdit"
).onclick = resetForm;


/* =========================
   REFRESH
========================= */

document.getElementById(
    "refreshButton"
).onclick = loadProducts;


/* =========================
   IMAGE PREVIEW
========================= */

document.getElementById(
    "productImage"
).oninput = function() {

    const url =
        this.value.trim();


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (!url) {

        preview.innerHTML = "";

        return;

    }


    preview.innerHTML = `

        <img
            src="${url}"
            onerror="
                this.style.display='none'
            "
        >

    `;

};


/* =========================
   START
========================= */

loadProducts();
