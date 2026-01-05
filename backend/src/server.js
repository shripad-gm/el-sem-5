import express from "express";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";

// routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";

const app = express();

/* --------------------
   MIDDLEWARES
-------------------- */

// parse JSON body
app.use(express.json());

// parse cookies (VERY IMPORTANT for auth)
app.use(cookieParser());

/* --------------------
   ROUTES
-------------------- */

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

/* --------------------
   HEALTH CHECK
-------------------- */
app.get("/", (req, res) => {
  res.json({ status: "Civic Monitor API running 🚀" });
});

/* --------------------
   SERVER
-------------------- */
app.listen(ENV.PORT, () => {
  console.log(`✅ Server running on port ${ENV.PORT}`);
});
