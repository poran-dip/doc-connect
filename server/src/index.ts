import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { dbConnect } from "./db/connect";

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN;
if (!CORS_ORIGIN) {
  throw new Error("CORS origin is not defined");
}

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", async (_req: express.Request, res: express.Response) => {
  res.json({ message: "Server is running" });
})

app.use("/api", routes);

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

await dbConnect();

const PORT = process.env.PORT;
if(!PORT) {
  throw new Error("Port is not defined");
}

app.listen(PORT)
  .on("listening", () => console.log(`Server running on port ${PORT}`))
  .on("error", (err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
