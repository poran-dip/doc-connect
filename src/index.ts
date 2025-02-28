import express from "express";
import path from "path";
import patientRoute from "./routes/patientroute";
import doctorRoute from "./routes/doctorroute";
import hospitalRoute from "./routes/hospitalroute";

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/hospital", hospitalRoute);

// Routes to serve specific HTML pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "patient.html"));
});

app.get("/hospital", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "hospital.html"));
});

app.get("/doctor", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "doctor.html"));
});

// Error handling middleware
app.use((err: any, res: any) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});