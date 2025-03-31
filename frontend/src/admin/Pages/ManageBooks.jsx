import React, { useState, useEffect } from "react";
import "../styles/managebooks.css";
//import AdminHeader from "../components/header/AdminHeader";
//import useApiUrl from "../components/useApiUrl";
import useApiUrl from "../../componet/commonComponet/useApiUrl.js";

const ManageBooks = () => {

  const baseUrl = useApiUrl();
  const [books, setbooks] = useState([]);

  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch(`${baseUrl}/api/v1/users/getAllBooks`, {
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
        setbooks(data.data || []);
      })
      .catch((error) => console.error("Error Featching Books ", error))
  }, []);

  const handleDeleteBook = async (bookId) => {

    const token = localStorage.getItem("token");

    try {

      const response = await fetch(`${baseUrl}/api/v1/users/deleteBook/${bookId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setbooks(prevState => prevState.filter(book => book._id !== bookId));
    } catch (error) {
      console.error("Error Delete Books  ", error);
    }
  };

  return (
    <div className="manage-books">
      {/* <AdminHeader /> */}
      <h1>Manage Books</h1>

      <table>
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Title</th>
            <th>Book Image</th>
            <th>Author</th>
            <th>Published Year</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr key={book._id}>
              <td>{index + 1}</td>
              <td>{book.bookName}</td>
              <td><img src={book.coverImage} alt="bookimage" height={50} width={50} /></td>
              <td>{book.author}</td>
              <td>{book.publishedYear}</td>
              <td>{book.category?.name || "No Category"}</td>
              <td>{book.price}</td>
              <td>
                {/* <button className="edit-btn">Edit</button> */}
                <button className="delete-btn" onClick={() => { handleDeleteBook(book._id) }} >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageBooks;

