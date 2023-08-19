import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc,
    storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    setDoc
} from "../Firebase-Setup/firebase-Config.js";


const dashboardBtn = document.querySelector(".dashboardBtn");
const logoutBtn = document.querySelector(".logoutBtn");
const editProfileBtn = document.querySelector(".editProfileBtn");
const selectImageInput = document.querySelector("#selectImageInput");
const firstNameInput = document.querySelector("#firstNameInput");
const lastNameInput = document.querySelector("#lastNameInput");
const profileImg = document.querySelector(".profileImg");

dashboardBtn.addEventListener("click", () => {
    window.location.href = "../LoginDashboard/index.html";
})

logoutBtn.addEventListener('click', LogoutHandler)
function LogoutHandler() {
    signOut(auth)
        .then(() => (window.location.href = "../index.html"))
        .catch((error) => console.error(error));
    localStorage.removeItem("login-State");
}




// Get Current Login User ID
onAuthStateChanged(auth, (crntLoginUser) => {
    if (!!crntLoginUser) {
        const currentLoginUserUniqueID = crntLoginUser.uid;
        // console.log(currentLoginUserUniqueID);
        loginUserId = currentLoginUserUniqueID;
        getlogInUserData(currentLoginUserUniqueID);
    }
    else {
        window.location.href = "../index.html";
    }
});

async function getlogInUserData(uid) {
    try {
        const docRef = doc(db, "Users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // console.log("Login User Data:", docSnap.data());
            // loginUserData = docSnap.data();
            const { firstName, lastName, email, profilePic } = docSnap.data();
            loginUserName = `${firstName} ${lastName}`;
            loginUserEmail = email;
            loginUserPicture = profilePic;
            firstNameInput.value = firstName;
            lastNameInput.value = lastName;
            profileImg.src = profilePic || "../Assets/Avatar.jpg";
        } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
        }
    } catch (error) {
        console.error(error);
    }
}

let loginUserId;
let loginUserName;
let loginUserEmail;
let loginUserPicture;


editProfileBtn.addEventListener("click", editProfileHandler)
async function editProfileHandler() {
    if (!!firstNameInput.value && !!lastNameInput.value) {
        if (!selectImageInput.value) {
            try {
                const response = await setDoc(doc(db, "Users", loginUserId), {
                    firstName: firstNameInput.value,
                    lastName: lastNameInput.value,
                    profilePic: loginUserPicture || "../Assets/Avatar.jpg",
                    email: loginUserEmail,
                });

                alert("Your Profile edit Successfully");
                window.location.reload();
            }
            catch (error) {
                console.error("Error adding document: ", error);
            }
        }
        else {
            const file = selectImageInput.files[0];

            // Create the file metadata
            /** @type {any} */
            const metadata = {
                contentType: 'image/jpeg'
            };

            // Upload file and metadata to the object 'images/mountains.jpg'
            const storageRef = ref(storage, 'User-Profile-Pic' + file.name);
            const uploadTask = uploadBytesResumable(storageRef, file, metadata);

            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    switch (error.code) {
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            // User canceled the upload
                            break;
                        case 'storage/unknown':
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        console.log('File available at', downloadURL);
                        try {

                            const response = await setDoc(doc(db, "Users", loginUserId), {
                                firstName: firstNameInput.value,
                                lastName: lastNameInput.value,
                                profilePic: downloadURL,
                                email: loginUserEmail,
                            });

                            alert("Your Profile edit Successfully");
                            window.location.reload();
                        }
                        catch (error) {
                            console.error("Error adding document: ", error);
                        }
                    });
                }
            );
        }
    }
    else {
        alert("Please fill up the missing field")
    }
}