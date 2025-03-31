import React, { useState, useEffect } from 'react';
import "../../styles/TopAuthorBook.css";

const TopAuthorBook = ({ bookData }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [expandedDescIndex, setExpandedDescIndex] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleNext = (index = null) => {
        if (index !== null && index !== activeIndex) {
            setActiveIndex(index);
            setExpandedDescIndex(null);
        } else if (activeIndex < bookData.length - 1) {
            setActiveIndex(prev => {
                setExpandedDescIndex(null);
                return prev + 1;
            });
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) {
            setActiveIndex(prev => {
                setExpandedDescIndex(null);
                return prev - 1;
            });
        }
    };

    return (
        <div className="book-slider-container block">
            <div className="book-slider">
                {bookData?.filter((book) => book.rating >= 3.5).map((data, index) => {
                    if (index < activeIndex || index > activeIndex + 4) return null;

                    const isActive = index === activeIndex;
                    const position = index - activeIndex;
                    const isExpanded = expandedDescIndex === index;

                    // Dynamically calculate left positioning for deactive slides
                    let leftPosition = "0";
                    if (!isActive) {
                        if (windowWidth >= 768) {
                            leftPosition = `calc(50% + ${position * 260}px)`;
                        } else if (windowWidth <= 768 && windowWidth >= 480) {
                            leftPosition = `calc(20% + ${position * 250}px)`;
                        }
                    }

                    return (
                        <div
                            onClick={() => !isActive && handleNext(index)}
                            key={index}
                            className={`slides ${isActive ? "active" : "deactive"} ${isExpanded ? "expanded" : "collapsed"}`}
                            style={{
                                "--img": `url(${data?.coverImage})`,
                                zIndex: isActive && isExpanded ? 10 : 0,
                                ...(leftPosition !== "0" ? { left: leftPosition } : {})

                            }}
                        >
                            <div className={`content ${isActive ? "active" : "deactive"}`}>
                                <div className='author-info'>
                                    <img src="/images/author-image.png" alt="author" />
                                    <h2>{data?.author}</h2>
                                </div>
                                <div className='book-info'>
                                    <h1>{data?.bookName}</h1>
                                    <p className={isExpanded ? "expanded" : "collapsed"}>
                                        {data?.description}
                                    </p>
                                    <button
                                        className="read-more-btn"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering slide switch
                                            setExpandedDescIndex(isExpanded ? null : index);
                                        }}
                                    >
                                        {isExpanded ? "Read Less" : "Read More"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons */}
            <div className='button'>
                <button className="prev-button" onClick={handlePrev}>Prev</button>
                <button className="next-button" onClick={() => handleNext()}>Next</button>
            </div>
        </div >
    );
};

export default TopAuthorBook;
