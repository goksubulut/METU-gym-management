import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GymAuthScreen from "../../components/ui/gym-auth-screen.jsx";
import { useToast } from "../../components/Toast.jsx";
import { login, register } from "../../api/auth.js";
import { homePathForRole } from "../../utils/authUser.js";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const toast = useToast();

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const { user } = await login(email, password);
      toast("Giriş başarılı", "success");
      nav(homePathForRole(user.role));
    } catch (err) {
      toast(err.message ?? "Giriş başarısız", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ name, phone, email, password }) => {
    setLoading(true);
    try {
      const { user } = await register(name, email, phone, password);
      toast("Kayıt tamamlandı", "success");
      nav(homePathForRole(user.role));
    } catch (err) {
      toast(err.message ?? "Kayıt başarısız", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GymAuthScreen
      backgroundImageSrc="/images/odtu-spor.jpg"
      onLogin={handleLogin}
      onRegister={handleRegister}
      onForgotPassword={() => nav("/forgot-password")}
      loading={loading}
    />
  );
}
