import React, { useEffect, useState } from 'react';
import '../../styles/UserReadBook.css';
import useApiUrl from './useApiUrl';

// const splitDescriptionIntoPages = (desc, maxLength = 969) => {
//     const sentences = desc.match(/[^.!?]+[.!?]+(\s+|$)/g) || [desc]; // sentence-based split
//     const pages = [];
//     let currentPage = '';

//     for (let sentence of sentences) {
//         if ((currentPage + sentence).trim().length <= maxLength) {
//             currentPage += sentence;
//         } else {
//             pages.push(currentPage.trim());
//             currentPage = sentence;
//         }
//     }

//     if (currentPage.trim()) {
//         pages.push(currentPage.trim());
//     }

//     return pages;
// };


const splitDescriptionIntoPages = (desc, maxLength = 969) => {
    // Split by sentence-ending punctuation but keep the punctuation
    const sentences = desc.match(/[^.!?]+[.!?]*\s*/g) || [desc];
    const pages = [];
    let currentPage = '';

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];

        if ((currentPage + sentence).trim().length <= maxLength) {
            currentPage += sentence;
        } else {
            if (currentPage.trim()) {
                pages.push(currentPage.trim());
            }
            // If the sentence itself is longer than maxLength, we split it further
            if (sentence.length > maxLength) {
                let start = 0;
                while (start < sentence.length) {
                    const chunk = sentence.slice(start, start + maxLength);
                    pages.push(chunk.trim());
                    start += maxLength;
                }
                currentPage = '';
            } else {
                currentPage = sentence;
            }
        }
    }

    if (currentPage.trim()) {
        pages.push(currentPage.trim());
    }

    return pages;
};



const UserReadBook = (props) => {
    const [isFlipping, setIsFlipping] = useState(false);
    const [flippedPages, setFlippedPages] = useState([]);
    const [flippingPage, setFlippingPage] = useState(null); // NEW
    const [bookData, setbookData] = useState({})

    const baseUrl = useApiUrl();
    const { bookId } = props
    // console.log(bookId)
    const getBookData = async (bookId) => {
        try {
            const response = await fetch(`${baseUrl}/api/v1/books/getBookById?_id=${bookId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                // credentials: "include" // Important for cookies and sessions
            });

            if (!response.ok) {
                console.error("API Error:", response.status, response.statusText);
                return;
            }

            const Bookdata = await response.json();
            // console.log("JSON Data:", Bookdata);
            setbookData(Bookdata.data)
            // console.log(bookData);
            

        } catch (error) {
            console.error("Fetch Error:", error);
        }

    }
    

    useEffect(() => {

        // console.log(bookId)
        if (bookId) {
            getBookData(bookId)
        }

    }, [bookId])




    const descriptionPages = splitDescriptionIntoPages(bookData.description || '');
    const descriptionPairs = [];
    for (let i = 0; i < descriptionPages.length; i += 2) {
        descriptionPairs.push({
            front: descriptionPages[i] ? <p className='book-description'>{descriptionPages[i]}</p> : <div></div>,
            back: descriptionPages[i + 1] ? <p className='book-description'>{descriptionPages[i + 1]}</p> : <div></div>
        });
    }

    const pages = [
        {
            front: <img src={bookData.coverImage} alt="cover" className="cover-image" />,
            back: (
                <div className="meta-content">
                    <div className='book-author-info'>
                        <h2>{bookData.bookName}</h2>
                        <p>By {bookData.author}</p>
                    </div>
                    <div className='book-info'>
                        <p>Published: {bookData.publishedYear}</p>
                        <p>Price: ₹{bookData.price}</p>
                    </div>
                </div>
            )
        },
        {
            front: (
                <div className="meta-content">
                    <div className='book-author-info'>
                        <h2>{bookData.bookName}</h2>
                        <p>By {bookData.author}</p>
                    </div>
                    <div className='book-info'>
                        <p>Published: {bookData.publishedYear}</p>
                        <p>Price: ₹{bookData.price}</p>
                    </div>
                </div>
            ),
            back: <div></div>
        },
        ...descriptionPairs,
        {
            front: (
                <div className="summary-content">
                    <h3>About the Book</h3>
                    <p>A thrilling story that keeps you hooked till the end.</p>
                </div>
            ),
            back: <img src={bookData.coverImage} alt="back cover" className="cover-image" />
        }
    ];

    const flipPage = (index) => {
        if (isFlipping || flippingPage !== null) return;

        setIsFlipping(true);
        setFlippingPage(index);

        if (!flippedPages.includes(index)) {
            // Flip forward
            setFlippedPages(prev => [...prev, index]);
        } else {
            // Flip backward
            setFlippedPages(prev => prev.filter(i => i !== index));
        }

        // Wait for flip animation to finish (2s), then lower z-index
        setTimeout(() => {
            setFlippingPage(null);
            setIsFlipping(false);
        }, 200);
    };


    return (
        <div className='user-Book-read'>
            <div className='book-contener'>
                <button
                    className={`btn ${flippedPages.length > 0 && flippedPages.length !== pages.length ? "prev_button_move" : ""}  `}
                    onClick={() => {
                        const last = flippedPages[flippedPages.length - 1];
                        if (last >= 0) flipPage(last);
                    }}
                    disabled={isFlipping || flippedPages.length === 0}
                >
                    <i className="fa fa-arrow-circle-left"></i>
                </button>

                <div className={`book ${flippedPages.length !== 0 ? "book_move" : ""} ${flippedPages.length === pages.length ? "book_curntlocation" : ""}`}>
                    {pages.map((page, index) => {
                        const isFlipped = flippedPages.includes(index);
                        const isMidFlip = flippingPage === index;

                        const zIndex = isMidFlip
                            ? pages.length + 10
                            : isFlipped
                                ? index
                                : pages.length - index;

                        return (
                            <div
                                className={`page ${isFlipped ? 'flipped' : ''}`}
                                key={index}
                                style={{ zIndex }}
                            >
                                <div className="front">
                                    <div className="front-content">{page.front}</div>
                                </div>
                                <div className="back" onClick={() => flipPage(index)}>
                                    <div className="back-content">{page.back}</div>
                                </div>
                            </div>
                        );
                    })}

                </div>

                <button
                    className={`btn ${flippedPages.length > 0 && flippedPages.length !== pages.length ? "next_button_move" : ""}  `}
                    onClick={() => {
                        const next = flippedPages.length;
                        if (next < pages.length) flipPage(next);
                    }}
                    disabled={isFlipping || flippedPages.length === pages.length}
                >
                    <i className="fa fa-arrow-circle-right"></i>
                </button>
            </div>
        </div>
    );
};

export default UserReadBook;
