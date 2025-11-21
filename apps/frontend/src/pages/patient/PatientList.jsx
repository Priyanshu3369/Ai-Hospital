import { useEffect, useState } from "react";
import axios from "axios";

function PatientList() {
  const [patients, setPatients] = useState([]);

  const loadPatients = async () => {
    const res = await axios.get("http://localhost:5000/api/patients", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    setPatients(res.data);
  };

  useEffect(() => { loadPatients(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Patients</h1>
      <ul className="space-y-2">
        {patients.map((p) => (
          <li key={p._id} className="p-3 border rounded shadow">
            {p.name} — {p.phone} — {p.gender}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PatientList;
