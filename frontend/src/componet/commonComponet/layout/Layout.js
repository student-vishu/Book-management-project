import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router";
import Home from '../../pages/Home.jsx';
import Login from '../../pages/Login.jsx'
import "../../../styles/Layout.css";
import Library from '../../pages/Library.jsx';
import Registration from '../../pages/Registration.jsx';
import Protected from './Protected.js';
import Logout from '../Logout.js';
import BookDisplay from '../../pages/BookDisplay.jsx';
import UserAuthentication from './UserAuthentication.js';
import AdminDashboard from "../../../admin/Pages/AdminDashboard.jsx"
import ManageUsers from '../../../admin/Pages/ManageUsers.jsx';
import ManageBooks from '../../../admin/Pages/ManageBooks.jsx';
import Profile from '../../../admin/Pages/Profile.jsx';
import AddBook from '../../pages/AddBook.jsx';
import UserProfile from '../../pages/UserProfile.jsx';




const Layout = () => {
    return (
        <div className='body'>
            <BrowserRouter>
                <Routes>
                    {/* user */}
                    <Route path='/*' element={<Protected Componet={Home} />} />
                    <Route path='/' element={<Protected Componet={Home} />} />
                    <Route path='/Book-Management' element={<Protected Componet={Home} />} />
                    <Route path='/library' element={<Protected Componet={Library} />} />
                    <Route path='/Login' element={<UserAuthentication Componet={Login} />} />
                    <Route path='/Registration' element={<UserAuthentication Componet={Registration} />} />
                    <Route path='/BookDisplay' element={<Protected Componet={BookDisplay} />} />
                    <Route path='/BookDisplay/bookId=:id' element={<Protected Componet={BookDisplay} />} />
                    <Route path='/AddBook' element={<Protected Componet={AddBook} />} />
                    <Route path='/UserProfile' element={<Protected Componet={UserProfile} />} />
                    {/* admin */}
                    <Route path='/admin-dashboard' element={<Protected AdminComponet={AdminDashboard} />} />
                    <Route path='/ManageUsers' element={<Protected AdminComponet={ManageUsers} />} />
                    <Route path='/ManageBooks' element={<Protected AdminComponet={ManageBooks} />} />
                    <Route path='/Profile' element={<Protected AdminComponet={Profile} />} />

                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default Layout;
