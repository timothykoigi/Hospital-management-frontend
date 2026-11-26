import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import { listDoctors } from "../../services/doctorService";
import PageHeader from "../../components/PageHeader";
import BookingForm from "../../components/BookingForm";
import { ErrorState, LoadingState } from "../../components/Feedback";

export default function BookAppointment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => listDoctors({ per_page: 100 }), []);

  return (
    <>
      <PageHeader title="Book an appointment" subtitle="Your request is sent to the doctor for approval." />
      <section className="panel" style={{ maxWidth: 720 }}>
        {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={reload} /> : (
          <BookingForm
            doctors={data}
            initialDoctorId={params.get("doctor") || ""}
            onBooked={() => {
              toast.success("Appointment requested. You will see it as pending until the doctor approves it.");
              navigate("/patient/appointments");
            }}
          />
        )}
      </section>
    </>
  );
}
