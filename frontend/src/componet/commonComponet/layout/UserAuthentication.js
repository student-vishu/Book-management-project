import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';

const UserAuthentication = (props) => {
    const { Componet } = props;
    const [userLogout, setUserLogout] = useState(null)


    const navigate = useNavigate()

    useEffect(() => {
        setUserLogout(false)
        const userLogin = localStorage.getItem("userLogin")
        if (!userLogin) {
            setUserLogout(true)
        } else {
            navigate("/Book-Management")
        }
    }, [navigate])


    return (
        <>
            {userLogout ?
                <Componet />
                : null}
        </>
    )
}

export default UserAuthentication
