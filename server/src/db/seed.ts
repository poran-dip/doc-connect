import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { dbConnect } from "./connect";
import { Admin, Appointment, Doctor, Patient } from "../models";

const seed = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot seed production database");
  }

  await dbConnect();

  // Clear existing data
  await Promise.all([
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    Admin.deleteMany({}),
    Appointment.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  const admin = await Admin.create({
    name: "General Hospital Admin",
    email: "admin@example.com",
    password: await bcrypt.hash("admin123", 10),
    location: "123 Main St, City Center",
  });
  console.log("Created admin:", admin.name);

  const doctor = await Doctor.create({
    name: "Dr. Sarah Smith",
    email: "sarah.smith@example.com",
    password: await bcrypt.hash("doctor123", 10),
    specialization: "Cardiology",
    status: "available",
  });
  console.log("Created doctor:", doctor.name);

  const patient = await Patient.create({
    name: "John Doe",
    email: "john.doe@example.com",
    password: await bcrypt.hash("password123", 10),
    age: 30,
  });
  console.log("Created patient:", patient.name);

  await Appointment.create({
    department: "Cardiology",
    appointmentTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
    emergency: false,
    patientId: patient._id,
    assignedDoctor: doctor._id,
    status: "assigned",
  });
  console.log("Created appointment for", patient.name);

  console.log("🎉 Database seeded successfully!");
};

seed()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log("Connection closed");
  });
