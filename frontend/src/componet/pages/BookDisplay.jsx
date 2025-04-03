import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router';
import UserReadBook from '../commonComponet/UserReadBook';
import "../../styles/pages_styles/BookDisplay.css"
import useApiUrl from '../commonComponet/useApiUrl';
import TopAuthorBook from '../commonComponet/TopAuthorBook';
import { getApiData } from '../../config';
import BookAndUserNo from '../commonComponet/BookAndUserNo';

const BookDisplay = () => {
    const baseUrl = useApiUrl()
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const bookId = params.get('Book') || "67ed2d1171d782be4f2a885d";

    const [isOpen, setIsOpen] = useState(false);
    const [bookData, setBookData] = useState(null)
    const [reviewData, setReviwData] = useState([]);
    const [userNoData, setUserNoData] = useState(0)
    const [bookNoData, setBookNoData] = useState(0)

    useEffect(() => {
        fetchBooks()
        fetchBookReview(bookId)
        fetchBookNo()
        fetchUserNo()
    }, [])


    const fetchBooks = async () => {

        try {
            const res = await getApiData(`${baseUrl}/api/v1/books/getAllBooks`, {
                withCredentials: true,
            });

            if (res && res?.statuscode === 200) {
                setBookData(res?.data || []);
            }
            else {
                console.error('Failed to fetch books');
            }

        } catch (error) {
            console.error('Fetch Error:', error);
        }
    };

    const fetchBookReview = async (bookId) => {
        if (bookId) {
            try {
                const res = await getApiData(`${baseUrl}/api/v1/review/${bookId}`)

                // console.log(res)

                if (res && res.statuscode === 200) {
                    setReviwData(res.data.review || []);
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

    const fetchUserNo = async () => {
        try {

            const res = await getApiData(`${baseUrl}/api/v1/users/getUserCount`, {
                withCredentials: true
            })

            if (res && res.statuscode === 200) {
                if (res.data && res.data.userCount) {
                    setUserNoData(res.data.userCount)
                }
            } else {
                console.error("Falid user count")

            }

        } catch (error) {
            console.error("Error user count", error)
        }

    }
    const fetchBookNo = async () => {
        try {

            const res = await getApiData(` ${baseUrl}/api/v1/users/getBookCount`, {
                withCredentials: true
            })

            if (res && res.statuscode === 200) {
                if (res.data && res.data.bookCount) {
                    setBookNoData(res.data.bookCount)
                }
            } else {
                console.error("Falid user count")

            }

        } catch (error) {
            console.error("Error user count", error)
        }

    }



    return (
        <>
            <section className='user-Book-read'>
                <UserReadBook bookId={bookId} />
                <button className="view-comments-btn" onClick={() => setIsOpen(true)}>
                    View review
                </button>
                <CommentsModal isOpen={isOpen} setIsOpen={setIsOpen} reviewData={reviewData} />
            </section>
            <section className='our_value_section'>
                <BookAndUserNo userNoData={userNoData} bookNoData={bookNoData} />
            </section>
            <section className='top-author-book'>
                <TopAuthorBook bookData={bookData} />
            </section>
        </>
    )
}


const CommentsModal = (props) => {

    const { isOpen, setIsOpen, reviewData } = props
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);

    // console.log("review", reviewData);

    useEffect(() => {
        if (reviewData) {
            const formatted = reviewData.map((item, index) => ({
                id: index,
                user: item.user?.name,
                comment: item?.comment,
                likes: item?.likes || 0,
                rating: item?.rating || 0,
                likedByUser: false,
            }));
            setComments(formatted);
        }

    }, [reviewData]);


    const toggleLike = (id) => {
        const updated = comments.map((item) =>
            item.id === id
                ? {
                    ...item,
                    likedByUser: !item.likedByUser,
                    likes: item.likedByUser ? item.likes - 1 : item.likes + 1,
                }
                : item
        );
        setComments(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = {
            id: comments.length,
            rating: 5,
            user: "You",
            comment: commentText.trim(),
            likes: 0,
            likedByUser: false,
        };
        setComments([newComment, ...comments]);
        setCommentText("");
    };


    return (
        <>
            {/* Comments modal */}

            <div className={`comments-modal ${isOpen ? "open" : ""}`}>
                <div className="modal-header">
                    <h3>Comments</h3>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                </div>

                <div className="modal-body">
                    {comments?.length === 0 && <p className="no-comments">No comments yet.</p>}
                    {comments?.map((item) => (
                        <div key={item.id} className="comment-box">
                            <div className="comment-top">
                                <p className="username">{item?.id + 1} {item.user}</p>
                                <button
                                    className="like-btn"
                                    onClick={() => toggleLike(item.id)}
                                    title={item.likedByUser ? "Unlike" : "Like"}
                                >
                                    {item.likedByUser ? "❤️" : "🤍"}
                                </button>
                            </div>

                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={star <= item.rating ? "star filled" : "star"}>★</span>
                                ))}
                            </div>

                            <p className="comment-text">{item.comment}</p>
                            {item.likes > 0 && (
                                <p className="likes-count">
                                    {item.likes} {item.likes === 1 ? "like" : "likes"}
                                </p>
                            )}
                        </div>
                    ))}


                </div>

                <form className="comment-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button type="submit">Post</button>
                </form>
            </div>

            {isOpen && <div className="modal-backdrop" onClick={() => setIsOpen(false)} />}
        </>
    );
};

export default BookDisplay
