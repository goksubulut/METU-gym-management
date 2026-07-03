import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Logo from "../../components/Logo.jsx";
import { Input } from "../../components/Input.jsx";

export default function ReceptionLogin() {
  const nav = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-primary-600 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-pop">
        <div className="mb-6 flex flex-col items-center">
          <Logo size={40} />
          <p className="mt-2 text-sm text-gray-400">Resepsiyon / Check-in Girişi</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            nav("/reception");
          }}
          className="space-y-4"
        >
          <Input label="Personel kodu" placeholder="Örn: RS-104" required />
          <Input label="Şifre" type="password" placeholder="••••••••" required />
          <Button full size="lg" type="submit">
            Giriş Yap
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-400">
          Vardiya başında giriş yapmayı unutmayın.
        </p>
      </div>
    </div>
  );
}
