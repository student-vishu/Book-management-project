import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../../styles/pages_styles/UserProfile.css";
import useApiUrl from "../commonComponet/useApiUrl";
import Loader from "../commonComponet/Loader"
import BookReviewModal from "../commonComponet/BookReviewModal";
import { deleteApiData, getApiData, postApiImageData, putApiUserProfileUpdate } from "../../config";
import { NavLink } from "react-router";

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .matches(/^[A-Za-z\s]+$/, "Name cannot contain numbers")
        .required("Name is required"),
    email: Yup.string()
        .email("Invalid email format")
        .matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, "Invalid email format")
        .required("Email is required"),
    contactNo: Yup.string()
        .matches(/^\d+$/, "Contact must contain only numbers")
        .min(10, "Contact must be exactly 10 digits")
        .max(10, "Contact must be exactly 10 digits")
        .required("Contact is required"),
});

const UserProfile = () => {
    const baseUrl = useApiUrl();
    const [profile, setProfile] = useState({
        _id: "",
        name: "",
        email: "",
        contactNo: "",
        role: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const [bookData, setBookData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [userData, setUserData] = useState(null);
    const [readLaterbookData, setReadLaterbookData] = useState(null);
    const [user, setUser] = useState(false);
    const [readLeater, setReadLeater] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [userIdForImageChange, setuserIdForImageChange] = useState(null)


    useEffect(() => {
        const user =
            JSON.parse(localStorage.getItem('userLogin')) ||
            JSON.parse(localStorage.getItem('userAdminLogin')) || null;

        if (user?._id) {
            setUserData(user._id);
            fetchBooks(user._id);
            fetchReadLaterBook(user._id);
            setuserIdForImageChange(user._id);
            fetchUserProfile(); // Only call if user exists
        }
    }, []);

    const getImageData = async (imageId) => {
        if (imageId) {

            try {
                const res = await getApiData(`${baseUrl}/api/v1/profileImage/getProfileImage/${imageId}`, { withCredentials: true })

                if (res && res?.data) {
                    if (res?.data?.image && res?.data?.image !== "") {
                        setProfileImage(res?.data?.image)
                    } else {
                        setProfileImage("/images/author-image.png")
                    }
                }

            } catch (error) {
                console.error('Review Fetch Error:', error);
            }

        }
    }

    const fetchUserProfile = async () => {
        try {
            const res = await getApiData(`${baseUrl}/api/v1/users/current-user`, { withCredentials: true, })

            if (res && res?.data) {
                setProfile(res?.data);
                if (res?.data._id) {
                    getImageData(res?.data._id)
                }
            }

        } catch (error) {
            console.error('Review Fetch Error:', error);
        }
    }

    const toggleModal = (book, name) => {
        setUserReview(null);
        setUser(false)
        setReadLeater(false)
        if (book) {
            fetchBookReview(book?._id);
            setSelectedBook(book);
        }
        // console.log(name)
        if (name === "user") {
            setUser(true)
            setReadLeater(false)
        } else {
            setUser(false)
            setReadLeater(name)
        }
        setModalOpen(!modalOpen);
    };

    const fetchBooks = async (userData) => {
        setLoading(true);

        try {
            const res = await getApiData(`${baseUrl}/api/v1/books/getAllBooks`, {
                withCredentials: true,
            });

            if (res && res?.statuscode === 200) {
                if (res && res?.data) {
                    const userBooks = res?.data?.filter(r => r?.user === userData);
                    if (userBooks) {
                        setBookData(userBooks || []);
                    }
                }
                setLoading(false);
            } else {
                console.error('Failed to fetch books');
            }

        } catch (error) {
            setLoading(false);
            console.error('Fetch Error:', error);
        }
    };


    const fetchBookReview = async (bookId) => {
        if (bookId) {
            try {
                const res = await getApiData(`${baseUrl}/api/v1/review/${bookId}`)

                if (res && res.statuscode === 200) {
                    if (res && res.data && res.data.review) {
                        const userReview = res.data?.review.find((r) => r.user._id === userData)
                        if (userReview) {
                            // console.log("review",userReview )
                            setUserReview({
                                rating: userReview.rating,
                                reviewText: userReview.comment,
                            })
                        }
                    }
                } else {
                    console.error('Failed to fetch books review');
                }

            } catch (error) {
                console.error('Review Fetch Error:', error);
            }
        } else {
            console.error("❌ Error: bookId is missing in API call!");

        }
    };

    const fetchReadLaterBook = async (userData) => {

        try {
            const res = await getApiData(`${baseUrl}/api/v1/wishlist/getWishlistItem`, {
                withCredentials: true
            })
            if (res && res.statuscode === 200) {
                if (res && res.data) {
                    const userReadBooks = res.data?.filter((r) => r.user === userData)
                    if (userReadBooks) {
                        setReadLaterbookData(userReadBooks);
                    }
                }

            } else {
                console.error('Failed to fetch review');
            }

        } catch (error) {
            console.error('Review Fetch Error:', error);

        }

    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);

        const userData = {
            _id: profile._id,
            ...values,
        }

        try {
            const res = await putApiUserProfileUpdate(`${baseUrl}/api/v1/users/updateUserProfile/${profile._id}`, userData, {
                withCredentials: true
            })

            console.log("update profile", res)

            if (res && res.statuscode === 200) {
                setLoading(false)
                setSuccessMessage("profile updated successfully")
                setProfile({ ...profile, ...values });
                setIsEditing(false);

                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);

                // Save updated profile in localStorage
                localStorage.setItem("userLogin", JSON.stringify({ ...profile, ...values }))
            } else {
                setLoading(false)
                console.error("Failed to updating profile");
            }

        } catch (error) {
            setLoading(false)
            console.error("Error updating profile:", error);
        }

    };

    const deleteBook = async (id) => {
        setLoading(true);
        try {
            const res = await deleteApiData(`${baseUrl}/api/v1/books/${id}`, {
                withCredentials: true
            })

            setLoading(false)
            if (res && res.statuscode === 200) {
                setSuccessMessage("book remove susseccfully");
                setBookData(prevBooks => prevBooks.filter(book => book._id !== id));
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
                toggleModal()
            } else {
                setSuccessMessage("Unexpected error occurred");
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
            }

        } catch (error) {
            setLoading(false)
            setSuccessMessage("Unexpected error occurred");
            setTimeout(() => {
                setSuccessMessage(null)
            }, 2000);
            console.error('Delete Book Error:', error);
        }
    }

    const deleteReadLaterBook = async (readLaterBookId) => {
        setLoading(true);
        try {
            const res = await deleteApiData(`${baseUrl}/api/v1/wishlist/${readLaterBookId}`, {
                withCredentials: true
            })

            setLoading(false)
            if (res && res.statuscode === 200) {
                setSuccessMessage("read later book remove susseccfully")
                setLoading(false)
                setReadLaterbookData(prevBooks => prevBooks.filter(book => book._id !== readLaterBookId));
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
                toggleModal()
            } else {
                setSuccessMessage("Unexpected error occurred");
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
            }

        } catch (error) {
            setLoading(false)
            setSuccessMessage("Unexpected error occurred");
            setTimeout(() => {
                setSuccessMessage(null)
            }, 2000);
            console.error('Delete Book Error:', error);
        }
    };


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Preview image before uploading
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl); // Set preview image

        // Upload the image
        handleImageUpload(file);
    };

    const handleImageUpload = async (file) => {
        setLoading(true);
        let uploadEndpoint = `${baseUrl}/api/v1/profileImage/uploadProfileImage/${userIdForImageChange}`;

        const formData = new FormData();
        formData.append("profileImage", file);


        try {
            const res = await postApiImageData(uploadEndpoint, formData,
                {
                    withCredentials: true
                },
            )

            setLoading(false)
            if (res && res.statuscode === 201) {
                setSuccessMessage("Image uploaded successfully!");
                setProfileImage(res.data.image);
                setTimeout(() => {
                    setSuccessMessage("");
                }, 2000);
            }
        } catch (error) {
            setLoading(false)
            console.log("error", error)
        }
    };

    return (
        <div className="user-profile-container">
            {
                successMessage ?
                    <div className='message'>
                        <h1>{successMessage}</h1>
                    </div>
                    : null
            }
            <h1>My Profile</h1>
            <div className="user-profile-card">
                <div className="user-profile-image-container">
                    {/* Hidden file input */}
                    <input
                        type="file"
                        id="profile-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                    />

                    {/* Clickable Profile Image */}
                    <label htmlFor="profile-upload">
                        <img
                            src={profileImage || "/images/author-image.png"}
                            alt="User Profile"
                            className="user-profile-image"
                            style={{ cursor: "pointer" }}
                        />
                    </label>
                </div>

                {!isEditing ? (
                    <div className="user-profile-info">
                        <h2>{profile.name}</h2>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Contact No:</strong> {profile.contactNo}</p>
                        <p><strong>Role:</strong> {profile.role}</p>
                        <button className="edit-user-profile-btn" onClick={() => setIsEditing(true, "user")}>
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <Formik
                        initialValues={{
                            name: profile.name,
                            email: profile.email,
                            contactNo: profile.contactNo,
                        }}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleUpdateProfile}
                    >
                        {({ isSubmitting, handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="user-profile-edit-form">
                                <label htmlFor="name">Name:</label>
                                <Field type="text" name="name" id="name" />
                                <ErrorMessage name="name" component="span" className="error" />

                                <label htmlFor="email">Email:</label>
                                <Field type="email" name="email" id="email" />
                                <ErrorMessage name="email" component="span" className="error" />

                                <label htmlFor="contactNo">Contact No:</label>
                                <Field type="text" name="contactNo" id="contactNo" />
                                <ErrorMessage name="contactNo" component="span" className="error" />

                                <div className="form-buttons">
                                    <button type="submit" disabled={isSubmitting} className="save-btn">
                                        Save Changes
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}

            </div>
            <div className="nav-link">
                <ul>
                    {/* Use normal anchor links instead of NavLink for internal page navigation */}
                    <li> <a href="#my-Book">My Book</a> </li>
                    <li> <a href="#read-later">Read Later Book</a> </li>
                </ul>
            </div>
            <div className="my-book" id="my-Book">
                <h1>my book</h1>
                <div className="user-book">
                    <div className='book-Container'>
                        {
                            bookData && bookData.length > 0 ?
                                (bookData?.map((item, index) => {
                                    const rating = item?.rating || 0;
                                    const percentage = (rating / 5) * 75;
                                    return (
                                        <div className='book-card' key={index} onClick={() => toggleModal(item, "user")}>
                                            <img src={item?.coverImage} alt="book-cover" />
                                            <div className='book-info'>
                                                <div className='book-reting'>
                                                    <h3 className="book-title">{item?.bookName}</h3>
                                                    <div className="rating-box">
                                                        <div className="star-wrapper">
                                                            <div className="star-background">★</div>
                                                            <div className="star-fill" style={{ width: `${percentage}%` }}>★</div>
                                                        </div>
                                                        <span className="rating-number">{item?.rating}</span>
                                                    </div>
                                                </div>
                                                <h2 className='author-name'>by {item?.author}</h2>
                                                <p className='book-amount'>₹{item?.price}</p>
                                            </div>
                                        </div>
                                    );
                                }))
                                :
                                <p>No books available</p>
                        }
                    </div>
                </div>
            </div>
            <div className="ReadLater-book" id="read-later">
                <h1>read later book</h1>
                <div className='book-Container'>
                    {
                        readLaterbookData && readLaterbookData.length > 0 ?
                            (
                                readLaterbookData?.map((item, index) => {
                                    const rating = item?.book?.rating || 0;
                                    const percentage = (rating / 5) * 75;
                                    return (
                                        <div className='book-card' key={index} onClick={() => toggleModal(item?.book, item?._id)}>
                                            <img src={item?.book?.coverImage} alt="book-cover" />
                                            <div className='book-info'>
                                                <div className='book-reting'>
                                                    <h3 className="book-title">{item?.book?.bookName}</h3>
                                                    <div className="rating-box">
                                                        <div className="star-wrapper">
                                                            <div className="star-background">★</div>
                                                            <div className="star-fill" style={{ width: `${percentage}%` }}>★</div>
                                                        </div>
                                                        <span className="rating-number">{item?.book?.rating}</span>
                                                    </div>
                                                </div>
                                                <h2 className='author-name'>by {item?.book?.author}</h2>
                                                <p className='book-amount'>₹{item?.book?.price}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                            :
                            <p>No books available</p>
                    }
                </div>

                <BookReviewModal
                    show={modalOpen}
                    onClose={() => toggleModal(null)}
                    book={selectedBook}
                    userReview={userReview}
                    deleteBook={deleteBook}
                    user={user}
                    readLeaterBookRemove={readLeater}
                    deleteReadLaterBook={deleteReadLaterBook}
                />
            </div>
            {
                loading ?
                    <Loader />
                    :
                    null
            }


        </div>
    );
};


export default UserProfile
