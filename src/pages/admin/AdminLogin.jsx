import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Logo from "../../components/Logo.jsx";
import { Input } from "../../components/Input.jsx";

export default function AdminLogin() {
  const nav = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-gray-900 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-pop">
        <div className="mb-6 flex flex-col items-center">
          <Logo size={40} />
          <p className="mt-2 text-sm text-gray-400">Yönetici Paneli Girişi</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            nav("/admin");
          }}
          className="space-y-4"
        >
          <Input label="E-posta" type="email" placeholder="admin@metugym.local" required />
          <Input label="Şifre" type="password" placeholder="••••••••" required />
          <Button full size="lg" type="submit">
            Giriş Yap
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-400">
          Yalnızca yetkili personel. Erişim loglanır.
        </p>
      </div>
    </div>
  );
}
