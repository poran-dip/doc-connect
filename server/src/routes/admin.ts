import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { name, email, password, location } = req.body;
  const existing = await Admin.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ name, email, password: hashed, location });
  res.status(201).json(admin);
});

router.get(
  "/",
  authenticate,
  authorize("Admin"),
  async (_req: Request, res: Response) => {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  },
);

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const admin = await Admin.findById(req.params.id).select("-password");
  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }
  res.json(admin);
});

router.put(
  "/:id",
  authenticate,
  authorize("Admin"),
  async (req: Request, res: Response) => {
    const isOwner = req.user?.id === req.params.id;
    if (!isOwner) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.body.password)
      req.body.password = await bcrypt.hash(req.body.password, 10);
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    }).select("-password");
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.json(admin);
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  async (req: Request, res: Response) => {
    const isOwner = req.user?.id === req.params.id;
    if (!isOwner) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.status(204).send();
  },
);

export default router;
