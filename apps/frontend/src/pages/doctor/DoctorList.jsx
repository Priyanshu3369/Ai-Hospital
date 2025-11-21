import { useEffect, useState } from "react";
import axios from "axios";

function DoctorList() {
  const [doctors, setDoctors] = useState([]);

  const loadDoctors = async () => {
    const res = await axios.get("http://localhost:5000/api/doctors", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    setDoctors(res.data);
  };

  useEffect(() => { loadDoctors(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Doctor List</h1>
      <ul className="space-y-2">
        {doctors.map((d) => (
          <li key={d._id} className="p-4 border rounded shadow flex justify-between">
            <span>{d.name} — {d.specialization}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default DoctorList;
