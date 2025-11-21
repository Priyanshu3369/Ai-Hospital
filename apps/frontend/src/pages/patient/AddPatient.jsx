import { useForm } from "react-hook-form";
import axios from "axios";
import { Button } from "@/components/ui/button";

function AddPatient() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/patients", data, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      alert("Patient added!");
    } catch (err) {
      alert("Failed to add patient");
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-md mx-auto">
        <input {...register("name")} className="border p-2 w-full" placeholder="Patient Name" />
        <input {...register("age")} className="border p-2 w-full" placeholder="Age" />
        <select {...register("gender")} className="border p-2 w-full">
          <option>male</option><option>female</option><option>other</option>
        </select>
        <input {...register("phone")} className="border p-2 w-full" placeholder="Phone" />
        <input {...register("address")} className="border p-2 w-full" placeholder="Address" />

        <Button type="submit" className="w-full">Add Patient</Button>
      </form>
    </div>
  );
}

export default AddPatient;
