import express from "express";
import { supabase } from "./config/supabase.js";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
export const app = express();

app.listen(PORT, () => console.log(`Server listeninng in port ${PORT}`));
