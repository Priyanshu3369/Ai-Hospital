import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();               // <--- load env first

import { connectDB } from "./config/db.js";
connectDB();                   // <--- now MONGO_URI will load correctly

const app = express();

app.use(cors());
app.use(express.json());

// routes
import testRoute from "./routes/testRoute.js";
app.use("/api/test", testRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
