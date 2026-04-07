import express, { Express } from "express";
import cors from "cors";
import router from "./routes";

const SERVER_PORT = 3000;

const app: Express = express();
app.use(express.json());
app.use(cors());

//handle routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("server is working!");
});

app.listen(SERVER_PORT, () => {
  console.log(`server running on http://localhost:${SERVER_PORT}`);
});
