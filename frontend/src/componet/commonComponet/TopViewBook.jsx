import React from 'react';
import Slider from "react-slick";
import "../../styles/top-view-book.css";

const TopViewBook = (props) => {
    const { bookData, toggalModal } = props;

    const maxDots = 5; // Maximum number of dots to show

    const settings = {
        dots: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        initialSlide: 0,
        prevArrow: <div className="slick-arrow slick-prev">
            <i className="fa fa-arrow-circle-left"></i>
        </div>,
        nextArrow: <div className="slick-arrow slick-next">
            <i className="fa fa-arrow-circle-right"></i>
        </div>,

        responsive: [
            {
                breakpoint: 1040,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 850,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 550,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                    arrows: false,
                    customPaging: function (i) {
                        return i % maxDots === 0 ? <div className="dot"></div> : <div className="dot hidden-dot"></div>;
                    },
                }
            }
        ]
    };

    return (
        <>
            <div className='block topBook_Display'>
                <h1 className='heding'> Top Book Viewer </h1>
                <div className="slider-container">
                    <Slider {...settings}>
                        {bookData && bookData.length > 0 ? (
                            bookData.filter((book) => book.rating >= 3.5).map((book, index) => {
                                const percentage = (book.rating / 5) * 75;
                                return (
                                    <div className='book-card' key={index} onClick={() => toggalModal(book)}>
                                        <img src={book.coverImage} alt={book.bookName} />
                                        <div className='book-details'>
                                            <div className='book-reting'>
                                                <h3 className="book-title">{book.bookName}</h3>
                                                <div className="rating-box">
                                                    <div className="star-wrapper">
                                                        <div className="star-background">★</div>
                                                        <div className="star-fill" style={{ width: `${percentage}%` }}>★</div>
                                                    </div>
                                                    <span className="rating-number">{book.rating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <p className="book-author">author  {book.author}</p>
                                            <p className="book-price">₹{book.price}</p>
                                        </div>
                                    </div>
                                )
                            }
                            )
                        ) : (
                            [...Array(4)].map((_, i) => (
                                <div className='lodar' key={i}></div>
                            ))
                        )}
                    </Slider>
                </div>
            </div >

        </>
    );
}

export default TopViewBook;
