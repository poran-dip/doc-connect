import { Router, Request, Response, NextFunction } from "express";
import { Patientmodel, AppointmentRequestModel, Doctormodel } from "../database/db";
import jwt from "jsonwebtoken";
import { JWT_PATIENT_SECRET } from "../config";

export const patientroute = Router();

// Define custom interface for Request with patientId
interface PatientRequest extends Request {
  patientId?: string;
}

// Authentication routes
patientroute.post("/signup", async (req, res) => {
    const { name, age, password, email } = req.body;
    
    try {
        await Patientmodel.create({
            email,
            age,
            password,
            name
        });
        
        res.json({
            message: "you are signed up"
        });
    } catch (e) {
        res.status(500).send({ error: "An error occurred" });
    }
});

patientroute.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    
    const finduser = await Patientmodel.findOne({
        email: email,
        password: password
    });

    if (finduser) {
        const token = jwt.sign({
            id: finduser._id
        }, JWT_PATIENT_SECRET);
        
        res.json({
            token,
            user: {
                id: finduser._id,
                name: finduser.name,
                email: finduser.email,
                age: finduser.age
            }
        });
    } else {
        res.status(403).json({
            message: "Invalid Credentials"
        });
    }
});

// Middleware to verify patient token
const verifyPatientToken = (req: PatientRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_PATIENT_SECRET) as { id: string };
        req.patientId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};

// Appointment request route
patientroute.post("/request-appointment", verifyPatientToken, async (req: any, res: any, next: any) => {
    const { name, age, department, appointmentTime, emergency } = req.body;
    const patientId = req.patientId;
    
    if (!name || !age || !department || !appointmentTime || !patientId) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    try {
        const newRequest = await AppointmentRequestModel.create({
            name,
            age,
            department,
            appointmentTime: new Date(appointmentTime),
            emergency: emergency || false,
            patientId
        });
        
        res.status(201).json({ 
            message: "Appointment request submitted successfully", 
            request: newRequest 
        });
    } catch (error) {
        console.error("Error creating appointment request:", error);
        res.status(500).json({ message: "Error creating appointment request" });
    }
});

// Get patient's appointment requests
patientroute.get("/my-appointments", verifyPatientToken, async (req: any, res: any) => {
    const patientId = req.patientId;
    
    if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
    }
    
    try {
        const patient = await Patientmodel.findById(patientId);
        
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        const appointments = await AppointmentRequestModel.find({ patientId })
            .populate('assignedDoctor', 'name specialization')
            .sort({ appointmentTime: 1 });
            
        res.json({ 
            appointments, 
            user: {
                id: patient._id,
                name: patient.name,
                email: patient.email
            }
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
});

// Cancel an appointment
patientroute.put("/cancel-appointment/:appointmentId", verifyPatientToken, async (req: any, res: any) => {
    const { appointmentId } = req.params;
    const patientId = req.patientId;
    
    if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
    }
    
    try {
        const appointment = await AppointmentRequestModel.findOne({
            _id: appointmentId,
            patientId: patientId
        });
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        if (appointment.status === "completed") {
            return res.status(400).json({ message: "Cannot cancel a completed appointment" });
        }
        
        appointment.status = "cancelled";
        await appointment.save();
        
        res.json({ message: "Appointment cancelled successfully", appointment });
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        res.status(500).json({ message: "Error cancelling appointment" });
    }
});

// Update patient profile
patientroute.put("/update-profile", verifyPatientToken, async (req: any, res: any) => {
    const { name, age, email } = req.body;
    const patientId = req.patientId;
    
    if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
    }
    
    try {
        const patient = await Patientmodel.findById(patientId);
        
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        if (name) patient.name = name;
        if (age) patient.age = age;
        if (email) patient.email = email;
        
        await patient.save();
        
        res.json({
            message: "Profile updated successfully",
            user: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                age: patient.age
            }
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
});

// Get available doctors by department
patientroute.get("/available-doctors/:department", verifyPatientToken, async (req: PatientRequest, res: Response) => {
    const { department } = req.params;
    
    try {
        const doctors = await Doctormodel.find({
            specialization: department,
            availability: true,
            status: "available"
        }).select('name specialization');
        
        res.json({ doctors });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Error fetching doctors" });
    }
});

export default patientroute;