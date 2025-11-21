import { useForm } from "react-hook-form";
import axios from "axios";
import { Button } from "@/components/ui/button";

function AddDoctor() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    await axios.post("http://localhost:5000/api/doctors", data, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    alert("Doctor Added!");
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-md mx-auto">
        <input {...register("name")} className="border p-2 w-full" placeholder="Doctor Name" />
        <input {...register("specialization")} className="border p-2 w-full" placeholder="Specialization" />
        <input {...register("phone")} className="border p-2 w-full" placeholder="Phone" />
        <input {...register("experience")} className="border p-2 w-full" placeholder="Experience Years" />

        <Button className="w-full" type="submit">Add Doctor</Button>
      </form>
    </div>
  );
}

export default AddDoctor;
