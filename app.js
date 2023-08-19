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
} from "./Firebase-Setup/firebase-Config.js";

const loginBtn = document.querySelector(".loginBtn");
loginBtn.addEventListener("click", () => {
    window.location.href = "./SignIn-Signup/index.html"
})

/*  If a user is already logged in to a device
    so the user don't need to log in to that device again 
    until the user wouldn't logout  */
const loginState = JSON.parse(localStorage.getItem("login-State"));
if (!!loginState) {
    window.location.href = "./LoginDashboard/index.html";
}


// For get all previous blogs
const blogCont = document.querySelector(".blogCont");
getAllBlogs();

// Get all blogs of all users
async function getAllBlogs() {
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

        // For Every Single Blog
        const singleBlog = document.createElement("div");
        singleBlog.setAttribute("class", "blog col-12");

        let singleBlogInnerContent =
            `<div class="upperArea">
            <div class="authorImage">
                <img src="${blogAuthorInfo?.profilePicture || "../Assets/Avatar.jpg"
            }" class="img-fluid">
            </div>
            <div class="blogHeader">
                <div class="blogTopic">
                    <p class="m-0">${blogTitle}</h1>
                </div>
                <div class="blogInfo">
                    <p class="m-0">${blogAuthorInfo?.firstName} ${blogAuthorInfo?.lastName} - ${correctBlogDate}</p>
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
                    <button class="seeAllBlogsBtn" onclick="seeAllBlogsThisUser('${blogId}')">see all from this user</button>
                </div>
            </div>`;

        // console.log(post);

        singleBlog.innerHTML = singleBlogInnerContent;
        blogCont.prepend(singleBlog);
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