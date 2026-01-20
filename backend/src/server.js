import express from "express";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import geoRoutes from "./routes/geo.route.js";
import issueRoutes from "./routes/issue.route.js";
import issueCategoryRoutes from "./routes/issueCategory.route.js";
import adminRoutes from "./routes/admin.route.js";


const app = express();

const allowedOrigins = [
  "https://civic-sense-rvce.netlify.app",
  "https://super-crumble-3d1a8f.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://civic-monitor.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/geo", geoRoutes);
app.use("/issues", issueCategoryRoutes);
app.use("/issues", issueRoutes);
app.use("/admin", adminRoutes);




app.get("/", (req, res) => {
  res.json({ status: "Civic Monitor API running " });
});


app.listen(ENV.PORT, () => {
  console.log(`✅ Server running on port ${ENV.PORT}`);
});
