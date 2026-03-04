import { Router, type Request, type Response } from "express";
import Appointment from "../models/Appointment";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Patient"),
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const { department, appointmentTime, emergency } = req.body;
    const appointment = await Appointment.create({
      department,
      appointmentTime,
      emergency,
      patientId: req.user?.id,
      status: "pending",
    });
    res.status(201).json(appointment);
  },
);

router.get("/", authenticate, async (req: Request, res: Response) => {
  const { patientId, assignedDoctor } = req.query;
  const filter = {
    ...(patientId ? { patientId } : {}),
    ...(assignedDoctor ? { assignedDoctor } : {}),
  };
  const appointments = await Appointment.find(filter)
    .populate("patientId", "-password")
    .populate("assignedDoctor", "-password");
  res.json(appointments);
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patientId", "-password")
    .populate("assignedDoctor", "-password");
  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  const isOwner = req.user?.id === appointment.patientId.toString();
  const isPrivileged =
    req.user?.role === "Admin" || req.user?.role === "Doctor";
  if (!isOwner && !isPrivileged) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.json(appointment);
});

router.put(
  "/:id",
  authenticate,
  authorize("Admin", "Doctor"),
  async (req: Request, res: Response) => {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.json(appointment);
  },
);

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  const isOwner = req.user?.id === appointment.patientId.toString();
  const isAdmin = req.user?.role === "Admin";
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await appointment.deleteOne();
  res.status(204).send();
});

export default router;
