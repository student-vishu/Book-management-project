import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router";
import '../../styles/BookReviewModal.css';
import useApiUrl from './useApiUrl';

const BookReviewModal = ({ show, onClose, book, userReview }) => {

    const baseUrl = useApiUrl()
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [reviewSubmited, setReviewSubmited] = useState(false)


    useEffect(() => {
        if (userReview) {
            setRating(userReview?.rating);
            setReviewText(userReview?.reviewText);
        } else {
            setReviewSubmited(false)
            setRating(0);
            setReviewText("");
        }
    }, [show, userReview])

    const navigate = useNavigate()

    if (!show || !book) return null;


    const handleSubmit = async () => {
        if (!rating || !reviewText.trim()) {
            setSuccessMessage("Please select a rating and write a review.");
            setTimeout(() => {
                setSuccessMessage(null)
            }, 2000);
            return;
        }

        // You can send this data to your backend here
        const reviewData = {
            bookId: book._id,
            rating: rating,
            comment: reviewText
        }

        try {
            const response = await fetch(`${baseUrl}/api/v1/review/createReview`, {
                method: "POST",
                body: JSON.stringify(reviewData), // Send bookId in the request body
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to fetch review data");
            }

            const responseData = await response.json();
            // console.log(responseData);
            setSuccessMessage("✅ Review successfully submitted!");
            setTimeout(() => {
                setSuccessMessage(null)
            }, 2000);

            userReview = {
                rating: responseData?.data?.review[0].rating,
                reviewText: responseData?.data?.review[0].comment
            }

            setReviewSubmited(true)
            // userReview = responseData.data
            return responseData;
        } catch (error) {
            console.log("Error fetching book review:", error);
            return null;
        }
    };

    const readBook = (id) => {
        if (rating && reviewText && !userReview) {
            // setSuccessMessage("✅ Review successfully submitted!");
            handleSubmit()
        }
        setTimeout(() => {
            navigate(`/BookDisplay?Book=${id}`)
            onClose()
        }, 1000);
    }

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    {successMessage ?
                        <div className='success-msg'>
                            <h1>{successMessage}</h1>
                        </div>

                        : null}
                    <button className="close-btn" onClick={onClose}>✖</button>
                    <div className='book-detail'>
                        <div className='book-img'>
                            <img src={book.coverImage} alt="Book Cover" className="modal-book-image" />
                        </div>
                        <div className='book-info'>
                            <div className='book-content'>
                                <h2 className="modal-book-title">{book.bookName}</h2>
                                <p className="modal-author">By {book.author}</p>
                                <div className="star-rating">
                                    <div className='rating'>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`star ${hover !== null ? (star <= hover ? 'filled' : '') : (star <= rating ? 'filled' : '')}`}
                                                onClick={!userReview ? () => setRating(star) : undefined}
                                                onMouseEnter={!userReview ? () => setHover(star) : undefined}
                                                onMouseLeave={!userReview ? () => setHover(null) : undefined}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>


                                    {userReview ? (
                                        <p className="read-only-review">{userReview.reviewText}</p>
                                    ) : (
                                        <textarea
                                            placeholder="Write your review..."
                                            className="review-input"
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            readOnly={reviewSubmited ? true : false}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="modal-buttons">
                                {!userReview && reviewText && rating && !reviewSubmited && (
                                    <div className="review-btn">
                                        <button className="btn primary" onClick={handleSubmit}>Submit Review</button>
                                    </div>
                                )}
                                <div className='book-btn'>
                                    <button className="btn primary" onClick={() => alert("Added to cart")}>Add to Cart</button>
                                    <button className="btn success" onClick={() => readBook(book._id)}>Read Book</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* <CommentsModal isOpen={isOpen} setIsOpen={setIsOpen} /> */}
            </div >

        </>
    );
};



export default BookReviewModal;
