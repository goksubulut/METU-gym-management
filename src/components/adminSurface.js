import { createContext } from "react";

// Admin kabuğu işareti. AdminLayout ve AdminLogin bu context'i `true` ile
// sağlar; Button bileşeni içeride olduğunu anlayıp premium buzlu cam
// (iOS-vari) varyantlarına geçer. Kullanıcı/resepsiyon tarafı etkilenmez.
export const AdminSurfaceContext = createContext(false);
