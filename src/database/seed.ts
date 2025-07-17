import mongoose from "mongoose";
import { Doctormodel, Patientmodel, Hospitalmodel } from "./db";

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/doc_connect");

const seedData = async () => {
  try {
    // Create a patient
    const patient = new Patientmodel({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      age: 30
    });
    await patient.save();
    console.log("Added a patient");

    // Create a doctor
    const doctor = new Doctormodel({
      name: "Dr. Sarah Smith",
      email: "sarah.smith@hospital.com",
      password: "doctor123",
      specialization: "Cardiology",
      availability: true,
      status: "available"
    });
    await doctor.save();
    console.log("Added a doctor");

    // Create a hospital
    const hospital = new Hospitalmodel({
      name: "General Hospital",
      email: "admin@generalhospital.com",
      password: "hospital123",
      location: "123 Main St, City Center"
    });
    await hospital.save();
    console.log("Added a hospital");

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

seedData();