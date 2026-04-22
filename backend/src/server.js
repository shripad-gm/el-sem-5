import express from "express";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";

// routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import geoRoutes from "./routes/geo.route.js";
import issueRoutes from "./routes/issue.route.js";
import issueCategoryRoutes from "./routes/issueCategory.route.js";
import adminRoutes from "./routes/admin.route.js";


const app = express();

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/issues", issueCategoryRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.json({ status: "Civic Monitor API running" });
});


app.listen(ENV.PORT, () => {
  console.log(`✅ Server running on port ${ENV.PORT}`);
});
