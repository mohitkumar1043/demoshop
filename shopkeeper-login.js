/* =========================================================
   SHOPKEEPER LOGIN
========================================================= */

const WORKER_URL =
    "https://my-demo-shop-api.mohitsaini12943.workers.dev";


/* =========================================================
   ELEMENTS
========================================================= */

const loginForm =
    document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginText =
    document.getElementById("loginText");

const loginLoader =
    document.getElementById("loginLoader");

const loginError =
    document.getElementById("loginError");


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(message) {

    loginError.innerText =
        "⚠ " + message;

    loginError.style.display =
        "block";

}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideError() {

    loginError.innerText = "";

    loginError.style.display =
        "none";

}


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        hideError();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        if (!username) {

            showError(
                "Please enter Shopkeeper ID."
            );

            return;
        }


        if (!password) {

            showError(
                "Please enter password."
            );

            return;
        }


        loginButton.disabled = true;

        loginText.innerText =
            "Signing in...";

        loginLoader.style.display =
            "inline-block";


        try {

            console.log(
                "Sending login request to:",
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


            const text =
                await response.text();


            let result;


            try {

                result =
                    JSON.parse(text);

            }
            catch {

                console.error(
                    "Server response:",
                    text
                );

                throw new Error(
                    "Server returned invalid response."
                );

            }


            console.log(
                "Login result:",
                result
            );


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Login failed."
                );

            }


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Invalid login details."
                );

            }


            if (!result.token) {

                throw new Error(
                    "Login successful but token was not received."
                );

            }


            /* =================================================
               SAVE JWT
            ================================================= */

            sessionStorage.setItem(
                "shopkeeperToken",
                result.token
            );


            /* =================================================
               OPEN DASHBOARD
            ================================================= */

            loginText.innerText =
                "Login successful ✓";

            loginLoader.style.display =
                "none";


            window.location.href =
                "shopkeeper.html";

        }
        catch(error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to login."
            );


            loginButton.disabled =
                false;

            loginText.innerText =
                "Login";

            loginLoader.style.display =
                "none";
        }

    }
);
