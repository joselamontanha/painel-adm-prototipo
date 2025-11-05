// pages/logout.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Logout() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("cp_auth"); // limpa o flag de login (mock)
        }
        router.replace("/login"); // volta para a tela de login
    }, [router]);

    return null;
}
