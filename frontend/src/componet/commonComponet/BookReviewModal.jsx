import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router";
import '../../styles/BookReviewModal.css';
import useApiUrl from './useApiUrl';

const BookReviewModal = ({ show, onClose, book, userReview, readLater, user, deleteBook, readLeaterBookRemove, deleteReadLaterBook }) => {
    const baseUrl = useApiUrl();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [reviewSubmited, setReviewSubmited] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userId, setUserId] = useState("");

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
        if (!rating || !reviewText.trim()) {
            setSuccessMessage("Please select a rating and write a review.");
            setTimeout(() => setSuccessMessage(""), 2000);
            return;
        }

        const reviewData = { bookId: book._id, rating, comment: reviewText };

        try {
            const response = await fetch(`${baseUrl}/api/v1/review/createReview`, {
                method: "POST",
                body: JSON.stringify(reviewData),
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to fetch review data");

            const responseData = await response.json();
            setSuccessMessage("✅ Review successfully submitted!");
            setTimeout(() => setSuccessMessage(""), 2000);

            setReviewSubmited(true);
            return responseData;
        } catch (error) {
            console.log("Error fetching book review:", error);
        }
    };

    const readLaterBook = async (id, userid) => {
        if (!id || !userid) return console.error("❌ Missing bookId or userId!");

        const readLaterBookData = { bookId: id, userId: userid };

        try {
            const response = await fetch(`${baseUrl}/api/v1/wishlist/addToWishlist`, {
                method: "POST",
                body: JSON.stringify(readLaterBookData),
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to add book to wishlist");

            const responseData = await response.json();
            setSuccessMessage(responseData.statuscode === 201 ? "✅ Book added to Read Later!" : "✅ Book already in Read Later!");
            setTimeout(() => setSuccessMessage(""), 2000);
            return responseData;
        } catch (error) {
            console.log("Error adding book to Read Later:", error);
        }
    };

    const readBook = (id) => {
        if (rating && reviewText && !userReview) handleSubmit();
        setTimeout(() => {
            navigate(`/BookDisplay?Book=${id}`);
            onClose();
        }, 1000);
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
                                                className={`star ${hover !== null ? (star <= hover ? 'filled' : '') : (star <= Math.floor(rating) ? 'filled' : (star - 0.5 === rating ? 'half-filled' : ''))}`}
                                                onClick={!userReview ? () => setRating(star) : undefined}
                                                onMouseEnter={!userReview ? () => setHover(star) : undefined}
                                                onMouseLeave={!userReview ? () => setHover(null) : undefined}
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
                                </div>
                            </div>
                            <div className="modal-buttons">
                                {!userReview && reviewText && rating && !reviewSubmited && (
                                    <div className="review-btn">
                                        <button className="btn primary" onClick={handleSubmit}>Submit Review</button>
                                    </div>
                                )}
                                <div className="book-btn">
                                    {readLater ? (
                                        <button className="btn primary" onClick={() => readLaterBook(book._id, userId)}>Read Later</button>
                                    ) : null
                                    }
                                    {
                                        !readLater && !readLeaterBookRemove &&
                                        (
                                            <button className="btn primary" onClick={() => readBook(book._id)}>Update Book</button>
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
            </div>

            {showConfirmModal && (
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
            )}
        </>
    );
};

export default BookReviewModal;
