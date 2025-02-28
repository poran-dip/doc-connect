import { Router, Request, Response, NextFunction } from "express";
import { Doctormodel, AppointmentRequestModel } from "../database/db";
import jwt from "jsonwebtoken";
import { JWT_DOCTOR_SECRET } from "../config";

export const doctorRoute = Router();

// Authentication for doctors
doctorRoute.post("/signin", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const doctor = await Doctormodel.findOne({
        email: email,
        password: password
    });

    if (doctor) {
        const token = jwt.sign({
            id: doctor._id
        }, JWT_DOCTOR_SECRET);
        
        res.json({
            token,
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                status: doctor.status
            }
        });
    } else {
        res.status(403).json({
            message: "Invalid Credentials"
        });
    }
});

// Middleware to verify doctor token
const verifyDoctorToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_DOCTOR_SECRET) as { id: string };
        req.body.doctorId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};

// Get doctor's assigned appointments
doctorRoute.get("/my-appointments", verifyDoctorToken, async (req: Request, res: Response) => {
    const { doctorId } = req.body;
    
    try {
        const appointments = await AppointmentRequestModel.find({
            assignedDoctor: doctorId,
            status: "assigned"
        }).sort({ emergency: -1, appointmentTime: 1 });
            
        res.json({ appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
});

// Update doctor status
doctorRoute.post("/update-status", verifyDoctorToken, async (req: any, res: any) => {
    const { doctorId, status } = req.body;
    
    if (!status || !["available", "busy"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }
    
    try {
        const doctor = await Doctormodel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        doctor.status = status;
        await doctor.save();
        
        res.json({ message: "Status updated successfully", status });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Error updating status" });
    }
});

// Complete an appointment
doctorRoute.post("/complete-appointment", verifyDoctorToken, async (req: any, res: any) => {
    const { appointmentId, doctorId } = req.body;
    
    if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
    }
    
    try {
        const appointment = await AppointmentRequestModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        // Fixed the nullable reference
        if (!appointment.assignedDoctor || appointment.assignedDoctor.toString() !== doctorId) {
            return res.status(403).json({ message: "This appointment is not assigned to you" });
        }
        
        // Update the appointment
        appointment.status = "completed";
        appointment.completedBy = doctorId;
        appointment.completedAt = new Date();
        await appointment.save();
        
        // Update doctor status
        const doctor = await Doctormodel.findById(doctorId);
        if (doctor) {
            doctor.status = "available";
            await doctor.save();
        }
        
        res.json({ message: "Appointment completed successfully" });
    } catch (error) {
        console.error("Error completing appointment:", error);
        res.status(500).json({ message: "Error completing appointment" });
    }
});

export default doctorRoute;