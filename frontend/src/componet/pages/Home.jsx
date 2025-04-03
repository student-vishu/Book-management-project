import React, { useEffect, useState } from 'react';
import "../../styles/pages_styles/Home.css";
import TopViewBook from '../commonComponet/TopViewBook';
import useApiUrl from '../commonComponet/useApiUrl';
import BookReviewModal from '../commonComponet/BookReviewModal';
import TopAuthorBook from '../commonComponet/TopAuthorBook'
import { getApiData } from '../../config';
import BookAndUserNo from '../commonComponet/BookAndUserNo';

const Home = () => {
    const baseUrl = useApiUrl();

    const [bookData, setBookData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userNoData, setUserNoData] = useState(0)
    const [bookNoData, setBookNoData] = useState(0)


    useEffect(() => {
        fetchBooks()
        const user = JSON.parse(localStorage?.getItem("userLogin")) || JSON.parse(localStorage?.getItem("userAdminLogin")) || null;
        setUserData(user._id)
    }, [!modalOpen])

    useEffect(() => {
        fetchBookNo()
        fetchUserNo()
    }, [])

    const toggalModal = (book) => {
        setUserReview(null)
        if (book) {
            fetchBookReview(book?._id);
            setSelectedBook(book);
        }
        setModalOpen(!modalOpen)

    }


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


    const fetchBooks = async () => {
        try {
            const res = await getApiData(`${baseUrl}/api/v1/books/getAllBooks`, {
                withCredentials: true,
            });

            if (res && res?.statuscode === 200) {
                if (res && res?.data) {
                    setBookData(res?.data || []);
                }
            } else {
                console.error('Failed to fetch books');
            }

        } catch (error) {
            console.error('Fetch Error:', error);
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

            <section className='book_slide block'>
                <div className='background_Book_image'>
                    <h1>
                        Welcome to our online book store<br />
                        <div className="typing-container">
                            <div className="text text-1">Designed and developed by Utsav, Vishesh, and Manan</div>
                            <div className="text text-2">Created by Manan, Utsav, and Vishesh</div>
                        </div>
                    </h1>
                </div>
            </section>

            <section className='top-view-book-display'>

                <TopViewBook
                    bookData={bookData}
                    toggalModal={toggalModal}
                />
            </section>
            <section className='our_value_section'>
                <BookAndUserNo userNoData={userNoData} bookNoData={bookNoData} />
            </section>
            <section className='top-author-book'>
                <TopAuthorBook bookData={bookData} />
            </section>

            <BookReviewModal
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                book={selectedBook}
                userReview={userReview}
                readLater={true}
            />
        </>

    )
}

export default Home
