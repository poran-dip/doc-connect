import { Schema, model } from "mongoose";

const Appointment = model(
  "Appointment",
  new Schema(
    {
      department: { type: String, required: true },
      appointmentTime: { type: Date, required: true },
      emergency: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["pending", "assigned", "completed", "cancelled"],
        default: "pending",
      },
      patientId: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
      },
      assignedDoctor: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        default: null,
      },
      completedBy: { type: Schema.Types.ObjectId, ref: "Doctor" },
      completedAt: { type: Date },
    },
    { timestamps: true },
  ),
);

export default Appointment;
