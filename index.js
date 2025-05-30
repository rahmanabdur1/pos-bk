import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import userRoleRoutes from "./routes/userRole.route.js";
import userRoutes from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // <- handles preflight

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

app.use("/api/userrole", userRoleRoutes);
app.use("/api/user", userRoutes);

app.get('/', async (req, res) => {
  res.send('POS portal server is running');
});

connectDB();

export default app;
