import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import Patient from "../models/Patient";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, authorize("Admin"), async (req: Request, res: Response) => {
  const { name, email, password, age } = req.body;
  const existing = await Patient.findOne({ email });
  if (existing) { res.status(409).json({ error: "Email already in use" }); return; }
  const hashed = await bcrypt.hash(password, 10);
  const patient = await Patient.create({ name, email, password: hashed, age });
  res.status(201).json(patient);
});

router.get("/", authenticate, authorize("Admin", "Doctor"), async (_req: Request, res: Response) => {
  const patients = await Patient.find().select("-password");
  res.json(patients);
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const patient = await Patient.findById(req.params.id).select("-password");
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(patient);
});

router.put("/:id", authenticate, async (req: Request, res: Response) => {
  const isOwner = req.user?.id === req.params.id;
  const isAdmin = req.user?.role === "Admin";
  if (!isOwner && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 10);
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" }).select("-password");
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(patient);
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const isOwner = req.user?.id === req.params.id;
  const isAdmin = req.user?.role === "Admin";
  if (!isOwner && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  res.status(204).send();
});

export default router;
