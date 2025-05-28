import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import userRoleRoutes from "./routes/userRole.route.js";
import userRoutes from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import userMedia from "./routes/media.route.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000', 
  ],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use("/api/super-new-library", userMedia);
app.use("/api/userrole", userRoleRoutes);
app.use("/api/user", userRoutes);

app.get('/', async (req, res) => {
  res.send('POS portal server is running');
});

connectDB();

export default app;
