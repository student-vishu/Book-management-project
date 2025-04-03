import React, { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useNavigate } from "react-router";
import * as yup from "yup";
import "../../styles/pages_styles/Login.css";
import ForgetPasswordModal from "../commonComponet/ForgetPasswordModal";
import useApiUrl from "../commonComponet/useApiUrl.js";
import { postApiData } from "../../config.js";
import Loader from "../commonComponet/Loader.jsx";


const validationSchema = yup.object().shape({
    userContact: yup
        .string()
        .matches(/^\d+$/, "User Contact must contain only numbers")
        .min(10, "User Contact must be at least 10 digits")
        .max(10, "User Contact must be 10 digits not more")
        .required("User Contact is required"),
    userEmail: yup.string().email("Invalid email format")
        .matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, "Invalid email format")
        .required("User Email is required"),
    userPassword: yup.string()
        .min(6, "Password must be at least 6 characters")
        .max(10, "Password not more then 10 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
        .required("User Password is required"),
});



const Login = () => {
    const baseUrl = useApiUrl()
    const [loginContect, setLoginContect] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const navigate = useNavigate();
    const [displayError, setDisplayError] = useState(false);
    const [userNotExists, setUserNotExists] = useState(false)
    const [modalOpen, setModalOpen] = useState(false);
    const [changePasswordConform, setChangePasswordConform] = useState(false);
    const [autoLoginData, setAutoLoginData] = useState(null);
    const [passwordShow, setPasswordShow] = useState(false);
    const [showLoader, setShowLoader] = useState(false)


    const [message, setMessage] = useState(null);

    useEffect(() => {
        const initialMessage = JSON.parse(localStorage?.getItem("userExistError")) || null;
        const userRagistretionData = JSON.parse(localStorage?.getItem("userRagistretion")) || null;

        setMessage(initialMessage)
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);  // Clear the message
                localStorage.clear()
            }, 4000);

            return () => clearTimeout(timer); // Cleanup
        } else if (userRagistretionData) {

            autoLogin(userRagistretionData)

        }

    }, [message]);

    const autoLogin = async (userRagistretionData) => {
        const userLoginData = {
            email: userRagistretionData?.email,
            password: userRagistretionData?.password
        }
        setAutoLoginData(userLoginData)

        if (userLoginData) {
            postUserLogin(userLoginData)
        } else {
            console.error("login data is required")
        }
    }

    const closeModal = () => {
        setModalOpen(!modalOpen);
    };

    const changePassword = () => {
        setChangePasswordConform(true)
        setTimeout(() => {
            setChangePasswordConform(false)
        }, 2000);
    }

    const handelForgetPassword = () => {
        setModalOpen(true)
    }

    const navigateRegistration = () => {
        navigate("/registration");
    };

    const handelSubmit = async (data, errors, resetForm) => {
        if (loginContect) {
            if (!errors.userContact && !errors.userPassword && data.userContact && data.userPassword) {
                const userLoginData = {
                    password: data?.userPassword,
                    contactNo: data?.userContact
                }

                if (userLoginData) {
                    postUserLogin(userLoginData, resetForm)
                } else {
                    console.error("login data is required")
                }

                setIsSubmittingForm(true)
            }
        } else {
            if (!errors.userEmail && !errors.userPassword && data.userEmail && data.userPassword) {
                const userLoginData = {
                    email: data?.userEmail,
                    password: data?.userPassword
                }

                if (userLoginData) {
                    postUserLogin(userLoginData, resetForm)
                } else {
                    console.error("login data is required")
                }
            }

        }
    }


    const postUserLogin = async (loginData, resetForm) => {
        setShowLoader(true)
        try {
            const res = await postApiData(`${baseUrl}/api/v1/users/login`, loginData, {
                withCredentials: true
            })

            setShowLoader(false)
            if (res && res.statuscode === 200) {
                localStorage.clear()
                if (res && res.data.user.role) {

                    if (res.data.user.role === "admin") {
                        localStorage.setItem("userAdminLogin", JSON.stringify(res.data.user))
                        navigate("/admin-dashboard");  // Redirect admin to admin panel
                    } else {
                        localStorage.setItem("userLogin", JSON.stringify(res.data.user))
                        navigate("/Book-Management");  // Redirect regular users
                    }
                } else {
                    console.error("user role is not exeist")
                }

            } else if (res.statuscode === 404) {
                setUserNotExists(true)
                setTimeout(() => {
                    setUserNotExists(false)
                }, 4000);
                if (resetForm) {
                    resetForm()
                }
            } else if (res.statuscode === 401) {
                setDisplayError(true)
                setTimeout(() => {
                    setDisplayError(false)
                }, 4000);
                if (resetForm) {
                    resetForm()
                }
            } else {
                console.error("Falid to user login")
            }

        } catch (error) {
            setShowLoader(false)
            setDisplayError(true)
            setTimeout(() => {
                setDisplayError(false)
            }, 4000);
            console.error("Falid to featch", error)
        }

    }



    return (
        <>
            <div className="login-form">
                {
                    changePasswordConform ?
                        <div className="change-password-info">
                            <h2> password change successfully</h2>
                        </div>
                        : null
                }
                {message && <div className="change-password-info"><h2>{decodeURIComponent(message)}</h2></div>}


                <Formik
                    initialValues={
                        {
                            userEmail: autoLoginData?.email || "",
                            userPassword: autoLoginData?.password || "",
                            userContact: ""
                        }
                    }
                    validationSchema={validationSchema}
                    validateOnBlur
                    validateOnChange

                >
                    {({ values, errors, isSubmitting, setErrors, resetForm }) => (
                        <Form className={`form ${isSubmittingForm ? "submitting" : ""}`}>
                            <div className={`ragistrtion-error ${displayError || userNotExists ? "showError" : ""}`} >
                                {displayError ? <h1>enter correct password</h1> : null}
                                {userNotExists ? <h1>please complit your ragistrtion</h1> : null}
                            </div>
                            <div className="login-heding">
                                <h1>Login</h1>
                            </div>
                            <div className="input-filed">
                                {!loginContect ? (
                                    <>
                                        <label htmlFor="email">Email</label>
                                        <Field type="email" name="userEmail" id="email" />
                                        <ErrorMessage name="userEmail" component="span" className="error" />
                                    </>
                                ) : (
                                    <>
                                        <label htmlFor="Contact">Contact</label>
                                        <Field type="tel" name="userContact" id="Contact" />
                                        <ErrorMessage name="userContact" component="span" className="error" />
                                    </>
                                )}
                            </div>
                            <div className="input-filed">
                                <div className="froget-password">
                                    <label htmlFor="password">Password</label>
                                    <h3 onClick={handelForgetPassword}>forget password</h3>
                                </div>
                                <div className="input-password">
                                    <Field type={!passwordShow ? "password" : "text"} name="userPassword" id="password" />
                                    {
                                        values.userPassword ?

                                            <button type="button" className="toggle-password-visibility" title={`password  ${!passwordShow ? "Show" : "Hide"} `} onClick={() => setPasswordShow(!passwordShow)} >
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
                                <ErrorMessage name="userPassword" component="span" />
                            </div>
                            <div className="button">
                                {!values.userEmail && !values.userContact ? (
                                    <button type="button" onClick={() => { setLoginContect(!loginContect); setErrors({}); }} className="login_type">
                                        {!loginContect ? "Login using contact" : "Login using email"}
                                    </button>
                                ) : null}
                                <div className="login_button">
                                    <button type="button" onClick={navigateRegistration}>
                                        Register
                                    </button>
                                    <button type="button" onClick={() => handelSubmit(values, errors, resetForm)} >
                                        Login
                                    </button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            <div className="form_modal">
                <ForgetPasswordModal modalOpen={modalOpen} closeModal={closeModal} changePassword={changePassword} />
            </div>
            {
                showLoader ?
                    <Loader />
                    : null
            }
        </>
    );
};





export default Login;
