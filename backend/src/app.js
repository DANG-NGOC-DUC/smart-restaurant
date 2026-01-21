import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabase from "./config/supabase.js";

dotenv.config();

const app = express();

// CORS - cho phép frontend gọi API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("auth.users").select("*");

  if (error) return res.status(500).json(error);
  res.json(data);
});

export default app;
