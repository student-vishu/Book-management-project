import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import "../../styles/ForgetPasswordModal.css"
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as yup from "yup"
import useApiUrl from './useApiUrl'
import { postApiData } from '../../config'

const validationSchema = yup.object().shape({
    userContact: yup
        .string()
        .matches(/^\d+$/, "User Contact must contain only numbers")
        .min(10, "User Contact must be at least 10 digits")
        .max(10, "User Contact must be 10 digits not more")
        .required("User Contact is required"),
    userEmail: yup.string().email("Invalid email format").required("User Email is required"),
    userPassword: yup.string()
        .min(6, "Password must be at least 6 characters")
        .max(10, "Password not more then 10 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
        .required("User Password is required"),
    userConfirmPassword: yup.string()
        .oneOf([yup.ref("userPassword")], "Passwords must match"),
});



const ForgetPasswordModal = (props) => {
    const baseUrl = useApiUrl()
    const { modalOpen, closeModal, changePassword } = props
    const [getInput, setGetInput] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);
    const [response, setResponse] = useState(null);
    const [passwordShow, setPasswordShow] = useState(false)
    const [confirmPasswordShow, setConfirmPasswordShow] = useState(false)

    const checkUser = async (values, errors, e, resetForm) => {
        e.preventDefault()

        if (values.userEmail && values.userEmail && !errors.userContact && !errors.userEmail) {

            const checkUser = {
                email: values?.userEmail,
                contactNo: values?.userContact
            }

            try {

                const respone = await postApiData(`${baseUrl}/api/v1/users/check-user`, checkUser, {
                    withCredentials: true
                })

                if (respone.statusCode === 404) {
                    setUserNotFound(true);
                    setTimeout(() => {
                        setUserNotFound(false);
                    }, 3000);
                    resetForm();
                } else {
                    setGetInput(true);
                    setResponse(respone)
                }
            } catch (error) {
                console.error("error to change password", error)
            }

        }
    }

    const updatePassword = async (values, errors, e) => {
        // console.log(response)

        if (getInput && response.statuscode === 200 && response.data && values.userConfirmPassword && !errors.userConfirmPassword) {

            // console.log("id", response.data.userId)

            const checkUser = {
                password: values?.userConfirmPassword,
                _id: response?.data.userId
            }
            try {

                const respone = await postApiData(`${baseUrl}/api/v1/users/forgotpassword`, checkUser, {
                    withCredentials: true
                })


                if (respone.statuscode === 200) {
                    changePassword();
                    closeModal();
                    setGetInput(null)
                }

            } catch (error) {
                console.error("error user not found", error)
            }
        }
    }

    return (
        <div>
            <Modal show={modalOpen} className="custom-login-modal">
                <div className={`user-error ${userNotFound ? "showError" : ""}`}>
                    <h3>user not found please enter correct email & contact</h3>
                </div>
                <Modal.Header>
                    <Modal.Title id='ModalHeader'>
                        <h1>change password </h1>
                    </Modal.Title>
                    <button type='button' className='close-Modal' onClick={() => { setGetInput(false); closeModal(); }}>
                        <i className="fa fa-close"></i>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{ userEmail: "", userPassword: "", userContact: "", userConfirmPassword: "" }}
                        validationSchema={validationSchema}
                        validateOnBlur
                        validateOnChange

                    >
                        {({ values, errors, resetForm }) => (
                            <Form className={`form`}>
                                <div className="input-filed">
                                    <div className='filed'>
                                        <label htmlFor="email">Email</label>
                                        <Field type="email" name="userEmail" id="email" disabled={getInput ? true : false} />
                                        <ErrorMessage name="userEmail" component="span" className="error" />
                                    </div>
                                    <div className='filed'>
                                        <label htmlFor="Contact">Contact</label>
                                        <Field type="tel" name="userContact" id="Contact" disabled={getInput ? true : false} />
                                        <ErrorMessage name="userContact" component="span" className="error" />
                                    </div>
                                </div>
                                {getInput ?
                                    <div className="chenge-password-input-filed">
                                        <div className='filed'>
                                            <label htmlFor="Contact">password</label>
                                            <div className="input-password">
                                                <Field type={!passwordShow ? "password" : "text"} name="userPassword" id="userPassword" autoFocus />
                                                {
                                                    values.userPassword ?
                                                        <button
                                                            type="button"
                                                            className="toggle-password-visibility"
                                                            title={`password  ${!passwordShow ? "Show" : "Hide"} `}
                                                            onClick={() => setPasswordShow(!passwordShow)} >
                                                            {
                                                                passwordShow ?
                                                                    <i className="fa fa-eye-slash" aria-hidden="true" ></i>
                                                                    :
                                                                    <i className="fa fa-eye" aria-hidden="true"></i>
                                                            }
                                                        </button>
                                                        : null
                                                }
                                            </div>
                                            <ErrorMessage name="userPassword" component="span" className="error" />
                                        </div>
                                        <div className='filed'>
                                            <label htmlFor="Contact">confirm Password</label>
                                            <div className="input-password">
                                                <Field type={!confirmPasswordShow ? "password" : "text"} name="userConfirmPassword" id="userConfirmPassword" />

                                                {
                                                    values.userConfirmPassword ?

                                                        <button
                                                            type="button"
                                                            className="toggle-password-visibility"
                                                            title={`password  ${!confirmPasswordShow ? "Show" : "Hide"} `}
                                                            onClick={() => setConfirmPasswordShow(!confirmPasswordShow)} >
                                                            {
                                                                confirmPasswordShow ?
                                                                    <i className="fa fa-eye-slash" aria-hidden="true" ></i>
                                                                    :
                                                                    <i className="fa fa-eye" aria-hidden="true"></i>
                                                            }
                                                        </button>
                                                        : null
                                                }
                                            </div>
                                            <ErrorMessage name="userConfirmPassword" component="span" className="error" />
                                        </div>
                                    </div>
                                    : null}
                                <div>
                                    <Modal.Footer>
                                        {!getInput ?
                                            <button type='button' onClick={(e) => checkUser(values, errors, e, resetForm)}>
                                                submit
                                            </button>
                                            :
                                            <button type='button' onClick={(e) => updatePassword(values, errors, e)}>
                                                change password
                                            </button>
                                        }
                                    </Modal.Footer>

                                </div>

                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>

        </div>
    )
}

export default ForgetPasswordModal
