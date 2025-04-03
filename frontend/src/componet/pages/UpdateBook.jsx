import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import confetti from 'canvas-confetti';
import '../../styles/pages_styles/AddBook.css';
import useApiUrl from '../commonComponet/useApiUrl';
import { Player } from '@lottiefiles/react-lottie-player';
import { getApiData, putApiData } from '../../config';
import { useLocation, useNavigate } from 'react-router';
import Loader from '../commonComponet/Loader';

const UpdateBook = () => {
    const baseUrl = useApiUrl()
    const location = useLocation();
    const navigate = useNavigate()

    const [preview, setPreview] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [bookId, setBookId] = useState(null)

    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

    const [cancelBook, setCancelBook] = useState(false)


    const defaultValue = {
        id: '',
        bookName: '',
        author: '',
        publishedYear: formattedDate,
        genre: '',
        description: '',
        price: '',
        coverImage: null
    };

    const [initialValues, setInitialValues] = useState(defaultValue);


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const bookId = params.get('Book') || "";
        setBookId(bookId)

        // Load saved form data from localStorage
        const savedData = JSON.parse(localStorage?.getItem('userUpdateBookData')) || ""
        if (savedData) {
            setInitialValues(savedData);
            setPreview(savedData.coverImage)
        }

        if (bookId) {
            fetchBooks(bookId);
            localStorage.setItem('bookUpdate', true)
        }
    }, []);

    const fetchBooks = async (bookId) => {
        setLoading(true)
        try {
            const res = await getApiData(`${baseUrl}/api/v1/books/getBookById?_id=${bookId}`, {
                withCredentials: true,
            });
            setLoading(false)

            if (res && res?.statuscode === 200) {
                if (res && res?.data) {
                    setInitialValues({
                        id: res.data._id || '',
                        bookName: res.data.bookName || '',
                        author: res.data.author || '',
                        publishedYear: res.data.publishedYear || '',
                        genre: res.data.genre || '',
                        description: res.data.description || '',
                        price: res.data.price || '',
                        coverImage: res.data.coverImage || null,
                    });
                    if (res.data.coverImage) {
                        setPreview(`${res.data.coverImage}`);
                    }
                }
            } else {
                console.error('Failed to fetch books');
            }

        } catch (error) {
            setLoading(false)
            console.error('Fetch Error:', error);
        }
    };


    const validationSchema = Yup.object({
        bookName: Yup.string().trim().required('Book name is required'),
        author: Yup.string()
            .trim()
            .matches(/^[A-Za-z\s]+$/, 'Author name must only contain letters')
            .required('Author is required'),
        genre: Yup.string().trim().required('Genre is required'),
        description: Yup.string().trim().required('Description is required'),
        price: Yup.number()
            .typeError('Price must be a number')
            .positive('Price must be positive')
            .required('Price is required'),
        coverImage: Yup.mixed().required('Cover image is required')
    });



    const firworkAnimation = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 20, spread: 260, ticks: 1000, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const fireworkInterval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                clearInterval(fireworkInterval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };


    const handleFormSubmit = async (values, resetForm) => {
        setShowLoader(true);
        const formData = new FormData();
        formData.append('bookName', values.bookName);
        formData.append('author', values.author);
        formData.append('publishedYear', values.publishedYear);
        formData.append('genre', values.genre);
        formData.append('description', values.description);
        formData.append('price', values.price);
        formData.append('coverImage', values.coverImage);

        // if (values.coverImage) {
        //     formData.append('coverImage', values.coverImage);
        // }

        try {
            const response = await putApiData(`${baseUrl}/api/v1/books/${values.id}`, formData, {
                withCredentials: true,
            });

            setShowLoader(false);


            // console.log(response)
            if (response && response.statuscode === 200) {
                localStorage.setItem("bookupdatedelete", true); // Remove saved data
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                setShowSuccessModal(true);
                firworkAnimation();
                setInitialValues(defaultValue);
                localStorage.setItem("bookUpdate", false);
                localStorage.removeItem("userUpdateBookData");
                resetForm();
                setPreview(null);
                setTimeout(() => {
                    localStorage.setItem("bookupdatedelete", false); // Remove saved data
                }, 100);

            } else {
                alert(response?.message || 'Something went wrong');
            }
        } catch (err) {
            setShowLoader(false)
            console.error(err);
            alert('Failed to submit form');
        }
    };


    const cancelBookForm = () => {
        // Remove saved data
        localStorage.setItem("bookupdatedelete", true); // Remove saved data
        localStorage.setItem("bookUpdate", false);
        setInitialValues(defaultValue); // Reset initial form values
        formData?.resetForm(); // ✅ Reset Formik form
        setShowConfirmModal(false);
        setCancelBook(false);
        localStorage.removeItem("userUpdateBookData"); // Remove saved data
        setPreview(null); // Clear preview image
        setTimeout(() => {
            localStorage.setItem("bookupdatedelete", false); // Remove saved data
        }, 100);
        navigate("/Home")
    };


    return (
        <div className="add-book-container">
            <h2>Update Book</h2>
            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {

                    setFormData({ values, resetForm });
                    setShowConfirmModal(true);
                    setSubmitting(false);
                    if (values?.bookName == "" || values?.author == "" || values?.coverImage == "" || !values?.coverImage || values?.description == "" || values?.genre == "" || values?.price == "") {
                        localStorage.removeItem("userUpdateBookData")
                    }
                }}
            >
                {({ values, setFieldValue, resetForm }) => {
                    if (values?.bookName !== "" || values?.author !== "" || values?.coverImage || values?.description !== "" || values?.genre !== "" || values?.price !== "") {
                        if (JSON.parse(localStorage?.getItem("bookupdatedelete")) === false) {
                            localStorage.setItem("userUpdateBookData", JSON.stringify(values));
                        }
                    }
                    return (
                        <Form className="book-form">
                            <div className="form-group">
                                <label>Book Name</label>
                                <Field type="text" name="bookName" placeholder="Enter book name" />
                                <ErrorMessage name="bookName" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label>Author</label>
                                <Field type="text" name="author" placeholder="Enter author name" />
                                <ErrorMessage name="author" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label>Published Year</label>
                                <Field type="text" name="publishedYear" readOnly placeholder="Current Year" />
                            </div>

                            <div className="form-group">
                                <label>Genre</label>
                                <Field type="text" name="genre" placeholder="Enter genre (e.g. Fiction)" />
                                <ErrorMessage name="genre" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <Field as="textarea" name="description" rows="4" placeholder="Write a brief description of the book..." />
                                <ErrorMessage name="description" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label>Price</label>
                                <Field type="number" name="price" min="0" placeholder="Enter price (e.g. 499)" />
                                <ErrorMessage name="price" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <label>Cover Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        if (file) {
                                            setFieldValue('coverImage', file);
                                            setPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                <ErrorMessage name="coverImage" component="div" className="error" />
                                {preview && (
                                    <div className="image-preview">
                                        <img src={preview} alt="Preview" />
                                    </div>
                                )}
                            </div>
                            <div className='btn'>
                                <button type="submit">Update Book</button>
                                <button
                                    type="button"
                                    className="denger"
                                    onClick={() => {
                                        setShowConfirmModal(true);
                                        setCancelBook(true);
                                        setFormData((prev) => ({ ...prev, resetForm })); // ✅ Store resetForm
                                    }}
                                >
                                    Cancel
                                </button> </div>
                        </Form>)
                }}
            </Formik>

            {
                showConfirmModal && (
                    <div className="addBook-modal-overlay">
                        <div className="modal-content scale-in">
                            <span className="close-icon" onClick={() => setShowConfirmModal(false)}>✖</span>
                            {cancelBook ?
                                <p>Are you sure you want to not Update  this book?</p>
                                :
                                <p>Are you sure you want to Update this book?</p>
                            }
                            <div className="modal-actions">
                                <button
                                    className="btn-confirm"
                                    onClick={() => {
                                        if (cancelBook) {
                                            cancelBookForm(); // ✅ Now cancelBookForm has access to resetForm
                                        } else {
                                            setShowConfirmModal(false);
                                            if (formData) {
                                                handleFormSubmit(formData.values, formData.resetForm);
                                            }
                                        }
                                    }}
                                >
                                    {cancelBook ?
                                        "Yes, cancel"
                                        :
                                        "Yes, Update"
                                    }
                                </button>
                                <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }



            {
                showLoader && (
                    <div className="loader-overlay">
                        <div className="loader-content">
                            <Player
                                autoplay
                                speed={2.5}
                                loop
                                src="/images/book-loader.json"
                                style={{ height: '300px', width: '300px' }}
                            />
                            <h2 className="loader-text">Book is Updating to library<span className="dot-animate"></span></h2>
                        </div>
                    </div>
                )
            }



            {
                showSuccessModal && (
                    <div className="addBook-modal-overlay">
                        <div className="modal-content scale-in">
                            <span className="close-icon" onClick={() => { setShowSuccessModal(false); navigate("/Home") }}>✖</span>
                            <h3>🎉 Book updated  successfully!</h3>
                            <button className="btn-confirm" onClick={() => { setShowSuccessModal(false); navigate("/Home") }}>Close</button>
                        </div>
                    </div>
                )
            }

            {
                Loading ?
                    <Loader />
                    : null
            }
        </div >
    );
};

export default UpdateBook;



