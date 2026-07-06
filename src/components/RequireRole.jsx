import { Navigate } from "react-router-dom";
import { getAccessToken } from "../api/client.js";
import { getAuthUser, homePathForRole } from "../utils/authUser.js";

/**
 * Rota koruması (FR-AUTH-2, NFR-3): oturum yoksa ilgili login sayfasına,
 * rol uygun değilse kullanıcının kendi ana sayfasına yönlendirir.
 * Asıl yetki kontrolü backend'dedir; bu bileşen yalnızca doğru paneli gösterir.
 */
export default function RequireRole({ roles, loginPath, children }) {
  const user = getAuthUser();
  if (!getAccessToken() || !user) {
    return <Navigate to={loginPath} replace />;
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }
  return children;
}
