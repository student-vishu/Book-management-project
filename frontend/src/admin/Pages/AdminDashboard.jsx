import { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";
import useApiUrl from "../../componet/commonComponet/useApiUrl.js";
//import useApiUrl from "../components/useApiUrl";
//import AdminHeader from "../components/header/AdminHeader";

const AdminDashboard = () => {
  const baseUrl = useApiUrl();
  const [dashboardData, setDashboardData] = useState({
    totalUser: 0,
    totalBooks: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get the auth token

    const fetchUserCount = fetch(`${baseUrl}/api/v1/users/getUserCount`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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
        //console.log("User API Response:", data);
        setDashboardData(prevState => ({
          ...prevState, // Keep existing data. Prevents state overwrites, keeps old values.
          totalUser: data.data.userCount || 0,
        }));
      })
      .catch(error => {
        console.error("Error fetching user count:", error);
      });

    const fetchBookCount = fetch(`${baseUrl}/api/v1/users/getBookCount`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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
        // console.log("Book API Response:", data);
        setDashboardData(prevState => ({
          ...prevState, // Keep existing data
          totalBooks: data.data.bookCount || 0,
        }));
      })
      .catch(error => {
        console.error("Error fetching book count:", error);
      });

    const fetchrecentActivities = fetch(`${baseUrl}/api/v1/activity/getRecentActivity`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setRecentActivities(data.data || []);
      })
      .catch(error => console.error("Error fetching recent activities:", error));

    Promise.all([fetchUserCount, fetchBookCount, fetchrecentActivities]); //  Runs multiple API calls together for faster execution.
  }, []); // Runs only once when the component mounts

  return (
    <div className="admin-dashboard">
      {/* <AdminHeader /> */}
      <h1>Welcome to the Admin Dashboard</h1>
      <div className="dashboard-cards">
        <div className="card">
          <h2>Total Users</h2>
          <p>{dashboardData.totalUser}</p>
        </div>
        <div className="card">
          <h2>Books Uploaded</h2>
          <p>{dashboardData.totalBooks}</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <h2>Recent Activities</h2>
        <ul>
          {recentActivities.length > 0 ? (
            recentActivities.map(activity => (
              <li key={activity._id}>{activity.description}</li>
            ))
          ) : (
            <li>No recent activities available</li>
          )}
        </ul>

      </div>
    </div>
  );
};

export default AdminDashboard;