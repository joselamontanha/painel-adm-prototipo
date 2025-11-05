// pages/app/index.tsx
import * as React from "react";
import Link from "next/link";
import {
    Box,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Divider,
    Tooltip,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LinkIcon from "@mui/icons-material/Link";
import ApartmentIcon from "@mui/icons-material/Apartment";     // Operadoras
import Inventory2Icon from "@mui/icons-material/Inventory2";   // Produtos (grupo)
import AssignmentIcon from "@mui/icons-material/Assignment";   // Planos
import LayersIcon from "@mui/icons-material/Layers";           // Planos Variações
import TableChartIcon from "@mui/icons-material/TableChart";   // Tabela de Preços
import LogoutIcon from "@mui/icons-material/Logout";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration"; // Ícone de Cadastros

const drawerWidth = 264;

export default function AppShell() {
    const [open, setOpen] = React.useState(true);
    const [cadOpen, setCadOpen] = React.useState(false); // inicia colapsado
    const [prodOpen, setProdOpen] = React.useState(false); // inicia colapsado

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Botão flutuante para abrir/fechar o menu */}
            <Tooltip title={open ? "Esconder menu" : "Mostrar menu"}>
                <IconButton
                    onClick={() => setOpen((s) => !s)}
                    sx={{
                        position: "fixed",
                        top: 16,
                        left: 16,
                        zIndex: 1300,
                        bgcolor: "white",
                        border: "1px solid #eef0f3",
                    }}
                >
                    <MenuIcon />
                </IconButton>
            </Tooltip>

            {/* Drawer lateral */}
            <Drawer
                variant="persistent"
                open={open}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        borderRight: "1px solid #eef0f3",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                {/* Cabeçalho do menu: somente o logo, deslocado à direita para não ficar sob o botão ☰ */}
                <Box
                    sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        height: 72,
                        pl: 11, // 11 * 8px = 88px (afasta do botão flutuante)
                    }}
                >
                    <img
                        src="https://mednet-images-repository.s3.sa-east-1.amazonaws.com/Logo+Click+Planos/PNG/logo_tons_cinza.png"
                        alt="ClickPlanos"
                        style={{ height: 28, objectFit: "contain" }}
                    />
                </Box>
                <Divider />

                {/* Navegação (cresce) */}
                <List component="nav" sx={{ py: 1, flexGrow: 1 }}>
                    {/* Cadastros */}
                    <ListItemButton onClick={() => setCadOpen((s) => !s)}>
                        <ListItemIcon>
                            <AppRegistrationIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cadastros" />
                        {cadOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={cadOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton component={Link} href="/app/usuarios" sx={{ pl: 4 }}>
                                <ListItemIcon><PeopleIcon /></ListItemIcon>
                                <ListItemText primary="Usuários" />
                            </ListItemButton>
                            <ListItemButton component={Link} href="/app/hospitais" sx={{ pl: 4 }}>
                                <ListItemIcon><LocalHospitalIcon /></ListItemIcon>
                                <ListItemText primary="Hospitais" />
                            </ListItemButton>
                            <ListItemButton component={Link} href="/app/hospitais-planos" sx={{ pl: 4 }}>
                                <ListItemIcon><LinkIcon /></ListItemIcon>
                                <ListItemText primary="Hospitais Planos" />
                            </ListItemButton>
                            <ListItemButton component={Link} href="/app/operadoras" sx={{ pl: 4 }}>
                                <ListItemIcon><ApartmentIcon /></ListItemIcon>
                                <ListItemText primary="Operadoras" />
                            </ListItemButton>
                        </List>
                    </Collapse>

                    {/* Produtos */}
                    <ListItemButton onClick={() => setProdOpen((s) => !s)}>
                        <ListItemIcon><Inventory2Icon /></ListItemIcon>
                        <ListItemText primary="Produtos" />
                        {prodOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={prodOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton component={Link} href="/app/planos" sx={{ pl: 4 }}>
                                <ListItemIcon><AssignmentIcon /></ListItemIcon>
                                <ListItemText primary="Planos" />
                            </ListItemButton>
                            <ListItemButton component={Link} href="/app/planos-variacoes" sx={{ pl: 4 }}>
                                <ListItemIcon><LayersIcon /></ListItemIcon>
                                <ListItemText primary="Planos Variações" />
                            </ListItemButton>
                            <ListItemButton component={Link} href="/app/tabelas-precos" sx={{ pl: 4 }}>
                                <ListItemIcon><TableChartIcon /></ListItemIcon>
                                <ListItemText primary="Tabela de Preços" />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </List>

                <Divider />

                {/* Logout no rodapé */}
                <List sx={{ py: 0 }}>
                    <ListItemButton component={Link} href="/logout">
                        <ListItemIcon><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </List>
            </Drawer>

            {/* Área principal em branco */}
            <Box sx={{ ml: open ? `${drawerWidth}px` : 0, transition: "margin .2s ease", p: 2 }}>
                <Paper
                    sx={{
                        p: 4,
                        minHeight: "calc(100vh - 32px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Stack alignItems="center" gap={1}>
                        <Typography variant="h6">Tela principal</Typography>
                        <Typography color="text.secondary">
                            Área em branco (conteúdo das telas virá aqui).
                        </Typography>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );
}
