import { useEffect } from "react";
import { useRouter } from "next/router";


export default function Logout() {
    const router = useRouter();
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("cp_auth");
        }
        router.replace("/login");
    }, [router]);
    return null;
}