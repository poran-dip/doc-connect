import { Router, Request, Response, NextFunction } from "express";
import { Hospitalmodel, AppointmentRequestModel, Doctormodel } from "../database/db";
import jwt from "jsonwebtoken";
import { JWT_HOSPITAL_SECRET } from "../config";

export const hospitalRoute = Router();

// Authentication for hospital admin
hospitalRoute.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    
    const hospital = await Hospitalmodel.findOne({
        email: email,
        password: password
    });

    if (hospital) {
        const token = jwt.sign({
            id: hospital._id
        }, JWT_HOSPITAL_SECRET);
        
        res.json({
            token,
            hospital: {
                id: hospital._id,
                name: hospital.name,
                email: hospital.email,
                location: hospital.location
            }
        });
    } else {
        res.status(403).json({
            message: "Invalid Credentials"
        });
    }
});

// Middleware to verify hospital token - fixed return type
const verifyHospitalToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_HOSPITAL_SECRET) as { id: string };
        req.body.hospitalId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};

// Get all appointment requests
hospitalRoute.get("/appointment-requests", verifyHospitalToken, async (req, res) => {
    try {
        const requests = await AppointmentRequestModel.find()
            .sort({ emergency: -1, appointmentTime: 1 })
            .populate('assignedDoctor', 'name specialization')
            .populate('patientId', 'name') as any[]; // Populate patient details
            
        // Transform requests to match frontend expectations
        const transformedRequests = requests.map(request => ({
            _id: request._id,
            patientName: request.patientId?.name || request.name,
            appointmentTime: request.appointmentTime,
            emergency: request.emergency,
            status: request.status,
            symptoms: request.department, // Using department as symptoms for now
            assignedDoctor: request.assignedDoctor
        }));
            
        res.json({ requests: transformedRequests });
    } catch (error) {
        console.error("Error fetching appointment requests:", error);
        res.status(500).json({ message: "Error fetching appointment requests" });
    }
});

// Get available doctors
hospitalRoute.get("/available-doctors", verifyHospitalToken, async (req, res) => {
    try {
        const doctors = await Doctormodel.find({ 
            status: "available",
            availability: true
        }).select('name specialization');
        
        res.json({ doctors });
    } catch (error) {
        console.error("Error fetching available doctors:", error);
        res.status(500).json({ message: "Error fetching available doctors" });
    }
});

// Assign doctor to appointment
hospitalRoute.post("/assign-doctor", verifyHospitalToken, async (req: any, res: any) => {
    const { requestId, doctorId } = req.body;
    
    if (!requestId || !doctorId) {
        return res.status(400).json({ message: "Request ID and doctor ID are required" });
    }
    
    try {
        // Find the appointment request
        const request = await AppointmentRequestModel.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Appointment request not found" });
        }
        
        // Find the doctor
        const doctor = await Doctormodel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        // Check doctor availability
        if (doctor.status !== "available" || !doctor.availability) {
            return res.status(400).json({ message: "Doctor is not currently available" });
        }
        
        // Check if request is already assigned
        if (request.status === "assigned") {
            return res.status(400).json({ message: "Appointment is already assigned" });
        }
        
        // Update the request and doctor
        request.assignedDoctor = doctorId;
        request.status = "assigned";
        await request.save();
        
        doctor.status = "busy";
        await doctor.save();
        
        // Populate doctor details for response
        const populatedRequest = await request.populate('assignedDoctor', 'name specialization');
        
        res.json({ 
            message: "Doctor assigned successfully", 
            request: populatedRequest
        });
    } catch (error) {
        console.error("Error assigning doctor:", error);
        res.status(500).json({ message: "Error assigning doctor" });
    }
});

export default hospitalRoute;