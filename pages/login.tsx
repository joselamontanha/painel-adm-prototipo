import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
    Box,
    Paper,
    Stack,
    TextField,
    Button,
    Typography,
    Link as MuiLink,
    InputAdornment,
    IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPass, setShowPass] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const userRef = React.useRef<HTMLInputElement | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        userRef.current?.focus();
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem("cp_auth", "1"); // mock de login
            setLoading(false);
            router.replace("/app");
        }, 500);
    };

    return (
        <>
            <Head>
                <title>Login • Painel Administrativo</title>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
            </Head>

            <Box component="main" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
                <Paper elevation={2} sx={{ width: "100%", maxWidth: 440, p: 4, border: "1px solid #eef0f3" }}>
                    <Stack component="form" onSubmit={handleSubmit} gap={3}>
                        <Stack gap={1.5} alignItems="center">
                            <img
                                src="https://mednet-images-repository.s3.sa-east-1.amazonaws.com/Logo+Click+Planos/PNG/logo_tons_cinza.png"
                                alt="ClickPlanos"
                                style={{ height: 40, objectFit: "contain" }}
                            />
                            <Typography variant="subtitle1" color="text.secondary">Painel Administrativo</Typography>
                        </Stack>

                        <Stack gap={2}>
                            <TextField
                                inputRef={userRef}
                                label="Usuário"
                                placeholder="nome de usuário"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Senha"
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                                                onClick={() => setShowPass((s) => !s)}
                                                edge="end"
                                            >
                                                {showPass ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Box sx={{ textAlign: "right" }}>
                                <MuiLink href="#" underline="hover" color="text.secondary">Esqueci minha senha</MuiLink>
                            </Box>
                        </Stack>

                        <Button type="submit" variant="contained" size="large" disabled={loading || !username || !password}>
                            {loading ? "Entrando…" : "Login"}
                        </Button>

                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                            Dicas de teclado: Tab navega entre campos • Enter envia o formulário
                        </Typography>
                    </Stack>
                </Paper>
            </Box>
        </>
    );
}
