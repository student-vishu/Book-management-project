import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../../styles/pages_styles/UserProfile.css";
import useApiUrl from "../commonComponet/useApiUrl";

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .matches(/^[A-Za-z\s]+$/, "Name cannot contain numbers")
        .required("Name is required"),
    email: Yup.string()
        .email("Invalid email format")
        .matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, "Invalid email format")
        .required("Email is required"),
    contactNo: Yup.string()
        .matches(/^\d+$/, "Contact must contain only numbers")
        .min(10, "Contact must be exactly 10 digits")
        .max(10, "Contact must be exactly 10 digits")
        .required("Contact is required"),
});

const UserProfile = () => {
    const baseUrl = useApiUrl();
    const [profile, setProfile] = useState({
        _id: "",
        name: "",
        email: "",
        contactNo: "",
        role: "",
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role"); // Get role from localStorage

        let apiEndpoint = role === "admin"
            ? `${baseUrl}/api/v1/users/getAdminProfile`
            : `${baseUrl}/api/v1/users/current-user`;

        fetch(apiEndpoint, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            credentials: "include",
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API Response:", data);
                setProfile(data.data || {});
            })
            .catch(error => console.error("Error fetching profile:", error));
    }, []);

    const handleUpdateProfile = async (values) => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        let updateEndpoint = role === "admin"
            ? `${baseUrl}/api/v1/users/updateAdminProfile/${profile._id}`
            : `${baseUrl}/api/v1/users/updateUserProfile/${profile._id}`;

        try {
            const response = await fetch(updateEndpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    _id: profile._id,
                    ...values,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            alert("Profile updated successfully!");
            setProfile({ ...profile, ...values });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="profile-container">
            <h1>My Profile</h1>
            <div className="profile-card">
                <img src="/images/author-image.png" alt="User Profile" className="profile-image" />

                {!isEditing ? (
                    <div className="profile-info">
                        <h2>{profile.name}</h2>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Contact No:</strong> {profile.contactNo}</p>
                        <p><strong>Role:</strong> {profile.role}</p>
                        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <Formik
                        initialValues={{
                            name: profile.name,
                            email: profile.email,
                            contactNo: profile.contactNo,
                        }}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleUpdateProfile}
                    >
                        {({ isSubmitting, handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="profile-edit-form">
                                <label htmlFor="name">Name:</label>
                                <Field type="text" name="name" id="name" />
                                <ErrorMessage name="name" component="span" className="error" />

                                <label htmlFor="email">Email:</label>
                                <Field type="email" name="email" id="email" />
                                <ErrorMessage name="email" component="span" className="error" />

                                <label htmlFor="contactNo">Contact No:</label>
                                <Field type="text" name="contactNo" id="contactNo" />
                                <ErrorMessage name="contactNo" component="span" className="error" />

                                <div className="form-buttons">
                                    <button type="submit" disabled={isSubmitting} className="save-btn">
                                        Save Changes
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </div>
    );
};


export default UserProfile
