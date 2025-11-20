import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";

function Login() {
  const { register, handleSubmit } = useForm();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onSubmit = async (data) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", data);
    setAuth({ token: res.data.token, user: res.data.user });
    localStorage.setItem("token", res.data.token);
    alert("Login success stored in global state");
  };


  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">
        <h1 className="text-xl font-bold text-center">Login</h1>

        <input {...register("email")} className="border w-full p-2 rounded" placeholder="Email" />
        <input {...register("password")} type="password" className="border w-full p-2 rounded" placeholder="Password" />

        <Button type="submit" className="w-full">Login</Button>
      </form>
    </div>
  );
}

export default Login;
