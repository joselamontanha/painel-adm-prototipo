// pages/app/hospitais/index.tsx
import * as React from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    Button,
    MenuItem,
    IconButton,
    Tooltip,
    Checkbox,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Snackbar,
    Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useRouter } from "next/router";

// ---------- Tipos ----------
type Row = {
    id: number;
    estabelecimento: string;
    municipio: string;
    estado: string; // sigla
    especialidade: string;
    tipo: string;
    planosVinculados: number;
};

type ColKey =
    | "select"
    | "estabelecimento"
    | "municipio"
    | "estado"
    | "especialidade"
    | "tipo"
    | "planosVinculados";

// ---------- Constantes/mock ----------
const ESTADOS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const TIPOS = ["Hospital", "Clínica", "Laboratório", "Pronto Atendimento"];

const ESPECIALIDADES = [
    "Cardiologia",
    "Ortopedia",
    "Pediatria",
    "Ginecologia",
    "Oncologia",
    "Oftalmologia",
    "Dermatologia",
];

function makeMockRows(qty = 96): Row[] {
    const cities = ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "Foz do Iguaçu", "São José dos Pinhais"];
    const names = ["São Lucas", "Santa Clara", "Santa Maria", "Vida Plena", "Boa Saúde", "Nossa Senhora", "Esperança"];
    const estados = ["PR", "SC", "SP", "RJ", "MG"];
    const rows: Row[] = [];
    for (let i = 1; i <= qty; i++) {
        const nome = `${names[i % names.length]} ${i}`;
        rows.push({
            id: i,
            estabelecimento: `HOSPITAL ${nome}`.toUpperCase(),
            municipio: cities[i % cities.length],
            estado: estados[i % estados.length],
            especialidade: ESPECIALIDADES[i % ESPECIALIDADES.length],
            tipo: TIPOS[i % TIPOS.length],
            planosVinculados: (i * 3) % 17, // 0..16
        });
    }
    return rows;
}

// ---------- Página ----------
export default function Hospitais() {
    const router = useRouter();

    // dados mock (mutáveis)
    const [rows, setRows] = React.useState<Row[]>(() => makeMockRows(96));

    // filtros obrigatórios
    const [estadoReq, setEstadoReq] = React.useState<string>("");

    // filtros opcionais
    const [q, setQ] = React.useState<string>(""); // Estabelecimento
    const [esp, setEsp] = React.useState<string>("");
    const [tipo, setTipo] = React.useState<string>("");
    const [municipio, setMunicipio] = React.useState<string>("");
    const [semPlanos, setSemPlanos] = React.useState<boolean>(false);

    // seleção, paginação e ordenação
    const [selected, setSelected] = React.useState<Set<number>>(new Set());
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [sortField, setSortField] = React.useState<keyof Row>("estabelecimento");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

    // ordem de colunas (drag & drop)
    const [colOrder, setColOrder] = React.useState<ColKey[]>([
        "select",
        "estabelecimento",
        "municipio",
        "estado",
        "especialidade",
        "tipo",
        "planosVinculados",
    ]);

    const colMeta: Record<Exclude<ColKey, "select">, { label: string; align?: "left" | "right"; minWidth?: number }> = {
        estabelecimento: { label: "Estabelecimento", minWidth: 220 },
        municipio: { label: "Município", minWidth: 160 },
        estado: { label: "Estado", minWidth: 100 },
        especialidade: { label: "Especialidade", minWidth: 160 },
        tipo: { label: "Tipo de Estabelecimento", minWidth: 180 },
        planosVinculados: { label: "Planos Vinculados", align: "right", minWidth: 160 },
    };

    // municípios para combos
    const municipioOptions = React.useMemo(() => {
        const base = estadoReq ? rows.filter(r => r.estado === estadoReq) : rows;
        return Array.from(new Set(base.map(r => r.municipio))).sort();
    }, [rows, estadoReq]);

    // Aplicar filtros
    const filtered = React.useMemo(() => {
        let data = rows;
        if (estadoReq) data = data.filter(r => r.estado === estadoReq);
        if (tipo) data = data.filter(r => r.tipo === tipo);

        const qNorm = q.trim().toUpperCase();
        if (qNorm) data = data.filter(r => r.estabelecimento.includes(qNorm));

        if (esp) data = data.filter(r => r.especialidade === esp);
        if (municipio) data = data.filter(r => r.municipio === municipio);
        if (semPlanos) data = data.filter(r => r.planosVinculados === 0);

        return [...data].sort((a, b) => {
            const A = a[sortField];
            const B = b[sortField];
            const cmp =
                typeof A === "number" && typeof B === "number"
                    ? A - B
                    : String(A).localeCompare(String(B), "pt-BR", { numeric: true });
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [rows, estadoReq, tipo, q, esp, municipio, semPlanos, sortField, sortDir]);

    const paginated = React.useMemo(() => {
        const start = page * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    // Seleção
    const toggleRow = (id: number) => {
        setSelected(prev => {
            const copy = new Set(prev);
            copy.has(id) ? copy.delete(id) : copy.add(id);
            return copy;
        });
    };
    const allOnPageSelected = paginated.length > 0 && paginated.every(r => selected.has(r.id));
    const someOnPageSelected = paginated.some(r => selected.has(r.id)) && !allOnPageSelected;
    const toggleSelectPage = (checked: boolean) => {
        setSelected(prev => {
            const copy = new Set(prev);
            const ids = paginated.map(r => r.id);
            if (checked) ids.forEach(id => copy.add(id));
            else ids.forEach(id => copy.delete(id));
            return copy;
        });
    };

    // Reset filtros opcionais
    const resetOptional = () => {
        setQ("");
        setEsp("");
        setTipo("");
        setMunicipio("");
        setSemPlanos(false);
    };

    const handleClose = () => router.replace("/app");

    // Drag de colunas
    const dragIndex = React.useRef<number | null>(null);
    const handleDrop = (i: number) => () => {
        if (dragIndex.current === null || dragIndex.current === i) return;
        setColOrder(prev => {
            const arr = [...prev];
            const [moved] = arr.splice(dragIndex.current!, 1);
            arr.splice(i, 0, moved);
            return arr;
        });
    };

    // Ordenação
    const toggleSort = (field: keyof Row) => () => {
        if (sortField === field) setSortDir(d => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
    };

    // ---------- Modais / feedback ----------
    const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: "success" | "info" }>({
        open: false, msg: "", sev: "success",
    });

    // Incluir
    const [openInc, setOpenInc] = React.useState(false);
    const [incEsp, setIncEsp] = React.useState("");
    const [incTipo, setIncTipo] = React.useState("");
    const [incNome, setIncNome] = React.useState("");
    const [incUF, setIncUF] = React.useState("");
    const [incMun, setIncMun] = React.useState("");
    const [incContinuar, setIncContinuar] = React.useState(true);
    const incMunOptions = React.useMemo(() => {
        const base = incUF ? rows.filter(r => r.estado === incUF) : rows;
        return Array.from(new Set(base.map(r => r.municipio))).sort();
    }, [rows, incUF]);
    const incTouched = React.useRef(false);
    const incValido = incEsp && incTipo && incNome && incUF && incMun;

    const abrirIncluir = () => {
        setOpenInc(true);
        incTouched.current = false;
    };
    const salvarIncluir = () => {
        incTouched.current = true;
        if (!incValido) return;
        const nextId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        const novo: Row = {
            id: nextId,
            estabelecimento: incNome.toUpperCase(),
            municipio: incMun,
            estado: incUF,
            especialidade: incEsp,
            tipo: incTipo,
            planosVinculados: 0,
        };
        setRows(prev => [novo, ...prev]);
        setSnack({ open: true, msg: "Hospital incluído (mock).", sev: "success" });
        setPage(0);

        if (incContinuar) {
            setIncNome("");
            setIncUF("");
            setIncMun("");
            incTouched.current = false; // não mostrar validação ao continuar
        } else {
            setOpenInc(false);
        }
    };

    // Alterar
    const [openAlt, setOpenAlt] = React.useState(false);
    const [altEsp, setAltEsp] = React.useState("");
    const [altTipo, setAltTipo] = React.useState("");
    const [altNome, setAltNome] = React.useState("");
    const [altUF, setAltUF] = React.useState("");
    const [altMun, setAltMun] = React.useState("");
    const altMunOptions = React.useMemo(() => {
        const base = altUF ? rows.filter(r => r.estado === altUF) : rows;
        return Array.from(new Set(base.map(r => r.municipio))).sort();
    }, [rows, altUF]);
    const altTouched = React.useRef(false);
    const altValido = altEsp && altTipo && altNome && altUF && altMun;

    const abrirAlterar = () => {
        if (selected.size !== 1) return;
        const [id] = Array.from(selected);
        const r = rows.find(x => x.id === id)!;
        setAltEsp(r.especialidade);
        setAltTipo(r.tipo);
        setAltNome(r.estabelecimento);
        setAltUF(r.estado);
        setAltMun(r.municipio);
        setOpenAlt(true);
        altTouched.current = false;
    };
    const salvarAlterar = () => {
        altTouched.current = true;
        if (!altValido) return;
        const [id] = Array.from(selected);
        setRows(prev => prev.map(x =>
            x.id === id
                ? {
                    ...x,
                    estabelecimento: altNome.toUpperCase(),
                    municipio: altMun,
                    estado: altUF,
                    especialidade: altEsp,
                    tipo: altTipo,
                }
                : x
        ));
        setSnack({ open: true, msg: "Hospital alterado (mock).", sev: "success" });
        setOpenAlt(false);
    };

    // ---------- Importar / Exportar (mock) ----------
    const [openImp, setOpenImp] = React.useState(false);
    const [csvName, setCsvName] = React.useState<string>("");

    const handleImportClick = () => {
        setCsvName("");
        setOpenImp(true);
    };

    const [openExp, setOpenExp] = React.useState(false);
    const defaultExportName = React.useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `hospitais_${yyyy}-${mm}-${dd}.csv`;
    }, []);
    const [exportName, setExportName] = React.useState<string>("");

    const handleExportClick = () => {
        setExportName(defaultExportName);
        setOpenExp(true);
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Header fino */}
            <Paper
                sx={{
                    p: 1,
                    mb: 2,
                    backgroundColor: "#eef1f5",
                    border: "1px solid #e5e7eb",
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>
                        Cadastro de Hospitais
                    </Typography>
                    <Tooltip title="Fechar">
                        <IconButton size="small" onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>

            <Stack gap={2}>
                {/* Filtros obrigatórios */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack gap={0.8}>
                        <Typography variant="subtitle1" fontWeight={700}>Filtros obrigatórios</Typography>
                        <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                            <TextField
                                select
                                size="small"
                                label="Estado (UF)"
                                value={estadoReq}
                                onChange={(e) => setEstadoReq(e.target.value)}
                                fullWidth
                            >
                                {ESTADOS.map(uf => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
                            </TextField>

                            <Button
                                startIcon={<SearchIcon />}
                                size="small"
                                variant="contained"
                                sx={{ minWidth: 120 }}
                                onClick={() => setPage(0)}
                            >
                                Buscar
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Filtros opcionais */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack gap={0.8}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={700}>Filtros opcionais</Typography>
                            <Button onClick={resetOptional} startIcon={<RestartAltIcon />} size="small" variant="text">
                                Limpar Filtros
                            </Button>
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                            <TextField
                                size="small"
                                label="Estabelecimento"
                                value={q}
                                onChange={(e) => setQ(e.target.value.toUpperCase())}
                                fullWidth
                            />

                            <TextField
                                select
                                size="small"
                                label="Especialidade"
                                value={esp}
                                onChange={(e) => setEsp(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="">(Qualquer)</MenuItem>
                                {ESPECIALIDADES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                            </TextField>

                            <TextField
                                select
                                size="small"
                                label="Tipo de Estabelecimento"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="">(Qualquer)</MenuItem>
                                {TIPOS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                            </TextField>

                            <TextField
                                select
                                size="small"
                                label="Município"
                                value={municipio}
                                onChange={(e) => setMunicipio(e.target.value)}
                                fullWidth
                                disabled={!estadoReq}
                            >
                                <MenuItem value="">(Qualquer)</MenuItem>
                                {municipioOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </TextField>

                            <Stack direction="row" alignItems="center" sx={{ px: 0.5 }}>
                                <Checkbox
                                    checked={semPlanos}
                                    onChange={(e) => setSemPlanos(e.target.checked)}
                                    sx={{ p: 0.5, mr: 1 }}
                                />
                                <Typography variant="body2">Sem Planos Vinculados</Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Grid */}
                <Paper sx={{ p: 0, overflow: "hidden" }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ "& th": { backgroundColor: "#eef1f5", fontWeight: 600 } }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={someOnPageSelected}
                                            checked={allOnPageSelected}
                                            onChange={(e) => toggleSelectPage(e.target.checked)}
                                        />
                                    </TableCell>
                                    {colOrder
                                        .filter(c => c !== "select")
                                        .map((key, idx) => {
                                            const meta = colMeta[key as keyof typeof colMeta];
                                            const active = sortField === key;
                                            return (
                                                <TableCell
                                                    key={key}
                                                    draggable
                                                    onDragStart={() => (dragIndex.current = idx)}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={handleDrop(idx)}
                                                    align={meta.align ?? "left"}
                                                    sx={{ minWidth: meta.minWidth }}
                                                >
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <DragIndicatorIcon fontSize="small" sx={{ opacity: 0.6 }} />
                                                        <Button onClick={toggleSort(key as keyof Row)} size="small" sx={{ textTransform: "none", color: "inherit" }}>
                                                            {meta.label}
                                                        </Button>
                                                        {active && (sortDir === "asc" ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />)}
                                                    </Stack>
                                                </TableCell>
                                            );
                                        })}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginated.map(r => (
                                    <TableRow key={r.id} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} />
                                        </TableCell>
                                        {colOrder.filter(c => c !== "select").map(c => (
                                            <TableCell key={c} align={colMeta[c as keyof typeof colMeta].align ?? "left"}>
                                                {r[c as keyof Row] as any}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={colOrder.length}>
                                            <Box sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
                                                Nenhum registro encontrado.
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={filtered.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        labelRowsPerPage="Linhas por página"
                    />
                </Paper>

                {/* Totalizador */}
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right", pr: 1 }}>
                    Mostrando {paginated.length} de {filtered.length} registros filtrados
                </Typography>

                {/* Barra de ações */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Stack direction="row" gap={1}>
                            <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={abrirIncluir}>
                                Incluir
                            </Button>
                            <Button
                                startIcon={<EditIcon />} size="small" variant="outlined"
                                disabled={selected.size !== 1}
                                onClick={abrirAlterar}
                            >
                                Alterar
                            </Button>
                            <Button
                                startIcon={<DeleteIcon />} size="small" color="error" variant="outlined"
                                disabled={selected.size === 0}
                                onClick={() => alert("(Protótipo) Excluir selecionados")}
                            >
                                Excluir
                            </Button>
                            <Button startIcon={<UploadIcon />} size="small" variant="outlined" onClick={handleImportClick}>
                                Importar
                            </Button>
                            <Button startIcon={<DownloadIcon />} size="small" variant="outlined" onClick={handleExportClick}>
                                Exportar
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>

            {/* Modal INCLUIR */}
            <Dialog open={openInc} onClose={() => setOpenInc(false)} fullWidth maxWidth="sm">
                <DialogTitle>Novo Estabelecimento</DialogTitle>
                <DialogContent dividers>
                    <Stack gap={1.5} sx={{ pt: 1 }}>
                        <TextField
                            select label="Tipo Especialidade" value={incEsp}
                            onChange={(e) => setIncEsp(e.target.value)} fullWidth size="small"
                            error={!!(incTouched.current && !incEsp)} helperText={incTouched.current && !incEsp ? "Obrigatório" : " "}
                        >
                            {ESPECIALIDADES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </TextField>

                        <TextField
                            select label="Tipo Estabelecimento" value={incTipo}
                            onChange={(e) => setIncTipo(e.target.value)} fullWidth size="small"
                            error={!!(incTouched.current && !incTipo)} helperText={incTouched.current && !incTipo ? "Obrigatório" : " "}
                        >
                            {TIPOS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </TextField>

                        <TextField
                            label="Nome do Estabelecimento" value={incNome}
                            onChange={(e) => setIncNome(e.target.value.toUpperCase())}
                            fullWidth size="small" inputProps={{ style: { textTransform: "uppercase" } }}
                            error={!!(incTouched.current && !incNome)} helperText={incTouched.current && !incNome ? "Obrigatório" : " "}
                        />

                        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                            <TextField
                                select label="Estado (UF)" value={incUF}
                                onChange={(e) => { setIncUF(e.target.value); setIncMun(""); }}
                                fullWidth size="small"
                                error={!!(incTouched.current && !incUF)} helperText={incTouched.current && !incUF ? "Obrigatório" : " "}
                            >
                                {ESTADOS.map(uf => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
                            </TextField>

                            <TextField
                                select label="Município" value={incMun}
                                onChange={(e) => setIncMun(e.target.value)} fullWidth size="small" disabled={!incUF}
                                error={!!(incTouched.current && !incMun)} helperText={incTouched.current && !incMun ? "Obrigatório" : " "}
                            >
                                {incMunOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </TextField>
                        </Stack>

                        <FormControlLabel
                            control={<Checkbox checked={incContinuar} onChange={(e) => setIncContinuar(e.target.checked)} />}
                            label="Continuar incluindo"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenInc(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={salvarIncluir}>Salvar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal ALTERAR */}
            <Dialog open={openAlt} onClose={() => setOpenAlt(false)} fullWidth maxWidth="sm">
                <DialogTitle>Alterar Estabelecimento</DialogTitle>
                <DialogContent dividers>
                    <Stack gap={1.5} sx={{ pt: 1 }}>
                        <TextField
                            select label="Tipo Especialidade" value={altEsp}
                            onChange={(e) => setAltEsp(e.target.value)} fullWidth size="small"
                            error={!!(altTouched.current && !altEsp)} helperText={altTouched.current && !altEsp ? "Obrigatório" : " "}
                        >
                            {ESPECIALIDADES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </TextField>

                        <TextField
                            select label="Tipo Estabelecimento" value={altTipo}
                            onChange={(e) => setAltTipo(e.target.value)} fullWidth size="small"
                            error={!!(altTouched.current && !altTipo)} helperText={altTouched.current && !altTipo ? "Obrigatório" : " "}
                        >
                            {TIPOS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </TextField>

                        <TextField
                            label="Nome do Estabelecimento" value={altNome}
                            onChange={(e) => setAltNome(e.target.value.toUpperCase())}
                            fullWidth size="small" inputProps={{ style: { textTransform: "uppercase" } }}
                            error={!!(altTouched.current && !altNome)} helperText={altTouched.current && !altNome ? "Obrigatório" : " "}
                        />

                        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                            <TextField
                                select label="Estado (UF)" value={altUF}
                                onChange={(e) => { setAltUF(e.target.value); setAltMun(""); }}
                                fullWidth size="small"
                                error={!!(altTouched.current && !altUF)} helperText={altTouched.current && !altUF ? "Obrigatório" : " "}
                            >
                                {ESTADOS.map(uf => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
                            </TextField>

                            <TextField
                                select label="Município" value={altMun}
                                onChange={(e) => setAltMun(e.target.value)} fullWidth size="small" disabled={!altUF}
                                error={!!(altTouched.current && !altMun)} helperText={altTouched.current && !altMun ? "Obrigatório" : " "}
                            >
                                {altMunOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </TextField>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAlt(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={salvarAlterar}>Salvar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal IMPORTAR (mock) */}
            <Dialog open={openImp} onClose={() => setOpenImp(false)} fullWidth maxWidth="sm">
                <DialogTitle>Importar Hospitais (.CSV)</DialogTitle>
                <DialogContent dividers>
                    <Stack gap={2} sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Selecione um arquivo no formato <strong>.csv</strong> para simular a importação.
                        </Typography>
                        <TextField
                            type="file"
                            inputProps={{ accept: ".csv" }}
                            onChange={(e) => {
                                const f = (e.target.files && e.target.files[0]) || null;
                                setCsvName(f ? f.name : "");
                            }}
                            fullWidth
                            size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                            {csvName ? `Arquivo selecionado: ${csvName}` : "Nenhum arquivo selecionado."}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenImp(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setOpenImp(false);
                            setSnack({ open: true, sev: "info", msg: csvName ? `Importação simulada de: ${csvName}` : "Sem arquivo selecionado" });
                        }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal EXPORTAR (mock) */}
            <Dialog open={openExp} onClose={() => setOpenExp(false)} fullWidth maxWidth="sm">
                <DialogTitle>Exportar Hospitais (.CSV)</DialogTitle>
                <DialogContent dividers>
                    <Stack gap={2} sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Escolha o nome do arquivo a ser exportado.
                        </Typography>
                        <TextField
                            label="Nome do arquivo"
                            size="small"
                            value={exportName}
                            onChange={(e) => setExportName(e.target.value)}
                            helperText="A ação é simulada: nenhum arquivo será baixado de fato."
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenExp(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setOpenExp(false);
                            setSnack({ open: true, sev: "info", msg: `Exportação simulada: ${exportName || "(sem nome)"}` });
                        }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={2500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snack.sev} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
