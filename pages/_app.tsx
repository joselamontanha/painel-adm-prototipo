import type { AppProps } from "next/app";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";


const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#f6f7f9", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
    primary: { main: "#111827" },
    divider: "#e5e7eb",
  },
  shape: { borderRadius: 14 },
  shadows: [
    "none",
    "0 1px 2px rgba(0,0,0,.04)",
    "0 2px 6px rgba(0,0,0,.06)",
    ...Array(22).fill("0 8px 24px rgba(0,0,0,.08)"),
  ] as any,
  typography: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    h5: { fontWeight: 700 },
    subtitle1: { letterSpacing: 0.2 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { border: "1px solid #eef0f3" } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 12, boxShadow: "none" } } },
    MuiTextField: { defaultProps: { size: "medium" } },
  },
});


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();


  // Guard de rotas: qualquer rota sob /app exige cp_auth=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isAppRoute = router.pathname === "/app" || router.pathname.startsWith("/app/");
    const isLogged = localStorage.getItem("cp_auth") === "1";
    if (isAppRoute && !isLogged) router.replace("/login");
  }, [router.pathname, router]);


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}