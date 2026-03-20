import { use, useEffect, useState } from "react";
import axios from "axios";

function UserDashboard() {

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/all-bookings/")
      .then((res) => {
        setBookings(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);


  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold mb-6">
        All Bookings
      </h1>

      <table className="w-full bg-white shadow-lg rounded-xl overflow-hidden">

        <thead className="bg-black text-white">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Name</th>
            <th className="p-4">Ph. Number</th>
            <th className="p-4">Service</th>
            <th className="p-4">Date</th>
          </tr>
        </thead>

        <tbody>

          {bookings.length > 0 ? (

            bookings.map((item) => (

              <tr key={item.id} className="text-center border-b hover:bg-gray-50">

                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.phone}</td>
                <td className="p-4">{item.service}</td>
                <td className="p-4">{item.date}</td>

              </tr>

            ))

          ) : (

            <tr>
              <td colSpan="5" className="p-5 text-center text-gray-500">
                No bookings yet
              </td>
            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

export default UserDashboard;