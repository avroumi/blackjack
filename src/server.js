import express from "express";
import { supabase } from "./config/supabase.js";
import "dotenv/config";
import routerGame from "./routes/games.routes.js";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use(routerGame);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => console.log(`Server listeninng in port ${PORT}`));
