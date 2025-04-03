import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import useApiUrl from '../useApiUrl';
import "../../../styles/Header.css";
import { postApiData, putApiUserProfileUpdate } from '../../../config';

const Header = () => {
    const baseurl = useApiUrl();
    const navigate = useNavigate();
    const location = useLocation();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userProfileUpdate, setUserProfileUpdate] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false)

    const [user, setUser] = useState(null);

    useEffect(() => {

        const userLogin = JSON.parse(localStorage?.getItem('userLogin')) || "";
        if (userLogin) {

            setUser({
                name: userLogin?.name,
                email: userLogin?.email,
                contact: userLogin?.contactNo,
                id: userLogin?._id
            })
            setUpdateUser({
                name: userLogin?.name,
                email: userLogin?.email,
                contact: userLogin?.contactNo,
                id: userLogin?._id
            })
        }
    }, [successMessage, location])

    const userProfileNaviget = () => {
        navigate('/UserProfile')
        setUserProfileUpdate(false);
        setShowConfirmPopup(false);
        setIsProfileOpen(false)
    }

    const [updateUser, setUpdateUser] = useState({ ...user });

    const userAdminLogin = localStorage.getItem('userAdminLogin') || "";

    const toggleProfileModal = () => {
        setIsProfileOpen(!isProfileOpen)
        setUserProfileUpdate(false)
    };

    const getInitial = (name) => name?.charAt(0)?.toUpperCase() || '';

    const validate = (values) => {
        const errs = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const contactRegex = /^\d{10}$/;

        if (!emailRegex.test(values.email)) {
            errs.email = "Invalid email address";
        }

        if (!contactRegex.test(values.contact)) {
            errs.contact = "Contact must be 10 digits";
        }

        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdateUser((prev) => ({ ...prev, [name]: value }));

        // Validate on change if already touched
        if (touched[name]) {
            const newErrors = validate({ ...updateUser, [name]: value });
            setErrors(newErrors);
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const newErrors = validate(updateUser);
        setErrors(newErrors);
    };

    const userLogout = async () => {
        localStorage.clear();
        if (confirmLogout) {
            setConfirmLogout(false)
            setShowConfirmPopup(false);
        }
        navigate('/Login');
        try {
            const response = await postApiData(`${baseurl}/api/v1/users/logout`, {}, {
                withCredentials: true
            });
            if (response.statuscode === 200) {
                navigate('/Login');
            }
            else {
                alert('Logout failed, please try again.');
            }
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    const cheakUserActivity = () => {
        const userBook = localStorage?.getItem("userBookData") || null
        const userUpdateBook = localStorage?.getItem("userUpdateBookData") || null
        if (userBook || userUpdateBook) {
            setShowConfirmPopup(true);
            setConfirmLogout(true)
        } else {
            userLogout();
        }
    }

    const handleProfileUpdate = async () => {
        const validationErrors = validate(updateUser);
        setErrors(validationErrors);
        setTouched({ email: true, contact: true });

        if (Object.keys(validationErrors).length > 0) {
            return; // Don't proceed if errors exist
        }

        const updateUserData = {
            email: updateUser.email,
            contactNo: updateUser.contact
        }

        try {
            const response = await putApiUserProfileUpdate(`${baseurl}/api/v1/users/updateUserProfile/${user.id}`, updateUserData, {
                withCredentials: true
            });

            if (response.statuscode === 200) {
                console.log("data", response)
                setSuccessMessage(true)
                setUser(updateUser);
                setUserProfileUpdate(false);
                setShowConfirmPopup(false);
                setTimeout(() => {
                    setSuccessMessage(false)
                }, 2000);
                getInitial(response.data.name)
                localStorage.setItem("userLogin", JSON.stringify(response.data))
            } else {
                alert("Failed to update profile.");
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Something went wrong.");
        }
    };


    const handleCancelUpdate = () => {
        setUpdateUser(user); // Revert changes
        setUserProfileUpdate(false);
        setShowConfirmPopup(false);
    };

    return (
        <div className='header'>
            {
                successMessage ?
                    <div className='message'>
                        <h1>profile updated successfully</h1>
                    </div>
                    : null
            }
            <div className='navebar'>
                <div className='logo'>
                    <ul>

                        <li>
                            {location.pathname !== "/UserProfile" && !userAdminLogin && (
                                <div className="profile-avatar" onClick={toggleProfileModal}>
                                    {getInitial(user?.name)}
                                </div>
                            )}
                        </li>

                        <li>
                            <NavLink to={"/Book-Management"}>
                                <img src="./images/logo.png" alt="logo" className='logo' />
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <div className='nav-link'>
                    <ul>
                        <li><NavLink to={"/Home"}>Home</NavLink></li>
                        <li><NavLink to={"/library"}>Library</NavLink></li>
                        <li><NavLink to={"/BookDisplay"}>Books</NavLink></li>
                        <li><NavLink to={"/AddBook"}>AddBook</NavLink></li>
                        {localStorage?.getItem("userUpdateBookData") &&
                            (<li><NavLink to={"/UpdateBook"}>UpdateBook</NavLink></li>)
                        }


                        {location.pathname === "/UserProfile" && !userAdminLogin ?
                            <li > <NavLink to={"/UserProfile"}>Profile</NavLink></li>
                            : null}


                        {userAdminLogin && (
                            <li><NavLink to={"/admin-dashboard"}>Admin</NavLink></li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Profile Modal */}
            {
                isProfileOpen && !userAdminLogin && location.pathname !== "/UserProfile" && (
                    <div className="profile-modal">
                        <div className="profile-content">
                            <button onClick={toggleProfileModal} className="close-profile-icone"><i className="fa fa-close"></i></button>
                            <div className="user-info">
                                <div className="profile-circle">{getInitial(user.name)}</div>
                                <h2>{user?.name}</h2>
                            </div>
                            <div className='user-update-facility'>
                                <h3 className='heding'>profile detail</h3>
                                <div className="user-detail">
                                    <h3>Email</h3>
                                    {userProfileUpdate ? (
                                        <div className='input-filed'>
                                            <input
                                                type="email"
                                                name="email"
                                                value={updateUser.email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="profile-input"
                                            />
                                            {touched.email && errors.email && <p className="input-error">{errors.email}</p>}
                                        </div>) : (
                                        <p>{user?.email}</p>
                                    )}
                                </div>

                                <div className="user-detail">
                                    <h3>Contact</h3>
                                    {userProfileUpdate ? (
                                        <div className='input-filed'>
                                            <input
                                                type="text"
                                                name="contact"
                                                value={updateUser.contact}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="profile-input"
                                            />
                                            {touched.contact && errors.contact && <p className="input-error">{errors.contact}</p>}
                                        </div>) : (
                                        <p>{user?.contact}</p>
                                    )}
                                </div>



                                <div className='user-profile-update'>
                                    <button type='button' onClick={cheakUserActivity} className="user-logout">logout</button>
                                    {userProfileUpdate ? (
                                        <button type='button' onClick={handleCancelUpdate} className="close-profile">Cancel</button>
                                    ) : (
                                        <button type='button' onClick={() => setUserProfileUpdate(true)} className="update-profile">Update</button>
                                    )}
                                    {userProfileUpdate && (
                                        <button
                                            type='button'
                                            onClick={() => setShowConfirmPopup(true)}
                                            className="submit-profile"
                                        >
                                            Submit
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className='user-activity'>
                                <h3 className='heding'>user activities</h3>
                                <button type='button' onClick={userProfileNaviget} className="user-acticity-button">user uploaded book</button>
                                <button type='button' onClick={userProfileNaviget} className="user-acticity-button">Read later book</button>

                            </div>
                        </div>
                        <div className='back-cover' onClick={toggleProfileModal}>

                        </div>
                    </div>
                )
            }


            {/* Confirmation Popup */}
            {
                showConfirmPopup && !userAdminLogin && (
                    <div className="confirm-popup">
                        <div className="confirm-box">
                            {confirmLogout ?
                                <p>Do you wish to log out now that you have written but not submitted a book?</p>
                                :
                                <p>Are you sure you want to update your profile?</p>
                            }
                            <div className="confirm-buttons">
                                {
                                    confirmLogout ?
                                        <button onClick={userLogout} className="confirm-yes">Yes</button>
                                        :
                                        <button onClick={handleProfileUpdate} className="confirm-yes">Yes</button>
                                }
                                <button onClick={handleCancelUpdate} className="confirm-no">No</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default Header;
