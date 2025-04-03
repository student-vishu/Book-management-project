
import React from 'react';
import '../../../styles/Footer.css';
import { NavLink, useLocation, useNavigate } from 'react-router';

const Footer = () => {
    return (
        <footer className='footer'>
            <div className='container'>
                <div className='inner_footer_section'>
                    <div className='logo_setion'>
                        <NavLink to={"/Book-Management"}>
                            <img src="./images/logo.png" alt="logo" className='logo' height={80} width={200} />
                        </NavLink>
                    </div>
                    <div className='menu_container'>
                        <div className='menus'>
                            <NavLink to={"/Home"}>Home</NavLink>
                            <NavLink to={"/library"}>Library</NavLink>
                            <NavLink to={"/BookDisplay"}>Books</NavLink>
                        </div>
                    </div>
                    <div className='book_menu_container'>
                        <div className='menus'>
                            <NavLink to={"/AddBook"}>AddBook</NavLink>
                            <NavLink to={"/UserProfile"}>Profile</NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
