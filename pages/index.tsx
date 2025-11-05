import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const isLogged = typeof window !== "undefined" && localStorage.getItem("cp_auth") === "1";
    router.replace(isLogged ? "/app" : "/login");
  }, [router]);
  return null;
}
