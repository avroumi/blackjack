import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.PRIVATE_KEY,
);

console.log("supabase initiliazed");

export const playerTable = supabase.from("player");
export const roundTable = supabase.from("round");
