import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../../styles/pages_styles/UserProfile.css";
import useApiUrl from "../commonComponet/useApiUrl";
import Loader from "../commonComponet/Loader"
import BookReviewModal from "../commonComponet/BookReviewModal";

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
    const [readLeater, setReadLeater] = useState(false)


    useEffect(() => {

        const user =
            JSON.parse(localStorage.getItem('userLogin')) ||
            JSON.parse(localStorage.getItem('userAdminLogin')) || null;
        setUserData(user?._id || null);
        fetchBooks(user?._id);
        fetchReadLaterBook(user?._id);
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role"); // Get role from localStorage

        let apiEndpoint = role === "admin"
            ? `${baseUrl}/api/v1/users/getAdminProfile`
            : `${baseUrl}/api/v1/users/current-user`;

        setLoading(true)

        fetch(apiEndpoint, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            credentials: "include",
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                // console.log("API Response:", data);
                setProfile(data.data || {});
                setLoading(false)
            })
            .catch(error => console.error("Error fetching profile:", error));
    }, [!successMessage ]);

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
            const res = await fetch(`${baseUrl}/api/v1/books/getAllBooks`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch books');
            const data = await res.json();

            // console.log("user",data);
            // console.log("user id",userData);
            const userBooks = data?.data.filter(r => r?.user === userData);
            if (userBooks) {
                setLoading(false);
                
                setBookData(userBooks || []);
            }
            
        } catch (err) {
            setLoading(false);
            console.error('Fetch Error:', err);
        }
    };


    const fetchBookReview = async (bookId) => {
        if (!bookId || !userData) return; // Ensure userData is available

        try {
            const res = await fetch(`${baseUrl}/api/v1/review/${bookId}`);
            // if (!res.ok) throw new Error('Failed to fetch review');
            const data = await res.json();

            if (!data?.data?.review) return;

            const userReview = data.data.review.find(r => r.user?._id === userData);
            if (userReview) {
                setUserReview({
                    rating: userReview.rating,
                    reviewText: userReview.comment,
                });
            }
        } catch (err) {
            console.error('Review Fetch Error:', err);
        }
    };

    const fetchReadLaterBook = async (userData) => {

        try {
            const res = await fetch(`${baseUrl}/api/v1/wishlist/getWishlistItem`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch review');
            const responseData = await res.json();
            // console.log(responseData);


            const userReadBooks = responseData?.data.filter(r => r?.user === userData);
            // console.log("user read later book", userReadBooks);

            if (userReadBooks) {
                setReadLaterbookData(userReadBooks);
            }
        } catch (err) {
            console.error('Review Fetch Error:', err);
        }
    };

    const handleUpdateProfile = async (values) => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        let updateEndpoint = role === "admin"
            ? `${baseUrl}/api/v1/users/updateAdminProfile/${profile._id}`
            : `${baseUrl}/api/v1/users/updateUserProfile/${profile._id}`;
        setLoading(true)
        
        try {
            const response = await fetch(updateEndpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    _id: profile._id,
                    ...values,
                }),
            });
            
            if (!response.ok) {
                throw new Error("Failed to update profile");
            }
            
            if (response.ok) {
                setLoading(false)
                setSuccessMessage("profile updated successfully")
                setProfile({ ...profile, ...values });
                setIsEditing(false);
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
                localStorage.setItem("userLogin", JSON.stringify({ ...profile, ...values }))
            }
        } catch (error) {
            setLoading(true)
            console.error("Error updating profile:", error);
        }
    };

    const deleteBook = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/v1/books/${id}`, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch books');
            const response = await res.json();
            // console.log("delete", response)
            if (response.statuscode === 200) {
                setLoading(false)
                setSuccessMessage("book remove susseccfully")
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
                toggleModal()
            }
        } catch (err) {
            setLoading(false)
            setSuccessMessage("unchecked error")
            setTimeout(() => {
                setSuccessMessage(null)
            }, 2000);
            console.error('Fetch Error:', err);
        }
    }

    const deleteReadLaterBook = async (readLaterBookId) => {
        setLoading(true);

        // console.log(readLaterBookId);
        // console.log("read later book", readLaterBookId);


        try {
            const res = await fetch(`${baseUrl}/api/v1/wishlist/${readLaterBookId}`, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch review');
            const responseData = await res.json();
            // console.log(responseData);

            if (res.ok) {
                setSuccessMessage("book remove susseccfully")
                setLoading(false)
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
                toggleModal()
            }
        } catch (err) {
            setLoading(false)
            console.error('Review Fetch Error:', err);
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
                <img src="/images/author-image.png" alt="User Profile" className="user-profile-image" />

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
            <div className="my-book">
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
            <div className="ReadLater-book">
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
                <div className="user-book">
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
