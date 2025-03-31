import React, { useEffect } from 'react'
import { useNavigate } from 'react-router';
import Header from '../header/Header';
import useApiUrl from '../useApiUrl';
import AdminHeader from '../header/AdminHeader';
import "../../../styles/pages_styles/Protected.css"

const Protected = (props) => {
    const { Componet, AdminComponet } = props;
    const baseurl = useApiUrl

    // const refreshAccessToken = async () => {
    //     try {
    //         const response = await fetch(`${baseurl}/api/v1/users/refresh-token`, {
    //             method: "POST",
    //             credentials: "include" // Important for sending cookies
    //         });

    //         if (!response.ok) {
    //             throw new Error("Failed to refresh token");
    //         }

    //         const data = await response.json();
    //         console.log("Token refreshed:", data);
    //     } catch (error) {
    //         console.error("Refresh Token Error:", error);
    //     }
    // };

    let userLogin = localStorage?.getItem('userLogin') || "";
    let userAdminLogin = localStorage?.getItem('userAdminLogin') || "";
    const naviget = useNavigate();
    useEffect(() => {
        let userLogin = localStorage?.getItem('userLogin') || "";
        let userAdminLogin = localStorage?.getItem('userAdminLogin') || "";
        if (!userLogin && !userAdminLogin) {
            naviget('/Login')
        }
        scrollToTop()
    }, [naviget])
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {
                (userLogin || userAdminLogin) && Componet && !AdminComponet ?
                    <>
                        <Header />
                        <Componet />
                        <div className='top_arrow_circle' onClick={scrollToTop} >
                            <img src="./images/top-arrow-different.jpg" alt="truck images" width={30} height={30} />
                        </div>
                    </>
                    : null
            }
            {
                userAdminLogin && AdminComponet && !Componet ?
                    <>

                        <AdminHeader />
                        <AdminComponet />
                        <div className='top_arrow_circle' onClick={scrollToTop} >
                            <img src="./images/top-arrow-different.jpg" alt="truck images" width={30} height={30} />
                        </div>
                    </>
                    : null
            }
        </>
    )
}

export default Protected;



