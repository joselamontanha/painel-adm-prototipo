// pages/app/hospitais-planos/index.tsx
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
    Chip,
    FormControl,
    InputLabel,
    Select as MUISelect,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import { useRouter } from "next/router";

// ---------- Tipos ----------
interface Operadora { id: number; nome: string }
interface Modalidade { id: number; descricao: string }
interface Especialidade { id: number; descricao: string }
interface Estabelecimento { id: number; nome: string; municipio: string; estado: string; id_especialidade: number }
interface Plano { id: number; nome: string; id_operadora: number; id_modalidade: number }
interface Vinculo { id: number; id_estabelecimento: number; id_plano: number }

interface GridRow {
    id: number | string;
    estabelecimento: string;
    especialidade: string;
    municipio: string;
    estado: string;
    plano: string;
    modalidade: string;
    isGhost?: boolean; // linha "plano sem hospital" (não selecionável)
}

// ---------- Mock ----------
const OPERADORAS: Operadora[] = [
    { id: 1, nome: "UNIMED CURITIBA" },
    { id: 2, nome: "HAPVIDA PR" },
    { id: 3, nome: "NOSSA SAÚDE" },
    { id: 4, nome: "SELECT SAÚDE" },
];
const MODALIDADES: Modalidade[] = [
    { id: 1, descricao: "Enfermaria" },
    { id: 2, descricao: "Apartamento" },
    { id: 3, descricao: "Ambulatorial" },
];
const ESPECIALIDADES: Especialidade[] = [
    { id: 1, descricao: "Hospital Geral" },
    { id: 2, descricao: "Maternidade" },
    { id: 3, descricao: "Oncologia" },
    { id: 4, descricao: "Cardiologia" },
];
const ESTABELECIMENTOS: Estabelecimento[] = [
    { id: 101, nome: "HOSPITAL SANTA MARIA", municipio: "Curitiba", estado: "PR", id_especialidade: 1 },
    { id: 102, nome: "CLÍNICA VIDA MAIS", municipio: "São José dos Pinhais", estado: "PR", id_especialidade: 3 },
    { id: 103, nome: "HOSPITAL SÃO LUCAS", municipio: "Colombo", estado: "PR", id_especialidade: 2 },
    { id: 104, nome: "INSTITUTO DO CORAÇÃO", municipio: "Curitiba", estado: "PR", id_especialidade: 4 },
];
const PLANOS: Plano[] = [
    { id: 201, nome: "PLANO OURO", id_operadora: 1, id_modalidade: 2 },
    { id: 202, nome: "PLANO PRATA", id_operadora: 1, id_modalidade: 1 },
    { id: 203, nome: "PLANO BRONZE", id_operadora: 2, id_modalidade: 1 },
    { id: 204, nome: "PLANO ESSENCIAL", id_operadora: 3, id_modalidade: 3 },
    { id: 205, nome: "PLANO PREMIUM", id_operadora: 4, id_modalidade: 2 },
    { id: 206, nome: "PLANO START", id_operadora: 1, id_modalidade: 3 },
];
const VINCULOS_INICIAIS: Vinculo[] = [
    { id: 1, id_estabelecimento: 101, id_plano: 201 },
    { id: 2, id_estabelecimento: 103, id_plano: 202 },
    { id: 3, id_estabelecimento: 104, id_plano: 205 },
];

// ---------- Helpers ----------
const opNome = (id?: number | null) => OPERADORAS.find(o => o.id === id)?.nome || "";
const modDesc = (id?: number | null) => MODALIDADES.find(m => m.id === id)?.descricao || "";
const espDesc = (id?: number | null) => ESPECIALIDADES.find(e => e.id === id)?.descricao || "";

// ---------- Colunas e ordenação (drag & drop) ----------
type ColKey = "select" | "estabelecimento" | "especialidade" | "municipio" | "estado" | "plano" | "modalidade";
const COL_META: Record<Exclude<ColKey, "select">, { label: string; align?: "left" | "right"; minWidth?: number }> = {
    estabelecimento: { label: "Estabelecimento", minWidth: 220 },
    especialidade: { label: "Especialidade", minWidth: 160 },
    municipio: { label: "Município", minWidth: 160 },
    estado: { label: "Estado", minWidth: 100 },
    plano: { label: "Plano", minWidth: 200 },
    modalidade: { label: "Modalidade", minWidth: 140 },
};

export default function HospitaisPlanos() {
    const router = useRouter();

    // dados mock (mutáveis)
    const [vinculos, setVinculos] = React.useState<Vinculo[]>(() => VINCULOS_INICIAIS);

    // filtros obrigatórios
    const [operadoraReq, setOperadoraReq] = React.useState<number | "">("");

    // filtros opcionais
    const [qEstab, setQEstab] = React.useState<string>("");
    const [esp, setEsp] = React.useState<number | "">("");
    const [qPlano, setQPlano] = React.useState<string>("");
    const [somenteSemHosp, setSomenteSemHosp] = React.useState<boolean>(false);

    // seleção, paginação e ordenação
    const [selected, setSelected] = React.useState<Set<number>>(new Set());
    const [page, setPage] = React.useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
    const [sortField, setSortField] = React.useState<keyof GridRow>("estabelecimento");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

    // ordem de colunas (drag & drop)
    const [colOrder, setColOrder] = React.useState<ColKey[]>([
        "select",
        "estabelecimento",
        "especialidade",
        "municipio",
        "estado",
        "plano",
        "modalidade",
    ]);

    // construir linhas
    const linhasBase: GridRow[] = React.useMemo(() => {
        if (!operadoraReq) return [];

        // Se a flag "Planos sem hospitais" estiver ativa, exibir SOMENTE os planos da operadora que não possuem vínculo
        if (somenteSemHosp) {
            const planosDaOp = PLANOS.filter(p => p.id_operadora === operadoraReq);
            const vinculados = new Set(vinculos.map(v => v.id_plano));
            const ghosts: GridRow[] = [];
            planosDaOp
                .filter(p => !vinculados.has(p.id))
                .forEach((p, i) => ghosts.push({
                    id: `ghost-${p.id}-${i}`,
                    estabelecimento: "",
                    especialidade: "",
                    municipio: "",
                    estado: "",
                    plano: p.nome,
                    modalidade: modDesc(p.id_modalidade),
                    isGhost: true,
                }));
            return ghosts;
        }

        // Caso contrário, montar as linhas vinculadas normalmente
        const rows: GridRow[] = vinculos
            .map((v: Vinculo) => {
                const e = ESTABELECIMENTOS.find(x => x.id === v.id_estabelecimento);
                const p = PLANOS.find(x => x.id === v.id_plano);
                if (!p || p.id_operadora !== operadoraReq) return null;
                return {
                    id: v.id,
                    estabelecimento: e?.nome || "",
                    especialidade: e ? espDesc(e.id_especialidade) : "",
                    municipio: e?.municipio || "",
                    estado: e?.estado || "",
                    plano: p?.nome || "",
                    modalidade: p ? modDesc(p.id_modalidade) : "",
                } as GridRow;
            })
            .filter(Boolean) as GridRow[];

        return rows;
    }, [operadoraReq, vinculos, somenteSemHosp]);

    // aplicar filtros opcionais e ordenação
    const filtered: GridRow[] = React.useMemo(() => {
        let arr: GridRow[] = linhasBase;
        if (qEstab.trim()) arr = arr.filter((r: GridRow) => r.estabelecimento.toUpperCase().includes(qEstab.trim().toUpperCase()));
        if (esp) arr = arr.filter((r: GridRow) => r.especialidade === espDesc(Number(esp)));
        if (qPlano.trim()) arr = arr.filter((r: GridRow) => r.plano.toUpperCase().includes(qPlano.trim().toUpperCase()));

        const sorted = [...arr].sort((a: GridRow, b: GridRow) => {
            const A = a[sortField];
            const B = b[sortField];
            const cmp = String(A).localeCompare(String(B), "pt-BR", { numeric: true });
            return sortDir === "asc" ? cmp : -cmp;
        });
        return sorted;
    }, [linhasBase, qEstab, esp, qPlano, sortField, sortDir]);

    const paginated: GridRow[] = React.useMemo(() => {
        const start = page * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    // seleção
    const toggleRow = (id: number | string) => {
        if (typeof id !== "number") return; // não permite selecionar ghost
        setSelected((prev: Set<number>) => {
            const copy = new Set(prev);
            copy.has(id) ? copy.delete(id) : copy.add(id);
            return copy;
        });
    };
    const allOnPageSelected = paginated.length > 0 && paginated.every((r: GridRow) => typeof r.id === "number" && selected.has(r.id as number));
    const someOnPageSelected = paginated.some((r: GridRow) => typeof r.id === "number" && selected.has(r.id as number)) && !allOnPageSelected;
    const toggleSelectPage = (checked: boolean) => {
        setSelected((prev: Set<number>) => {
            const copy = new Set(prev);
            const ids = paginated.map((r: GridRow) => r.id).filter((id: number | string) => typeof id === "number") as number[];
            if (checked) ids.forEach((id: number) => copy.add(id));
            else ids.forEach((id: number) => copy.delete(id));
            return copy;
        });
    };

    // reset filtros opcionais
    const resetOptional = () => {
        setQEstab(""); setEsp(""); setQPlano(""); setSomenteSemHosp(false);
    };

    // navegação voltar
    const handleClose = () => router.replace("/app");

    // drag de colunas
    const dragIndex = React.useRef<number | null>(null);
    const handleDrop = (i: number) => () => {
        if (dragIndex.current === null || dragIndex.current === i) return;
        setColOrder((prev: ColKey[]) => {
            const arr = [...prev];
            const [moved] = arr.splice(dragIndex.current!, 1);
            arr.splice(i, 0, moved);
            return arr;
        });
    };

    // ordenação
    const toggleSort = (field: keyof GridRow) => () => {
        if (sortField === field) setSortDir((d: "asc" | "desc") => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
    };

    // ---------- Modais / feedback ----------
    const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: "success" | "info" | "warning" }>(
        { open: false, msg: "", sev: "success" }
    );

    // Incluir (1 vínculo)
    const [openInc, setOpenInc] = React.useState(false);
    const [incEstab, setIncEstab] = React.useState<Estabelecimento | null>(null);
    const [incPlano, setIncPlano] = React.useState<Plano | null>(null);
    const [incContinuar, setIncContinuar] = React.useState(false);

    // Incluir em Lote
    const [openLote, setOpenLote] = React.useState(false);
    const [loteEstab, setLoteEstab] = React.useState<Estabelecimento | null>(null);
    const [lotePlanos, setLotePlanos] = React.useState<Plano[]>([]);

    // Sub-buscas
    const [openBuscaEstab, setOpenBuscaEstab] = React.useState<null | "inc" | "lote">(null);
    const [openBuscaPlano, setOpenBuscaPlano] = React.useState<null | "inc" | "lote">(null);

    // Import/Export (simulação)
    const [openImport, setOpenImport] = React.useState(false);
    const [openExport, setOpenExport] = React.useState(false);
    const [exportFormato, setExportFormato] = React.useState<"csv" | "json">("csv");
    const [exportSomenteSel, setExportSomenteSel] = React.useState(false);

    // salvar (mock)
    const salvarInc = () => {
        if (!incEstab || !incPlano) return;
        const nextId = vinculos.length ? Math.max(...vinculos.map((v: Vinculo) => v.id)) + 1 : 1;
        setVinculos((prev: Vinculo[]) => [{ id: nextId, id_estabelecimento: incEstab.id, id_plano: incPlano.id }, ...prev]);
        setSnack({ open: true, msg: "Vínculo incluído.", sev: "success" });
        if (incContinuar) {
            setIncPlano(null);
        } else {
            setOpenInc(false); setIncEstab(null); setIncPlano(null);
        }
    };

    const salvarLote = () => {
        if (!loteEstab || lotePlanos.length === 0) return;
        const base = vinculos.length ? Math.max(...vinculos.map((v: Vinculo) => v.id)) : 0;
        const novos = lotePlanos.map((p: Plano, i: number) => ({ id: base + i + 1, id_estabelecimento: loteEstab.id, id_plano: p.id }));
        setVinculos((prev: Vinculo[]) => [...novos, ...prev]);
        setSnack({ open: true, msg: `Incluídos ${lotePlanos.length} vínculos.`, sev: "success" });
        setOpenLote(false); setLoteEstab(null); setLotePlanos([]);
    };

    // excluir (mock)
    const excluir = () => {
        if (selected.size === 0) return;
        setVinculos((prev: Vinculo[]) => prev.filter((v: Vinculo) => !selected.has(v.id)));
        setSelected(new Set());
        setSnack({ open: true, msg: "Exclusão concluída.", sev: "info" });
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Header fino */}
            <Paper sx={{ p: 1, mb: 2, backgroundColor: "#eef1f5", border: "1px solid #e5e7eb" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>Hospitais × Planos</Typography>
                    <Tooltip title="Fechar">
                        <IconButton size="small" onClick={handleClose}><CloseIcon /></IconButton>
                    </Tooltip>
                </Stack>
            </Paper>

            <Stack gap={2}>
                {/* Filtro obrigatório */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack gap={0.8}>
                        <Typography variant="subtitle1" fontWeight={700}>Filtro obrigatório</Typography>
                        <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                            <TextField
                                select size="small" label="Operadora"
                                value={operadoraReq}
                                onChange={(e) => setOperadoraReq(e.target.value ? Number(e.target.value) : "")}
                                fullWidth
                            >
                                {OPERADORAS.map(op => <MenuItem key={op.id} value={op.id}>{op.nome}</MenuItem>)}
                            </TextField>

                            <Tooltip title={operadoraReq ? "Executar busca" : "Selecione a Operadora"}>
                                <span>
                                    <Button startIcon={<SearchIcon />} size="small" variant="contained" sx={{ minWidth: 120 }} onClick={() => setPage(0)} disabled={!operadoraReq}>
                                        Buscar
                                    </Button>
                                </span>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Filtros opcionais */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack gap={0.8}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={700}>Filtros opcionais</Typography>
                            <Button onClick={resetOptional} startIcon={<RestartAltIcon />} size="small" variant="text">
                                Limpar filtros
                            </Button>
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                            <TextField size="small" label="Estabelecimento" value={qEstab} onChange={(e) => setQEstab(e.target.value.toUpperCase())} fullWidth />

                            <TextField select size="small" label="Tipo de especialidade" value={esp} onChange={(e) => setEsp(e.target.value === "" ? "" : Number(e.target.value))} fullWidth>
                                <MenuItem value="">(Qualquer)</MenuItem>
                                {ESPECIALIDADES.map(v => <MenuItem key={v.id} value={v.id}>{v.descricao}</MenuItem>)}
                            </TextField>

                            <TextField size="small" label="Plano" value={qPlano} onChange={(e) => setQPlano(e.target.value.toUpperCase())} fullWidth />

                            <Stack direction="row" alignItems="center" sx={{ px: 0.5 }}>
                                <Checkbox checked={somenteSemHosp} onChange={(e) => setSomenteSemHosp(e.target.checked)} sx={{ p: 0.5, mr: 1 }} />
                                <Typography variant="body2">Planos sem hospitais</Typography>
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
                                    {colOrder.filter(c => c !== "select").map((key, idx) => {
                                        const meta = COL_META[key as keyof typeof COL_META];
                                        const active = sortField === (key as keyof GridRow);
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
                                                    <Button onClick={toggleSort(key as keyof GridRow)} size="small" sx={{ textTransform: "none", color: "inherit" }}>
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
                                {paginated.map((r: GridRow) => (
                                    <TableRow key={r.id} hover selected={!!r.isGhost}>
                                        <TableCell padding="checkbox">
                                            <Checkbox disabled={!!r.isGhost || typeof r.id !== "number"} checked={typeof r.id === "number" && selected.has(r.id as number)} onChange={() => toggleRow(r.id)} />
                                        </TableCell>
                                        {colOrder.filter(c => c !== "select").map(c => (
                                            <TableCell key={c} align={COL_META[c as keyof typeof COL_META].align ?? "left"}>
                                                {r[c as keyof GridRow] as any}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {operadoraReq && paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={colOrder.length}>
                                            <Box sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>Nenhum registro encontrado</Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!operadoraReq && (
                                    <TableRow>
                                        <TableCell colSpan={colOrder.length}>
                                            <Box sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>Selecione a Operadora para listar resultados</Box>
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
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        labelRowsPerPage="Linhas por página"
                    />
                </Paper>

                {/* Totalizador */}
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right", pr: 1 }}>
                    Mostrando {paginated.length} de {filtered.length} registro(s)
                </Typography>

                {/* Barra de ações (sem Alterar, com Incluir em Lote) */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Stack direction="row" gap={1}>
                            <Button startIcon={<DomainAddIcon />} size="small" variant="contained" onClick={() => setOpenInc(true)}>
                                Incluir
                            </Button>
                            <Button startIcon={<PlaylistAddIcon />} size="small" variant="outlined" onClick={() => setOpenLote(true)}>
                                Incluir em lote
                            </Button>
                            <Button startIcon={<UploadIcon />} size="small" variant="outlined" onClick={() => setOpenImport(true)}>Importar</Button>
                            <Button startIcon={<DownloadIcon />} size="small" variant="outlined" onClick={() => setOpenExport(true)}>Exportar</Button>
                            <Button size="small" color="error" variant="outlined" disabled={selected.size === 0} onClick={excluir}>Excluir</Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>

            {/* Modal INCLUIR (1:1) */}
            <Dialog open={openInc} onClose={() => setOpenInc(false)} fullWidth maxWidth="sm">
                <DialogTitle>Novo vínculo (Estabelecimento × Plano)</DialogTitle>
                <DialogContent dividers>
                    <Stack gap={1.5} sx={{ pt: 1 }}>
                        <Stack direction="row" gap={1}>
                            <TextField
                                label="Estabelecimento" size="small" value={incEstab ? `${incEstab.nome} · ${incEstab.municipio}/${incEstab.estado}` : ""} fullWidth InputProps={{ readOnly: true }}
                            />
                            <Button startIcon={<SearchIcon />} variant="outlined" size="small" onClick={() => setOpenBuscaEstab("inc")}>Pesquisar</Button>
                        </Stack>
                        {incEstab && (
                            <Typography variant="caption" color="text.secondary">Especialidade: {espDesc(incEstab.id_especialidade)}</Typography>
                        )}

                        <Stack direction="row" gap={1}>
                            <TextField
                                label="Plano" size="small" value={incPlano ? `${incPlano.nome} · ${opNome(incPlano.id_operadora)} · ${modDesc(incPlano.id_modalidade)}` : ""} fullWidth InputProps={{ readOnly: true }}
                            />
                            <Button startIcon={<SearchIcon />} variant="outlined" size="small" onClick={() => setOpenBuscaPlano("inc")}>Pesquisar</Button>
                        </Stack>

                        {operadoraReq && (
                            <Typography variant="caption" color="text.secondary">Filtrando por Operadora: <strong>{opNome(Number(operadoraReq))}</strong></Typography>
                        )}

                        <FormControlLabel control={<Checkbox checked={incContinuar} onChange={(e) => setIncContinuar(e.target.checked)} />} label="Continuar incluindo" />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenInc(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={salvarInc} disabled={!incEstab || !incPlano}>Salvar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal INCLUIR EM LOTE */}
            <Dialog open={openLote} onClose={() => setOpenLote(false)} fullWidth maxWidth="sm">
                <DialogTitle>Incluir em lote (múltiplos Planos para 1 Estabelecimento)</DialogTitle>
                <DialogContent dividers>
                    <Stack gap={1.5} sx={{ pt: 1 }}>
                        <Stack direction="row" gap={1}>
                            <TextField label="Estabelecimento" size="small" value={loteEstab ? `${loteEstab.nome} · ${loteEstab.municipio}/${loteEstab.estado}` : ""} fullWidth InputProps={{ readOnly: true }} />
                            <Button startIcon={<SearchIcon />} variant="outlined" size="small" onClick={() => setOpenBuscaEstab("lote")}>Pesquisar</Button>
                        </Stack>
                        <Stack direction="row" gap={1}>
                            <TextField label="Planos selecionados" size="small" value={lotePlanos.length ? `${lotePlanos.length} plano(s)` : ""} fullWidth InputProps={{ readOnly: true }} />
                            <Button startIcon={<SearchIcon />} variant="outlined" size="small" onClick={() => setOpenBuscaPlano("lote")}>Pesquisar</Button>
                        </Stack>
                        {lotePlanos.length > 0 && (
                            <Stack direction="row" gap={1} flexWrap="wrap">
                                {lotePlanos.map((p: Plano) => <Chip key={p.id} label={`${p.nome} · ${modDesc(p.id_modalidade)}`} size="small" />)}
                            </Stack>
                        )}
                        {operadoraReq && (
                            <Typography variant="caption" color="text.secondary">Filtrando por Operadora: <strong>{opNome(Number(operadoraReq))}</strong></Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLote(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={salvarLote} disabled={!loteEstab || lotePlanos.length === 0}>Salvar</Button>
                </DialogActions>
            </Dialog>

            {/* SUB-BUSCA: Estabelecimento */}
            <Dialog open={!!openBuscaEstab} onClose={() => setOpenBuscaEstab(null)} fullWidth maxWidth="md">
                <DialogTitle>Pesquisar Estabelecimento</DialogTitle>
                <DialogContent dividers>
                    <EstabSearch onSelect={(e) => {
                        if (openBuscaEstab === "inc") setIncEstab(e);
                        else setLoteEstab(e);
                        setOpenBuscaEstab(null);
                    }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBuscaEstab(null)}>Fechar</Button>
                </DialogActions>
            </Dialog>

            {/* SUB-BUSCA: Planos */}
            <Dialog open={!!openBuscaPlano} onClose={() => setOpenBuscaPlano(null)} fullWidth maxWidth="md">
                <DialogTitle>{openBuscaPlano === "lote" ? "Pesquisar Planos (múltipla seleção)" : "Pesquisar Plano"}</DialogTitle>
                <DialogContent dividers>
                    <PlanoSearch
                        multi={openBuscaPlano === "lote"}
                        idOperadoraFiltro={operadoraReq ? Number(operadoraReq) : undefined}
                        onConfirm={(planos) => {
                            if (openBuscaPlano === "inc") setIncPlano(planos[0] || null);
                            else setLotePlanos(planos);
                            setOpenBuscaPlano(null);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBuscaPlano(null)}>Fechar</Button>
                </DialogActions>
            </Dialog>

            {/* IMPORTAR (simulado) */}
            <Dialog open={openImport} onClose={() => setOpenImport(false)} fullWidth maxWidth="sm">
                <DialogTitle>Importar vínculos</DialogTitle>
                <DialogContent dividers>
                    <Stack gap={1.2}>
                        <Typography variant="body2" color="text.secondary">Selecione um arquivo CSV no layout da tela Hospitais (protótipo)</Typography>
                        <TextField type="file" size="small" inputProps={{ accept: ".csv" }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenImport(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={() => { setOpenImport(false); setSnack({ open: true, msg: "Importação concluída (simulado)", sev: "success" }); }}>Importar</Button>
                </DialogActions>
            </Dialog>

            {/* EXPORTAR (simulado) */}
            <Dialog open={openExport} onClose={() => setOpenExport(false)} fullWidth maxWidth="sm">
                <DialogTitle>Exportar vínculos</DialogTitle>
                <DialogContent dividers>
                    <Stack gap={1.2}>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="formato-label">Formato</InputLabel>
                            <MUISelect labelId="formato-label" label="Formato" value={exportFormato} onChange={(e) => setExportFormato(e.target.value as any)}>
                                <MenuItem value="csv">CSV</MenuItem>
                                <MenuItem value="json">JSON</MenuItem>
                            </MUISelect>
                        </FormControl>
                        <FormControlLabel control={<Checkbox checked={exportSomenteSel} onChange={(e) => setExportSomenteSel(e.target.checked)} />} label="Exportar somente selecionados" />
                        {exportSomenteSel && selected.size === 0 && (
                            <Alert severity="warning">Nenhuma linha selecionada</Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenExport(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={() => { setOpenExport(false); setSnack({ open: true, msg: `Exportação ${exportFormato.toUpperCase()} pronta (simulado)`, sev: "info" }); }}>Gerar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack.sev} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

// ---------- Componentes de busca ----------
function EstabSearch({ onSelect }: { onSelect: (e: Estabelecimento) => void }) {
    const [nome, setNome] = React.useState<string>("");
    const [municipio, setMunicipio] = React.useState<string>("");
    const [estado, setEstado] = React.useState<string>("");

    const resultados: Estabelecimento[] = React.useMemo(() => {
        return ESTABELECIMENTOS.filter((e: Estabelecimento) => {
            const okNome = !nome || e.nome.includes(nome.toUpperCase());
            const okMun = !municipio || e.municipio.toUpperCase().includes(municipio.toUpperCase());
            const okUF = !estado || e.estado.toUpperCase().includes(estado.toUpperCase());
            return okNome && okMun && okUF;
        });
    }, [nome, municipio, estado]);

    return (
        <Stack gap={1.2}>
            <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                <TextField size="small" label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} fullWidth />
                <TextField size="small" label="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} fullWidth />
                <TextField size="small" label="Estado (UF)" value={estado} onChange={(e) => setEstado(e.target.value)} fullWidth />
            </Stack>

            <Paper sx={{ p: 0, overflow: "hidden" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ "& th": { backgroundColor: "#eef1f5", fontWeight: 600 } }}>
                            <TableCell>Estabelecimento</TableCell>
                            <TableCell>Município</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Especialidade</TableCell>
                            <TableCell width={120}>Ação</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resultados.map((r: Estabelecimento) => (
                            <TableRow key={r.id} hover>
                                <TableCell>{r.nome}</TableCell>
                                <TableCell>{r.municipio}</TableCell>
                                <TableCell>{r.estado}</TableCell>
                                <TableCell>{espDesc(r.id_especialidade)}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="contained" onClick={() => onSelect(r)}>Selecionar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {resultados.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>Sem resultados</Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Stack>
    );
}

function PlanoSearch({ multi, idOperadoraFiltro, onConfirm }: { multi?: boolean; idOperadoraFiltro?: number; onConfirm: (planos: Plano[]) => void }) {
    const [idOperadora, setIdOperadora] = React.useState<number | "">(idOperadoraFiltro || "");
    const [idModalidade, setIdModalidade] = React.useState<number | "">("");
    const [texto, setTexto] = React.useState<string>("");
    const [sel, setSel] = React.useState<number[]>([]);

    const resultados: Plano[] = React.useMemo(() => {
        return PLANOS.filter((p: Plano) => {
            const okOp = !idOperadora || p.id_operadora === Number(idOperadora);
            const okMod = !idModalidade || p.id_modalidade === Number(idModalidade);
            const okTx = !texto || p.nome.includes(texto.toUpperCase());
            return okOp && okMod && okTx;
        });
    }, [idOperadora, idModalidade, texto]);

    const toggle = (id: number) => {
        if (!multi) { setSel([id]); return; }
        setSel((prev: number[]) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleConfirm = () => {
        onConfirm(resultados.filter((p: Plano) => sel.includes(p.id)));
    };

    return (
        <Stack gap={1.2}>
            <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                <TextField select size="small" label="Operadora" value={idOperadora} onChange={(e) => setIdOperadora(e.target.value ? Number(e.target.value) : "")} fullWidth>
                    <MenuItem value="">(Todas)</MenuItem>
                    {OPERADORAS.map(o => <MenuItem key={o.id} value={o.id}>{o.nome}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Modalidade" value={idModalidade} onChange={(e) => setIdModalidade(e.target.value ? Number(e.target.value) : "")} fullWidth>
                    <MenuItem value="">(Todas)</MenuItem>
                    {MODALIDADES.map(m => <MenuItem key={m.id} value={m.id}>{m.descricao}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Nome do Plano" value={texto} onChange={(e) => setTexto(e.target.value)} fullWidth />
            </Stack>

            <Paper sx={{ p: 0, overflow: "hidden" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ "& th": { backgroundColor: "#eef1f5", fontWeight: 600 } }}>
                            <TableCell width={60}></TableCell>
                            <TableCell>Plano</TableCell>
                            <TableCell>Operadora</TableCell>
                            <TableCell>Modalidade</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resultados.map((p: Plano) => (
                            <TableRow key={p.id} hover>
                                <TableCell>
                                    <Checkbox
                                        checked={sel.includes(p.id)}
                                        onChange={() => toggle(p.id)}
                                        indeterminate={false}
                                        sx={{ p: 0.5 }}
                                    />
                                </TableCell>
                                <TableCell>{p.nome}</TableCell>
                                <TableCell>{opNome(p.id_operadora)}</TableCell>
                                <TableCell>{modDesc(p.id_modalidade)}</TableCell>
                            </TableRow>
                        ))}
                        {resultados.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>Sem resultados</Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button onClick={handleConfirm} variant="contained">Confirmar</Button>
            </Stack>
        </Stack>
    );
}
