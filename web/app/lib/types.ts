export type Role = "Patient" | "Doctor" | "Admin";

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Doctor extends User {
  role: "Doctor";
  specialization: string;
  status: "available" | "busy" | "dnd";
}

export interface Patient extends User {
  role: "Patient";
  age: number;
}

export interface Admin extends User {
  role: "Admin";
  location: string;
}

export interface Appointment {
  _id: string;
  department: string;
  appointmentTime: string;
  emergency: boolean;
  status: "pending" | "assigned" | "completed" | "cancelled";
  patientId: Patient;
  assignedDoctor?: Doctor;
  completedBy?: Doctor;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
