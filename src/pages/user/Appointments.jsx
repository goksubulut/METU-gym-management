import MyAppointmentsSection from "../../components/MyAppointmentsSection.jsx";
import AppointmentHeatmap from "../../components/AppointmentHeatmap.jsx";

export default function Appointments() {
  return (
    <div className="px-4 py-5">
      <h1 className="mb-4 text-xl font-extrabold text-gray-900">Randevularım</h1>
      <AppointmentHeatmap />
      <MyAppointmentsSection />
    </div>
  );
}
