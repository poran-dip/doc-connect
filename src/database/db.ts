import mongoose, { Schema, Document } from "mongoose";

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/doc_connect");

//DOCTOR SCHEMA
const DoctorSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  availability: { type: Boolean, default: true },
  status: { type: String, enum: ["available", "busy", "dnd"], default: "available" }
});

const Doctormodel = mongoose.model("Doctor", DoctorSchema);

//PATIENT SCHEMA
const PatientSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true, min: 0, max: 120 },
});

const Patientmodel = mongoose.model("Patient", PatientSchema);
  
//HOSPITAL SCHEMA
const HospitalSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  location: { type: String, required: true },
});

const Hospitalmodel = mongoose.model("Hospital", HospitalSchema);

//APPOINTMENT REQUEST SCHEMA
const AppointmentRequestSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 0, max: 120 },
  department: { type: String, required: true },
  appointmentTime: { type: Date, required: true },
  emergency: { type: Boolean, default: false },
  assignedDoctor: { type: Schema.Types.ObjectId, ref: "Doctor", default: null },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
  status: { 
    type: String, 
    enum: ["pending", "assigned", "completed", "cancelled"], 
    default: "pending" 
  },
  completedBy: { type: Schema.Types.ObjectId, ref: "Doctor" },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const AppointmentRequestModel = mongoose.model("AppointmentRequest", AppointmentRequestSchema);

export { Doctormodel, Patientmodel, Hospitalmodel, AppointmentRequestModel };