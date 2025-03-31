import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router'
import "../../../admin/styles/adminheader1.css"
import useApiUrl from '../useApiUrl';

//chang
const AdminHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const baseurl = useApiUrl();
    const navigate = useNavigate();

    const userLogout = async () => {
        // console.log("logout")
        try {
            const response = await fetch(`${baseurl}/api/v1/users/logout`, {
                method: 'POST',
                credentials: 'include',
                mode: 'cors', // Ensure CORS mode
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const responseData = await response.json();

            if (responseData.statuscode === 200) {
                localStorage.clear();
                navigate('/Login'); // Redirect to Login
            } else {
                alert('Logout failed, please try again.');
            }
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    return (
        <div className='header'>
            <div className='navebar'>
                <div className='logo'>
                    <NavLink to={"/admin-dashboard"} >
                        <img src="./images/logo.png" alt="logo" className='logo' />
                    </NavLink>
                </div>
                <div className='menu-icon' onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </div>
                <div className={`nav-link ${menuOpen ? "show" : ""}`}>
                    <ul>
                        <li><NavLink to={"/admin-dashboard"} >Dashboard   </NavLink></li>
                        <li><NavLink to={"/ManageUsers"} >ManageUsers</NavLink></li>
                        <li><NavLink to={"/ManageBooks"} >ManageBooks</NavLink></li>
                        <li><NavLink to={"/Profile"} >Profile</NavLink></li>
                        <li><NavLink to={"/Book-Management"} >client</NavLink></li>
                        <li><button onClick={userLogout} className="logout-btn">Logout</button></li>
                        {/* <li><NavLink to={"/loogout"} >Logout</NavLink></li> */}
                    </ul>
                </div>
            </div>

        </div>
    )
}

export default AdminHeader;