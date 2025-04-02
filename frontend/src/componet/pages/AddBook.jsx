import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import confetti from 'canvas-confetti';
import '../../styles/pages_styles/AddBook.css';
import useApiUrl from '../commonComponet/useApiUrl';
import { Player } from '@lottiefiles/react-lottie-player';

const AddBook = () => {
    const baseUrl = useApiUrl();
    const [preview, setPreview] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState(null);
    const [showLoader, setShowLoader] = useState(false);

    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

    const initialValues = {
        bookName: '',
        author: '',
        publishedYear: formattedDate,
        genre: '',
        description: '',
        price: '',
        category: '',
        coverImage: null
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
        category: Yup.string().trim().required('Category is required'),
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
        formData.append('category', values.category);
        formData.append('coverImage', values.coverImage);

        // if (values.coverImage) {
        //     formData.append('coverImage', values.coverImage);
        // }

        try {
            const response = await fetch(`${baseUrl}/api/v1/books/addBook`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const result = await response.json();
            setShowLoader(false);

            if (response.ok) {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                setShowSuccessModal(true);
                firworkAnimation();
                resetForm();
                setPreview(null);
            } else {
                alert(result?.message || 'Something went wrong');
            }
        } catch (err) {
            setShowLoader(false)
            console.error(err);
            alert('Failed to submit form');
        }
    };


    return (
        <div className="add-book-container">
            <h2>Add New Book</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    setFormData({ values, resetForm });
                    setShowConfirmModal(true);
                    setSubmitting(false);
                }}
            >
                {({ values, setFieldValue }) => (
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
                            <label>Category</label>
                            <Field type="text" name="category" placeholder="Enter category (e.g. Best Seller)" />
                            <ErrorMessage name="category" component="div" className="error" />
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

                        <button type="submit">Add Book</button>
                    </Form>
                )}
            </Formik>

            {showConfirmModal && (
                <div className="addBook-modal-overlay">
                    <div className="modal-content scale-in">
                        <span className="close-icon" onClick={() => setShowConfirmModal(false)}>✖</span>
                        <p>Are you sure you want to add this book?</p>
                        <div className="modal-actions">
                            <button
                                className="btn-confirm"
                                onClick={async () => {
                                    setShowConfirmModal(false);
                                    if (formData) {
                                        await handleFormSubmit(formData.values, formData.resetForm);
                                    }
                                }}
                            >
                                Yes, Submit
                            </button>
                            <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showLoader && (
                <div className="loader-overlay">
                    <div className="loader-content">
                        <Player
                            autoplay
                            speed={2.5}
                            loop
                            src="/images/book-loader.json"
                            style={{ height: '300px', width: '300px' }}
                        />
                        <h2 className="loader-text">Book is adding to library<span className="dot-animate"></span></h2>
                    </div>
                </div>
            )}



            {showSuccessModal && (
                <div className="addBook-modal-overlay">
                    <div className="modal-content scale-in">
                        <span className="close-icon" onClick={() => setShowSuccessModal(false)}>✖</span>
                        <h3>🎉 Book submitted successfully!</h3>
                        <button className="btn-confirm" onClick={() => setShowSuccessModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddBook;
