import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../styles/profile.css";
import useApiUrl from "../../componet/commonComponet/useApiUrl.js";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^[A-Za-z\s]+$/, "Name cannot contain numbers")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  contactNo: Yup.string()
    .matches(/^\d+$/, "Contact must contain only numbers")
    .min(10, "Contact must be exactly 10 digits")
    .max(10, "Contact must be exactly 10 digits")
    .required("Contact is required"),
});

const Profile = () => {
  const baseUrl = useApiUrl();
  const [profile, setProfile] = useState({ _id: "", name: "", email: "", contactNo: "", role: "" });
  const [profileImage, setProfileImage] = useState("/images/author-image.png"); // Default image
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    let profileEndpoint = role === "admin"
      ? `${baseUrl}/api/v1/users/getAdminProfile`
      : `${baseUrl}/api/v1/users/current-user`;

    // Fetch Profile Data First
    fetch(profileEndpoint, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        if (data.data) {
          setProfile(data.data);

          // Fetch Profile Image Only If profile._id Exists
          if (data.data._id) {
            const imageEndpoint = role === "admin"
              ? `${baseUrl}/api/v1/profileImage/getProfileImage/${data.data._id}`
              : `${baseUrl}/api/v1/profileImage/getProfileImage/${data.data._id}`;

            fetch(imageEndpoint, {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            })
              .then(response => response.json())
              .then(imageData => setProfileImage(imageData.data?.image || "/images/author-image.png"))
              .catch(error => console.error("Error fetching profile image:", error));
          }
        }
      })
      .catch(error => console.error("Error fetching profile:", error));
  }, [baseUrl]);

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
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      alert("Profile updated successfully!");
      setProfile({ ...profile, ...values });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Preview image before uploading
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    // Upload the image
    handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    let uploadEndpoint = role === "admin"
      ? `${baseUrl}/api/v1/profileImage/uploadProfileImage/${profile._id}`
      : `${baseUrl}/api/v1/profileImage/uploadProfileImage/${profile._id}`;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      setProfileImage(data.imageUrl);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      <div className="Admin-profile-card">
        {/* Show preview image if selected, otherwise show existing profile image */}

        <label htmlFor="imageUpload" className="upload-image-btn">
          <img src={selectedImage || profileImage} alt="User Profile" className="profile-image" />
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />

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
            initialValues={{ name: profile.name, email: profile.email, contactNo: profile.contactNo }}
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

export default Profile;
