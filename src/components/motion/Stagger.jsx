// METU MOTION §4.2 — Staggered Fade-Up Entrance
//
// Her ekranın giriş fazında başlık/liste/kart blokları sırayla girer.
// Kural (spec §5.2): SADECE `opacity` + `transform: translateY` animasyonlanır.
// `filter`, `blur`, `box-shadow` bu listeye ASLA eklenmez (Android'de pahalı).
//
// Kullanım:
//   <Stagger>
//     <StaggerItem><h1>Başlık</h1></StaggerItem>
//     <StaggerItem><p>Açıklama</p></StaggerItem>
//   </Stagger>
//
// Ya da elle indeks vererek (liste map'lerinde):
//   <StaggerItem index={i}>…</StaggerItem>

import { Children, cloneElement, isValidElement, createContext, useContext } from "react";
import { motion } from "framer-motion";

// spec §1.5: --duration-base 220ms, --stagger-step 70ms, --ease-standard
const DURATION = 0.22;
const STEP = 0.07;
const EASE = [0.16, 1, 0.3, 1];

const IndexContext = createContext(0);

/** Bir ekran bloğu: çocuklarını sırayla (70ms arayla) yukarı doğru soldurarak açar. */
export function Stagger({ children, delay = 0, className = "", as = "div" }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: STEP, delayChildren: delay } },
      }}
    >
      {children}
    </M>
  );
}

/** Stagger içindeki tek bir blok. `index` verilirse kendi gecikmesini hesaplar. */
export function StaggerItem({ children, index, className = "", as = "div", ...rest }) {
  const M = motion[as] || motion.div;
  const standalone = index !== undefined;
  return (
    <M
      className={className}
      {...(standalone
        ? {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: DURATION, ease: EASE, delay: index * STEP },
          }
        : {
            variants: {
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
            },
          })}
      {...rest}
    >
      {children}
    </M>
  );
}

export default Stagger;
