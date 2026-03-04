import { redirect } from "react-router";
import type { Route } from "./+types/dashboard";
import { getUserFromRequest } from "../lib/auth";
import DashboardNavbar from "../components/DashboardNavbar";
import PatientDashboard from "../components/dashboard/PatientDashboard";
import DoctorDashboard from "../components/dashboard/DoctorDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import type { Admin, Appointment, Doctor, Patient } from "../lib/types";
import { API_URL } from "~/lib/server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  if (!user) throw redirect("/signin");

  const cookie = request.headers.get("Cookie") ?? "";
  let appointments: Appointment[] = [];
  let patients: Patient[] = [];
  let doctors: Doctor[] = [];
  let admins: Admin[] = [];
  let doctor = null;
  let patient = null;

  if (user.role === "Patient") {
    const [apptData, patientData] = await Promise.all([
      fetch(`${API_URL}/api/appointment?patientId=${user.id}`, {
        headers: { Cookie: cookie },
      }).then((r) => r.json()),
      fetch(`${API_URL}/api/patient/${user.id}`, {
        headers: { Cookie: cookie },
      }).then((r) => r.json()),
    ]);
    appointments = Array.isArray(apptData) ? apptData : [];
    patient = patientData;
  } else if (user.role === "Doctor") {
    const [apptData, doctorData] = await Promise.all([
      fetch(`${API_URL}/api/appointment?assignedDoctor=${user.id}`, {
        headers: { Cookie: cookie },
      }).then((r) => r.json()),
      fetch(`${API_URL}/api/doctor/${user.id}`, {
        headers: { Cookie: cookie },
      }).then((r) => r.json()),
    ]);
    appointments = Array.isArray(apptData) ? apptData : [];
    doctor = doctorData;
  } else if (user.role === "Admin") {
    const [apptData, patientData, doctorData, adminData] = await Promise.all([
      fetch(`${API_URL}/api/appointment`, { headers: { Cookie: cookie } }).then(
        (r) => r.json(),
      ),
      fetch(`${API_URL}/api/patient`, { headers: { Cookie: cookie } }).then(
        (r) => r.json(),
      ),
      fetch(`${API_URL}/api/doctor`, { headers: { Cookie: cookie } }).then(
        (r) => r.json(),
      ),
      fetch(`${API_URL}/api/admin`, { headers: { Cookie: cookie } }).then((r) =>
        r.json(),
      ),
    ]);
    appointments = Array.isArray(apptData) ? apptData : [];
    patients = Array.isArray(patientData) ? patientData : [];
    doctors = Array.isArray(doctorData) ? doctorData : [];
    admins = Array.isArray(adminData) ? adminData : [];
  }

  return { user, appointments, patients, doctors, admins, doctor, patient };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getUserFromRequest(request);
  if (!user) throw redirect("/signin");

  const cookie = request.headers.get("Cookie") ?? "";
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "book") {
    const res = await fetch(`${API_URL}/api/appointment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        department: form.get("department"),
        appointmentTime: form.get("appointmentTime"),
        emergency: form.get("emergency") === "true",
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { error: data.error ?? "Failed to book appointment" };
    }
    return redirect("/dashboard");
  }

  if (intent === "cancel") {
    await fetch(`${API_URL}/api/appointment/${form.get("appointmentId")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "cancelled" }),
    });
    return redirect("/dashboard");
  }

  if (intent === "edit") {
    await fetch(`${API_URL}/api/appointment/${form.get("appointmentId")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        department: form.get("department"),
        appointmentTime: form.get("appointmentTime"),
        emergency: form.get("emergency") === "true",
      }),
    });
    return redirect("/dashboard");
  }

  if (intent === "updateProfile") {
    const body: Record<string, unknown> = {
      name: form.get("name"),
      email: form.get("email"),
    };
    if (user.role === "Patient") body.age = Number(form.get("age"));
    if (user.role === "Doctor")
      body.specialization = form.get("specialization");
    if (user.role === "Admin") body.location = form.get("location");
    const password = form.get("password");
    if (password) body.password = password;

    const endpoint =
      user.role === "Patient"
        ? `${API_URL}/api/patient/${user.id}`
        : user.role === "Doctor"
          ? `${API_URL}/api/doctor/${user.id}`
          : `${API_URL}/api/admin/${user.id}`;

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      return { error: data.error ?? "Failed to update profile" };
    }
    return { success: "Profile updated successfully" };
  }

  if (intent === "updateStatus") {
    await fetch(`${API_URL}/api/doctor/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: form.get("status") }),
    });
    return redirect("/dashboard");
  }

  if (intent === "completeAppointment") {
    await fetch(`${API_URL}/api/appointment/${form.get("appointmentId")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        status: "completed",
        completedBy: user.id,
        completedAt: new Date().toISOString(),
      }),
    });
    return redirect("/dashboard");
  }

  if (intent === "assignDoctor") {
    await fetch(`${API_URL}/api/appointment/${form.get("appointmentId")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        assignedDoctor: form.get("doctorId"),
        status: "assigned",
      }),
    });
    return redirect("/dashboard");
  }

  if (intent === "deleteAppointment") {
    await fetch(`${API_URL}/api/appointment/${form.get("id")}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    return redirect("/dashboard");
  }

  if (intent === "updateAppointment") {
    await fetch(`${API_URL}/api/appointment/${form.get("id")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        department: form.get("department"),
        appointmentTime: form.get("appointmentTime"),
        emergency: form.get("emergency") === "true",
        status: form.get("status"),
      }),
    });
    return redirect("/dashboard");
  }

  if (intent === "createPatient") {
    const res = await fetch(`${API_URL}/api/patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        age: Number(form.get("age")),
      }),
    });
    if (!res.ok)
      return { error: (await res.json()).error ?? "Failed to create patient" };
    return redirect("/dashboard");
  }

  if (intent === "updatePatient") {
    await fetch(`${API_URL}/api/patient/${form.get("id")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        age: Number(form.get("age")),
        ...(form.get("password") ? { password: form.get("password") } : {}),
      }),
    });
    return redirect("/dashboard");
  }

  if (intent === "deletePatient") {
    await fetch(`${API_URL}/api/patient/${form.get("id")}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    return redirect("/dashboard");
  }

  if (intent === "createDoctor") {
    const res = await fetch(`${API_URL}/api/doctor`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        specialization: form.get("specialization"),
        status: form.get("status") ?? "available",
      }),
    });
    if (!res.ok)
      return { error: (await res.json()).error ?? "Failed to create doctor" };
    return redirect("/dashboard");
  }

  if (intent === "updateDoctor") {
    await fetch(`${API_URL}/api/doctor/${form.get("id")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        specialization: form.get("specialization"),
        status: form.get("status"),
        ...(form.get("password") ? { password: form.get("password") } : {}),
      }),
    });
    return redirect("/dashboard");
  }

  if (intent === "deleteDoctor") {
    await fetch(`${API_URL}/api/doctor/${form.get("id")}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    return redirect("/dashboard");
  }

  if (intent === "createAdmin") {
    const res = await fetch(`${API_URL}/api/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        location: form.get("location"),
      }),
    });
    if (!res.ok)
      return { error: (await res.json()).error ?? "Failed to create admin" };
    return redirect("/dashboard");
  }

  if (intent === "updateAdmin") {
    await fetch(`${API_URL}/api/admin/${form.get("id")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        location: form.get("location"),
        ...(form.get("password") ? { password: form.get("password") } : {}),
      }),
    });
    return redirect("/dashboard");
  }

  if (intent === "deleteAdmin") {
    await fetch(`${API_URL}/api/admin/${form.get("id")}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    return redirect("/dashboard");
  }

  return null;
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, appointments } = loaderData;

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNavbar user={user} />
      <main className="max-w-5xl mx-auto px-8 py-10">
        {user.role === "Patient" && (
          <PatientDashboard
            user={{ ...user, ...(loaderData as any).patient } as Patient}
            appointments={appointments}
          />
        )}
        {user.role === "Doctor" && (
          <DoctorDashboard
            user={{ ...user, ...(loaderData as any).doctor } as Doctor}
            appointments={loaderData.appointments}
          />
        )}
        {user.role === "Admin" && (
          <AdminDashboard
            user={
              {
                ...user,
                ...((loaderData as any).admins ?? []).find(
                  (a: Admin) => a._id === user.id,
                ),
              } as Admin
            }
            appointments={loaderData.appointments}
            patients={(loaderData as any).patients ?? []}
            doctors={(loaderData as any).doctors ?? []}
            admins={(loaderData as any).admins ?? []}
          />
        )}
      </main>
    </div>
  );
}
