import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    collection,
    addDoc,
    storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
    setDoc
} from "../Firebase-Setup/firebase-Config.js";


// For get all previous blogs
const blogCont = document.querySelector(".blogCont");
getAllMyBlogs()

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

const logoutBtn = document.querySelector('.logoutBtn');
const postingBlogArea = document.querySelector('.postingBlogArea');
const publishBlogBtn = document.querySelector('.publishBlogBtn');

const profileBtn = document.querySelector(".profileBtn");
profileBtn.addEventListener("click", () => {
    window.location.href = "../EditProfile/index.html"
})

logoutBtn.addEventListener('click', LogoutHandler)

function LogoutHandler() {
    signOut(auth)
        .then(() => (window.location.href = "../index.html"))
        .catch((error) => console.error(error));
    localStorage.removeItem("login-State");
}


async function getlogInUserData(uid) {
    try {
        const docRef = doc(db, "Users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // console.log("Login User Data:", docSnap.data());
            // loginUserData = docSnap.data();
            const { firstName, lastName, email, profilePicture } = docSnap.data();
            loginUserName = `${firstName} ${lastName}`;
        } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
        }
    } catch (error) {
        console.error(error);
    }
}


const blogTitleInput = document.querySelector('#blogTitleInput');
const blogContentInput = document.querySelector('#blogContentInput');

let loginUserId;
let loginUserName;

publishBlogBtn.addEventListener('click', createBlog);

async function createBlog() {
    if (!!blogTitleInput.value && !!blogContentInput.value) {
        try {
            const blogInformation = {
                authorID: loginUserId,
                authorName: loginUserName,
                blogTitle: blogTitleInput.value.trim(),
                blogContent: blogContentInput.value.trim(),
                date: serverTimestamp()
            };

            // Add a new post in firestore database with a generated id.
            const postResponse = await addDoc(collection(db, "Blogs"), blogInformation);
            // console.log("Document written with ID: ", postResponse.id);
            blogTitleInput.value = "";
            blogContentInput.value = "";
            getAllMyBlogs();
        }
        catch (error) {
            console.error("Error adding document: ", error);
        }
    }
    else if (!blogTitleInput.value) {
        alert("Please Enter the Blog Title");
    }
    else {
        alert("Please Enter the Blog Content");
    }
}





// Get all blogs of all users
async function getAllMyBlogs() {
    blogCont.innerHTML = "";

    // const serverTimestamp = data.postTime.toDate();
    // const localTime = serverTimestamp.toLocaleTimeString();

    const blogsCollectionRef = collection(db, "Blogs");
    // Create a query to order the documents by "time" field in ascending order
    const sortedQuery = query(blogsCollectionRef, orderBy("date", "asc"));

    // Fetch the documents based on the sorted query
    const querySnapshot = await getDocs(sortedQuery);
    querySnapshot.forEach(async (doc) => {
        // console.log(doc.id, " => ", doc.data());
        const blogId = doc.id;

        // for getting Blog Information
        const { authorID, authorName, blogTitle, blogContent, date } = doc.data();

        // get correct Blog Time
        const correctBlogDate = date.toDate().toLocaleDateString();

        // for getting Blog Author Data
        const blogAuthorInfo = await getBlogAuthorData(authorID);

        if (loginUserId === authorID) {
            // For Every Single Blog
            const singleBlog = document.createElement("div");
            singleBlog.setAttribute("class", "blog col-12");

            let singleBlogInnerContent =
                `<div class="upperArea">
            <div class="authorImage">
                <img src="${blogAuthorInfo?.profilePic || "../Assets/Avatar.jpg"
                }" class="img-fluid">
            </div>
            <div class="blogHeader">
                <div class="blogTopic">
                    <p class="m-0">${blogTitle}</h1>
                </div>
                <div class="blogInfo">
                    <p class="m-0">${blogAuthorInfo?.firstName} ${blogAuthorInfo?.lastName}  - ${correctBlogDate}</p>
                </div>
            </div>
            </div>
    
            <div class="middleArea">
                <div class="blogContent">
                    <p class="m-0">${blogContent}</p>
                    </div>
                    </div>
    
            <div class="lowerArea">
                <div class="blogButtons">
                    <button class="deleteBlogBtn" onclick="deleteBlog('${blogId}')">Delete</button>
                    <button class="editBlogBtn" onclick="editBlogModalOpen('${blogId}')">Edit</button>
                </div>
            </div>`;

            // console.log(post);

            singleBlog.innerHTML = singleBlogInnerContent;
            blogCont.prepend(singleBlog);
        }

    });
}

// for getting Post Author Data
async function getBlogAuthorData(authorID) {
    try {
        const docRef = doc(db, "Users", authorID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // console.log("Document data:", docSnap.data());
            return docSnap.data();
        }
        else {
            // docSnap.data() will be undefined in this case
            console.log("Sorry! don't find your post author data");
        }
    }
    catch (error) {
        console.error(error);
    }
};


const overlay = document.querySelector('.overlay');
const cancelEditBlogBtn = document.querySelector('.cancelEditBlogBtn');
const editBlogTitleInput = document.querySelector('#editBlogTitleInput');
const editBlogContentInput = document.querySelector('#editBlogContentInput');
const editBlogButton = document.querySelector('.editBlogButton');


async function deleteBlog(blogID) {
    await deleteDoc(doc(db, "Blogs", blogID));
    alert("Blog deleted Successfully");
    getAllMyBlogs();
}


async function editBlogModalOpen(blogID) {
    overlay.classList.remove("hide");

    try {
        const docRef = doc(db, "Blogs", blogID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // console.log("Document data:", docSnap.data());
            const { authorID, blogTitle, blogContent, authorName, date } = docSnap.data();

            selectedEditBlogDetails = {
                editBlogID: blogID,
                editBlogTitle: blogTitle,
                editBlogContent: blogContent,
                editBlogAuthorID: authorID,
                editBlogAuthorName: authorName,
                editBlogDate: date,
            };

            if (blogTitle && blogContent) {
                editBlogTitleInput.value = blogTitle;
                editBlogContentInput.value = blogContent.trim();
            };
        }
        else {
            // docSnap.data() will be undefined in this case
            console.log("Sorry! don't find your post author data");
        }
    } catch (error) {
        console.error(error);
    }
}

let selectedEditBlogDetails;

editBlogButton.addEventListener("click", async () => {
    const {
        editBlogID,
        editBlogTitle,
        editBlogContent,
        editBlogAuthorID,
        editBlogAuthorName,
        editBlogDate
    } = selectedEditBlogDetails;

    try {
        const response = await setDoc(doc(db, "Blogs", editBlogID), {
            authorID: editBlogAuthorID,
            authorName: editBlogAuthorName,
            blogContent: editBlogContentInput.value,
            blogTitle: editBlogTitleInput.value,
            date: editBlogDate
        });

        alert("Your Blog edit Successfully");
        getAllMyBlogs();
        overlay.classList.add("hide");
        editBlogTitleInput.value = "";
        editBlogContentInput.value = "";
    }
    catch (error) {
        console.error("Error adding document: ", error);
    }
})

cancelEditBlogBtn.addEventListener("click", () => {
    overlay.classList.add("hide");
})


window.deleteBlog = deleteBlog;
window.editBlogModalOpen = editBlogModalOpen;