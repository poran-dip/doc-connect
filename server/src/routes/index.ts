import { Router } from "express";
import patientRoute from "./patient";
import doctorRoute from "./doctor";
import adminRoute from "./admin";
import authRoute from "./auth";
import appointmentRoute from "./appointment";

const router = Router();

router.use("/auth", authRoute);
router.use("/patient", patientRoute);
router.use("/doctor", doctorRoute);
router.use("/admin", adminRoute);
router.use("/appointment", appointmentRoute);

export default router;
