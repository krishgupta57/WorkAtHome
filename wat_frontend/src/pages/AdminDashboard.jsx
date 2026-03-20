import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/admin-dashboard/")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []); 

  function handledelete(id) {
    axios.delete(`http://127.0.0.1:8000/admin-dashboard/${id}/`)
      .then((res) => {
        setUsers(users.filter((user) => user.id !== id));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <table className="w-full bg-white shadow rounded">

        <thead>
          <tr className="border-b">
            <th className="p-3">ID</th>
            <th className="p-3">Email</th>
            <th className="p-3">Password</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b text-center">
              <td className="p-3">{user.id}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.password}</td>
              <td className="p-3">
                <button className="bg-red-500 text-white p-2 rounded hover:bg-white hover:text-red-500 cursor-pointer" onClick={() => handledelete(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default AdminDashboard;