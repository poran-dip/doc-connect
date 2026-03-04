import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import Doctor from "../models/Doctor";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Admin"),
  async (req: Request, res: Response) => {
    const { name, email, password, specialization, status } = req.body;
    const existing = await Doctor.findOne({ email });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const doctor = await Doctor.create({
      name,
      email,
      password: hashed,
      specialization,
      status,
    });
    res.status(201).json(doctor);
  },
);

router.get("/", authenticate, async (_req: Request, res: Response) => {
  const doctors = await Doctor.find().select("-password");
  res.json(doctors);
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const doctor = await Doctor.findById(req.params.id).select("-password");
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  res.json(doctor);
});

router.put("/:id", authenticate, async (req: Request, res: Response) => {
  const isOwner = req.user?.id === req.params.id;
  const isAdmin = req.user?.role === "Admin";
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (req.body.password)
    req.body.password = await bcrypt.hash(req.body.password, 10);
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
  }).select("-password");
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  res.json(doctor);
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const isOwner = req.user?.id === req.params.id;
  const isAdmin = req.user?.role === "Admin";
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  res.status(204).send();
});

export default router;
