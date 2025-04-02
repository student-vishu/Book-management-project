import React, { useEffect, useState } from 'react';
import "../../styles/pages_styles/Home.css";
import TopViewBook from '../commonComponet/TopViewBook';
import useApiUrl from '../commonComponet/useApiUrl';
import BookReviewModal from '../commonComponet/BookReviewModal';
import TopAuthorBook from '../commonComponet/TopAuthorBook'

const Home = () => {
    const baseUrl = useApiUrl();

    const [bookData, setBookData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [userData, setUserData] = useState(null);


    useEffect(() => {
        getBookData()
        const user = JSON.parse(localStorage?.getItem("userLogin")) || JSON.parse(localStorage?.getItem("userAdminLogin")) || null;
        setUserData(user._id)
    }, [])

    const toggalModal = (book) => {
        setUserReview(null)
        if (book) {
            getBookUserReviw(book?._id);
            setSelectedBook(book);
        }
        setModalOpen(!modalOpen)

    }


    const getBookUserReviw = async (bookId) => {
        if (!bookId) {
            console.error("❌ Error: bookId is missing in API call!");
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/v1/review/${bookId}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const responseData = await response.json();

            // console.log(responseData.data)
            // console.log(userData)

            if (responseData?.data && userData) {
                const review = responseData.data.review;
                const userReview = review?.find((item) => userData === item?.user._id);

                if (userReview) {
                    setUserReview({
                        rating: userReview.rating,
                        reviewText: userReview.comment
                    });
                }
            }

            // console.log("Book Reviews:", responseData);
            return responseData;
        } catch (error) {
            console.error("Error fetching book review:", error.message);
        }
    };



    const getBookData = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/v1/books/getAllBooks`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                console.error("API Error:", response.status, response.statusText);
                return;
            }

            const Bookdata = await response.json();
            setBookData(Bookdata?.data)

        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

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
