import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testRoute from "./routes/testRoute.js";
import authRoute from "./routes/authRoute.js";
import protectedRoute from "./routes/protectedRoute.js";
import patientRoute from "./routes/patientRoute.js";
import doctorRoute from "./routes/doctorRoute.js";

dotenv.config();

import { connectDB } from "./config/db.js";
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/test", testRoute);
app.use("/api/auth", authRoute);
app.use("/api/protected", protectedRoute);
app.use("/api/patients", patientRoute);
app.use("/api/doctors", doctorRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));