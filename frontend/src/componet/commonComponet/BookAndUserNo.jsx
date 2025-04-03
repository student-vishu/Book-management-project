import React from 'react'
import "../../styles/BookAndUserNo.css"

const BookAndUserNo = (props) => {

    const { userNoData, bookNoData } = props
    return (
        <div className='website-info'>
            <h1 className='heading'>Books and members currently on our website</h1>
            <div className='user-book-data'>
                <div className='data'>
                    <h2 className='heding'>user</h2>
                    <h3 className='no'>{userNoData}</h3>
                </div>
                <div className='data'>
                    <h2 className='heding'>book</h2>
                    <h3 className='no'> {bookNoData} </h3>
                </div>
            </div>
        </div>
    )
}

export default BookAndUserNo
