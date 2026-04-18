import express from "express";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import cors from "cors";
import path from "path";

// routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import geoRoutes from "./routes/geo.route.js";
import issueRoutes from "./routes/issue.route.js";
import issueCategoryRoutes from "./routes/issueCategory.route.js";
import adminRoutes from "./routes/admin.route.js";


const app = express();
const __dirname = path.resolve();

if (ENV.NODE_ENV !== "production") {
  app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    credentials: true
  }));
}

app.use(express.json());
app.use(cookieParser());


app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/geo", geoRoutes);
app.use("/issues", issueCategoryRoutes);
app.use("/issues", issueRoutes);
app.use("/admin", adminRoutes);

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ status: "Civic Monitor API running" });
  });
}

app.listen(ENV.PORT, () => {
  console.log(`✅ Server running on port ${ENV.PORT}`);
});
