import React, { useEffect, useState } from "react";
import "../styles/manageuser.css"
//import AdminHeader from "../components/header/AdminHeader";
//import useApiUrl from "../components/useApiUrl";
import useApiUrl from "../../componet/commonComponet/useApiUrl.js";

//chang
const ManageUsers = () => {

  const baseUrl = useApiUrl();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get the auth token

    fetch(`${baseUrl}/api/v1/users/getAllUsers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json()
      })
      .then((data) => {
        console.log("Api 1 Response", data);
        setUsers(data.data || []);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem("token"); // Get the auth token

    try {
      const response = await fetch(`${baseUrl}/api/v1/users/deleteUser/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });
      console.log(response);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json()
      console.log(data);

      // select users whose user.id not metch with userId , Remove deleted user from state
      setUsers(prevState => prevState.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="manage-users">
      {/* <AdminHeader /> */}
      <h1>Manage Users</h1>

      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>ContactNo</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.contactNo}</td>
              <td>{user.role || "User"}</td>
              <td>
                {/* <button className="edit-btn">Edit</button> */}
                <button className="delete-btn" onClick={() => handleDeleteUser(user._id)} >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
