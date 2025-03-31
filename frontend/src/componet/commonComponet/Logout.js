//     naviget("/Login")
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import useApiUrl from './useApiUrl';

const Logout = () => {

    const baseurl = useApiUrl()

    const naviget = useNavigate();
    const userLogout = async () => {
        localStorage.clear()
        naviget("/Login")

        const loginUser = JSON.parse(localStorage.getItem("userLogin")) || null;

        try {

            const response = await fetch(`${baseurl}/api/v1/users/logout`, {
                method: 'POST',
                credentials: 'include'
            })
            const responseData = response.json()

            if (responseData.statuscode === 200) {
                localStorage.clear()
                naviget("/Login")
            }
        } catch (error) {
            console.log("error", error);

        }
    }

    useEffect(() => {
        userLogout()
    }, [])

    return (
        <>
            {
                userLogout()
            }
        </>
    )
}

export default Logout
