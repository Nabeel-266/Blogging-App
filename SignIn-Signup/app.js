import {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    setDoc,
    doc,
} from '../../Firebase-Setup/firebase-Config.js';

// For Eye Button Function
function toggleEyeBtn(eye) {
    if (eye.classList.contains("fa-eye")) {
        eye.parentElement.previousElementSibling.setAttribute("type", "password");
        eye.classList.replace("fa-eye", "fa-eye-slash");
    } else if (eye.classList.contains("fa-eye-slash")) {
        eye.parentElement.previousElementSibling.setAttribute("type", "text");
        eye.classList.replace("fa-eye-slash", "fa-eye");
    }
}

const loginForm = document.querySelector(".loginForm");
const createAccountModal = document.querySelector(".createAccountModal");

// For Open Create Account Modal by clicked to Create Account Link in Login Form.
function openCreateAccountModal() {
    loginForm.classList.add("hide");
    createAccountModal.style.transform = `translateY(0%)`;
}

// For Close Create Account Modal by clicked to Close Button in Signup Form.
function closeCreateAccountModal() {
    loginForm.classList.remove("hide");
    createAccountModal.style.transform = `translateY(-150%)`;
}

window.toggleEyeBtn = toggleEyeBtn
window.openCreateAccountModal = openCreateAccountModal
window.closeCreateAccountModal = closeCreateAccountModal


const signupButton = document.querySelector(".signUpBtn");
const signupEmail = document.querySelector("#signupEmail");
const signUpPassword = document.querySelector("#signUpPassword");
const signUpConfirmPassword = document.querySelector("#signUpConfirmPassword");
const firstName = document.querySelector("#firstName");
const lastName = document.querySelector("#lastName");


// ---------------------> For Signup User <---------------------
signupButton.addEventListener("click", signupUser);

async function signupUser() {
    try {
        // Check all fields of Signup form are filled
        if (
            firstName.value !== "" &&
            lastName.value !== "" &&
            signupEmail.value !== "" &&
            signUpPassword.value !== "" &&
            signUpConfirmPassword.value !== ""
        ) {
            // For weak password restriction
            if (signUpPassword.value.length >= 8) {
                // For checking password verification
                if (signUpPassword.value === signUpConfirmPassword.value) {
                    const response = await createUserWithEmailAndPassword(
                        auth,
                        signupEmail.value,
                        signUpPassword.value
                    );
                    const userUniqueId = response.user.uid;
                    addUserDetails(userUniqueId);
                    allFieldsClear();
                }
                else {
                    alert("Please! confirm your correct password.");
                }
            }
            else {
                alert("Weak Password! password should be atleast 8 characters");
            }
        }
        else {
            alert("Please! fill in the all fields");
        }
    } catch (error) {
        const errorMessage = error.code;

        if (errorMessage === "auth/invalid-email") {
            alert("Your email address is invalid");
        } else if (errorMessage === "auth/email-already-in-use") {
            alert("This email address is already in use");
        } else {
            console.error(error.code);
        }
    }
}

// For Add User Data in Firestore Database
async function addUserDetails(userID) {
    try {
        // Add a new document in collection "Postmate-Users"
        const setUserInfoInFirestorDatabase = await setDoc(
            doc(db, "Users", userID),
            {
                firstName: firstName.value,
                lastName: lastName.value,
                email: signupEmail.value,
            }
        );

        createAccountModal.style.transform = `translateY(-150%)`;
        loginForm.classList.remove("hide");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// For All Fields Clear In Signup Form
function allFieldsClear() {
    firstName.value = "";
    lastName.value = "";
    signupEmail.value = "";
    signUpPassword.value = "";
    signUpConfirmPassword.value = "";
}


/*  If a user is already logged in to a device
    so the user don't need to log in to that device again 
    until the user wouldn't logout  */
const loginState = JSON.parse(localStorage.getItem("login-State"));
if (loginState) {
    window.location.href = "../LoginDashboard/index.html";
}


const loginButton = document.querySelector(".logInBtn");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const emailMessage = document.querySelector(".emailMessage");
const passwordMessage = document.querySelector(".passwordMessage");

loginButton.addEventListener("click", loginUser);

async function loginUser() {
    try {
        const response = await signInWithEmailAndPassword(
            auth,
            loginEmail.value,
            loginPassword.value
        );
        const userFind = response.user;
        if (userFind) {
            window.location.href = "../LoginDashboard/index.html";
            [loginEmail.value, loginPassword.value] = ["", ""];
            const state = {
                login: true,
            };
            localStorage.setItem("login-State", JSON.stringify(state));
        }
    }
    catch (error) {
        const errorMessage = error.code;
        console.error(errorMessage);

        // If user email is invalid
        if (errorMessage === "auth/invalid-email") {
            emailMessage.innerText = "Your email address is invalid";
            emailMessage.classList.remove("hide");
            loginEmail.parentElement.style.border = `2px solid #ff2a23`;
        } else {
            emailMessage.classList.add("hide");
            loginEmail.parentElement.style.border = `none`;
        }

        // if user password missing or wrong
        if (errorMessage === "auth/missing-password") {
            passwordMessage.innerText = "Please entered a password";
            passwordMessage.classList.remove("hide");
            loginPassword.parentElement.style.border = `2px solid #ff2a23`;
        } else if (errorMessage === "auth/wrong-password") {
            passwordMessage.innerText = "Your password is wrong";
            passwordMessage.classList.remove("hide");
            loginPassword.parentElement.style.border = `2px solid #ff2a23`;
        } else {
            passwordMessage.classList.add("hide");
            loginPassword.parentElement.style.border = `none`;
        }

        // if user is not found
        if (errorMessage === "auth/user-not-found") {
            alert(
                "Sorry! This account is not registered, kindly create an account first"
            );
        }
    }
}
