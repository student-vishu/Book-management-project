import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router";
import '../../styles/BookReviewModal.css';
import useApiUrl from './useApiUrl';
import { postApiData } from '../../config';
import { number } from 'yup';

const BookReviewModal = ({ show, onClose, book, userReview, readLater, user, deleteBook, readLeaterBookRemove, deleteReadLaterBook }) => {
    const baseUrl = useApiUrl();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [reviewSubmited, setReviewSubmited] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userId, setUserId] = useState("");
    const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false)

    useEffect(() => {
        const storedUser = JSON.parse(localStorage?.getItem("userLogin")) || null;
        setUserId(storedUser?._id || "");

        if (userReview) {
            setRating(user ? book?.rating : userReview?.rating);
            setReviewText(userReview?.reviewText);
        } else {
            setReviewSubmited(false);
            setRating(0);
            setReviewText("");
        }
    }, [show, userReview, book, user]);

    const navigate = useNavigate();

    if (!show || !book) return null;

    const handleSubmit = async () => {
        if (rating || reviewText.trim() !== "") {

            const reviewData = { bookId: book._id, rating, comment: reviewText };

            try {
                const response = await postApiData(`${baseUrl}/api/v1/review/createReview`, reviewData, {
                    withCredentials: true
                });

                if (response && response.statuscode === 201) {
                    setSuccessMessage("✅ Review successfully submitted!");
                    setReviewSubmited(true);
                } else {
                    console.log("Failed to fetch review data ");
                }
                setTimeout(() => setSuccessMessage(""), 2000);
            } catch (error) {
                console.log("Error fetching book review:", error);
            }
        } else {
            setSuccessMessage("Please select a rating and write a review.");
            setTimeout(() => setSuccessMessage(""), 2000);
        }

    };

    const readLaterBook = async (id, userid) => {
        if (!id || !userid) return console.error("❌ Missing bookId or userId!");

        const readLaterBookData = { bookId: id, userId: userid };

        try {
            const response = await postApiData(`${baseUrl}/api/v1/wishlist/addToWishlist`, readLaterBookData, {
                withCredentials: true
            });


            if (response && (response.statuscode === 200 || response.statuscode === 201)) {
                setSuccessMessage(response.statuscode === 201 ? "✅ Book added to Read Later!" : "✅ Book already in Read Later!");
            } else {
                console.error("Failed to add book to wishlist")
            }
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error) {
            console.error("Error adding book to Read Later:", error);
        }
    };

    const readBook = (id) => {
        if (rating && reviewText && !userReview) {
            handleSubmit();
        }
        setTimeout(() => {
            navigate(`/BookDisplay?Book=${id}`);
            onClose();
        }, 1000);
    };



    const updateBook = (id) => {
        const updateData = localStorage?.getItem("userUpdateBookData") || null
        if (updateData) {
            setShowUpdateConfirmModal(true)
        } else {
            navigate(`/UpdateBook?Book=${id}`);
            onClose();
        }
    };



    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    {successMessage && <div className="success-msg"><h1>{successMessage}</h1></div>}
                    <button className="close-btn" onClick={onClose}>✖</button>
                    <div className="book-detail">
                        <div className="book-img">
                            <img src={book.coverImage} alt="Book Cover" className="modal-book-image" />
                        </div>
                        <div className="book-info">
                            <div className="book-content">
                                <h2 className="modal-book-title">{book.bookName}</h2>
                                <p className="modal-author">By {book.author}</p>
                                {user && <p>Published Year: {book.publishedYear}</p>}
                                <div className="star-rating">
                                    <div className="rating">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}

                                                className={`star ${hover !== null
                                                    ? star <= hover
                                                        ? "filled"
                                                        : ""
                                                    : (star <= Math.floor(rating) ? 'filled'
                                                        : (star - 0.5 === rating ? 'half-filled' : ''))
                                                    }`}
                                                onClick={
                                                    !user && !userReview && !reviewSubmited
                                                        ? () => setRating(star)
                                                        : undefined
                                                }
                                                onMouseEnter={
                                                    !user && !userReview && !reviewSubmited
                                                        ? () => setHover(star)
                                                        : undefined
                                                }
                                                onMouseLeave={
                                                    !user && !userReview && !reviewSubmited
                                                        ? () => setHover(null)
                                                        : undefined
                                                }
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    {!user ? (
                                        userReview ? (
                                            <p className="read-only-review">{userReview.reviewText}</p>
                                        ) : (
                                            <textarea
                                                placeholder="Write your review..."
                                                className="review-input"
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                readOnly={reviewSubmited}
                                            />
                                        )
                                    ) : null}

                                    {/* {user ? (
                                        // Display book's overall rating when user exists
                                        <p className="book-rating">Overall Rating: {book.rating} / 5</p>
                                    ) : userReview ? (
                                        // Display user's review if it exists
                                        <p className="read-only-review">{userReview.reviewText}</p>
                                    ) : (
                                        // Allow writing a review if no review is submitted
                                        !reviewSubmited && (
                                            <textarea
                                                placeholder="Write your review..."
                                                className="review-input"
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                            />
                                        )
                                    )} */}
                                </div>


                            </div>
                            <div className="modal-buttons">
                                {!userReview && reviewText && rating && !reviewSubmited ? (
                                    <div className="review-btn">
                                        <button className="btn primary" onClick={handleSubmit}>Submit Review</button>
                                    </div>
                                ) : null}
                                <div className="book-btn">
                                    {readLater ? (
                                        <button className="btn primary" onClick={() => readLaterBook(book._id, userId)}>Read Later</button>
                                    ) : null
                                    }
                                    {
                                        !readLater && !readLeaterBookRemove &&
                                        (
                                            <button className="btn primary" onClick={() => updateBook(book._id)}>Update Book</button>
                                        )}
                                    {readLeaterBookRemove ? (
                                        <button className="btn danger" onClick={() => setShowConfirmModal(true)}>remove ReadLater</button>
                                    ) : null}
                                    <button className="btn success" onClick={() => readBook(book._id)}>Read Book</button>
                                </div>
                                {user && (
                                    <div className="book-btn">
                                        <button className="btn danger" onClick={() => setShowConfirmModal(true)}>Remove Book</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {
                showUpdateConfirmModal && (
                    <div className="userBook-addBook-modal-overlay">
                        <div className="modal-content scale-in">
                            <span className="close-icon" onClick={() => setShowUpdateConfirmModal(false)}>✖</span>
                            <p>You have already selected a book for updating. Are you sure you want to discard the current selection and open this book for updating instead?</p>
                            <div className="modal-actions">
                                <button
                                    className="btn-confirm"
                                    onClick={() => {
                                        setShowUpdateConfirmModal(false);
                                        localStorage.removeItem("userUpdateBookData");
                                        navigate(`/UpdateBook?Book=${book._id}`);
                                    }}>
                                    Yes, Update

                                </button>
                                <button className="btn-cancel" onClick={() => setShowUpdateConfirmModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div >
                )
            }

            {
                showConfirmModal && (
                    <div className="userBook-addBook-modal-overlay">
                        <div className="modal-content scale-in">
                            <span className="close-icon" onClick={() => setShowConfirmModal(false)}>✖</span>
                            <p>Are you sure you want to remove this book?</p>
                            <div className="modal-actions">
                                <button className="btn-confirm"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        if (readLeaterBookRemove) {
                                            deleteReadLaterBook(readLeaterBookRemove);
                                        } else {
                                            deleteBook(book._id);
                                        }
                                    }}>Yes, Remove</button>
                                <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default BookReviewModal;
