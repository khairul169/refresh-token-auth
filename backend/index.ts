import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

app.use(cors());
app.use(express.json());

// create GET route
app.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

const users = [
  { id: 1, username: "admin", password: "123456" },
  { id: 2, username: "user", password: "123456" },
];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const payload = { ...user, password: undefined };
  const accessToken = jwt.sign(payload, "secret", {
    expiresIn: 5,
  });
  const refreshData = { id: user.id, refresh: true };
  const refreshToken = jwt.sign(refreshData, "secret", {
    expiresIn: "1y",
  });

  res.json({
    success: true,
    accessToken,
    refreshToken,
  });
});

app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  jwt.verify(refreshToken, "secret", (err: any, data: any) => {
    if (err || data?.refresh !== true) {
      return res.status(401).send({ success: false, message: "Unauthorized." });
    }

    const user = users.find((u) => u.id === data.id);
    if (!user) {
      return res.status(401).send({ success: false, message: "Unauthorized." });
    }

    const payload = { ...user, password: undefined };
    const accessToken = jwt.sign(payload, "secret", {
      expiresIn: 5,
    });

    res.json({ success: true, accessToken });
  });
});

app.use(auth);
app.get("/user", (req, res) => {
  res.json({
    success: true,
    result: (req as any).user,
  });
});

// listen for requests
app.listen(3000, () => {
  console.log("Server is listening on http://localhost:3000");
});

async function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).send({ success: false, message: "Unauthorized." });
  }

  jwt.verify(token, "secret", (err, data: any) => {
    if (err || data?.refresh !== undefined) {
      return res.status(401).send({ success: false, message: "Unauthorized." });
    }

    (req as any).user = data;
    next();
  });
}
