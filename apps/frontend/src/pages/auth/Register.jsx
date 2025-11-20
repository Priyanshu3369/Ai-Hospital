import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import axios from "axios";

function Register() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", data);
      alert("Account created");
    } catch (err) {
      alert("Registration Failed");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">
        <h1 className="text-xl font-bold text-center">Register</h1>

        <input {...register("name")} className="border w-full p-2 rounded" placeholder="Name" />
        <input {...register("email")} className="border w-full p-2 rounded" placeholder="Email" />
        <input {...register("password")} type="password" className="border w-full p-2 rounded" placeholder="Password" />
        <select {...register("role")} className="border w-full p-2 rounded">
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        <Button type="submit" className="w-full">Register</Button>
      </form>
    </div>
  );
}

export default Register;
