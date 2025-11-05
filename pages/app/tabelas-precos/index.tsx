// pages/app/tabelas-precos/index.tsx
import * as React from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    Button,
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
    MenuItem,
    FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import LibraryAddIcon from "@mui/icons-material/PlaylistAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// ---------------- Mock datasets ----------------
interface Praca { id: number; nome: string; uf: string }
interface Operadora { id: number; nome: string; uf: string; cnpj: string; razao: string }
interface Plano { id: number; id_operadora: number; nome: string; modalidade: string }
interface Variacao { id: number; id_plano: number; descricao: string }

const PRACAS: Praca[] = [
    { id: 95, nome: "Curitiba", uf: "PR" },
    { id: 96, nome: "Londrina", uf: "PR" },
    { id: 98, nome: "Maringá", uf: "PR" },
    { id: 10, nome: "Florianópolis", uf: "SC" },
];

const OPERADORAS: Operadora[] = [
    { id: 1, nome: "UNIMED CURITIBA", uf: "PR", cnpj: "29309127000179", razao: "Unimed Curitiba Coop. de Trabalho Médico" },
    { id: 2, nome: "HAPVIDA PR", uf: "PR", cnpj: "12345678000100", razao: "Hapvida Assistência Médica S.A." },
    { id: 3, nome: "NOSSA SAÚDE", uf: "PR", cnpj: "11222333000155", razao: "Nossa Saúde Assistência Médica" },
    { id: 4, nome: "SELECT SAÚDE", uf: "PR", cnpj: "99887766000111", razao: "Select Saúde Ltda" },
    { id: 5, nome: "UNIMED FLORIPA", uf: "SC", cnpj: "44556677000122", razao: "Unimed Grande Florianópolis" },
];

const PLANOS: Plano[] = [
    { id: 1, id_operadora: 1, nome: "Prata", modalidade: "Enfermaria" },
    { id: 2, id_operadora: 1, nome: "Ouro", modalidade: "Apartamento" },
    { id: 3, id_operadora: 2, nome: "Essencial", modalidade: "Enfermaria" },
    { id: 4, id_operadora: 3, nome: "Smart", modalidade: "Apartamento" },
    { id: 5, id_operadora: 4, nome: "Prime", modalidade: "Apartamento" },
];

const VARIACOES: Variacao[] = [
    { id: 11, id_plano: 1, descricao: "PRATA URBANO" },
    { id: 12, id_plano: 1, descricao: "PRATA EMPRESARIAL" },
    { id: 21, id_plano: 2, descricao: "OURO PLUS" },
    { id: 31, id_plano: 3, descricao: "ESSENCIAL BÁSICO" },
    { id: 41, id_plano: 4, descricao: "SMART FLEX" },
    { id: 51, id_plano: 5, descricao: "PRIME TOP" },
];

const TIPOS_COMP = [
    { id: 1, descricao: "FUNCIONÁRIOS", pf: false, mei: false },
    { id: 2, descricao: "SÓCIOS", pf: false, mei: false },
    { id: 3, descricao: "PF INDIVIDUAL", pf: true, mei: false },
    { id: 4, descricao: "MEI", pf: false, mei: true },
];

const PROFISSOES = ["ENGENHEIRO", "MÉDICO", "ADVOGADO", "PROGRAMADOR", "DENTISTA"];
const FAIXAS_ETARIAS = ["00-18", "19-23", "24-28", "29-33", "34-38", "39-43", "44-48", "49-53", "54-58", "59+"];
const FAIXAS_FIDELIDADE = ["SEM FIDELIDADE", "12 MESES", "24 MESES"];
const FAIXAS_QTD = [
    { id: 1, descricao: "02-03 VIDAS", min: 2, max: 3 },
    { id: 2, descricao: "04-05 VIDAS", min: 4, max: 5 },
    { id: 3, descricao: "06-09 VIDAS", min: 6, max: 9 },
    { id: 4, descricao: "10-29 VIDAS", min: 10, max: 29 },
];

// ---------------- Helpers ----------------
const pad2 = (n: number) => String(n).padStart(2, "0");
const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso: string) => {
    const s = iso.includes("T") ? iso.split("T")[0] : iso; // YYYY-MM-DD
    const [y, m, d] = s.split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};
const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// ---------------- Tipos grid ----------------
type ColKey =
    | "select" | "plano" | "variacao" | "tipoCompulsorio" | "profissao" | "faixaEtaria" | "faixaQtdVidas" | "faixaFidelidade" | "valorBase" | "valorFinal" | "iniVigencia" | "fimVigencia" | "createdAt";

interface Row {
    id: number;
    plano: string;
    variacao: string;
    tipoCompulsorio: string;
    profissao: string;
    faixaEtaria: string;
    faixaQtdVidas: string;
    faixaFidelidade: string;
    valorBase: number;
    valorFinal: number;
    iniVigencia: string; // YYYY-MM-DD
    fimVigencia: string; // YYYY-MM-DD
    createdAt: string; // ISO
    praca: string; // label
    operadora: string; // label
}

const COL_META: Record<Exclude<ColKey, "select">, { label: string; align?: "left" | "right"; minWidth?: number }> = {
    plano: { label: "Nome do Plano", minWidth: 200 },
    variacao: { label: "Plano Variação", minWidth: 220 },
    tipoCompulsorio: { label: "Tipo de Compulsório", minWidth: 200 },
    profissao: { label: "Profissão", minWidth: 160 },
    faixaEtaria: { label: "Faixa Etária", minWidth: 130 },
    faixaQtdVidas: { label: "Faixa de Qtd. de Vidas", minWidth: 200 },
    faixaFidelidade: { label: "Faixa de Fidelidade", minWidth: 180 },
    valorBase: { label: "Valor Base", align: "right", minWidth: 130 },
    valorFinal: { label: "Valor Final", align: "right", minWidth: 130 },
    iniVigencia: { label: "Data Início Vigência", minWidth: 170 },
    fimVigencia: { label: "Data Final Vigência", minWidth: 170 },
    createdAt: { label: "Criado em", minWidth: 160 },
};

// ---------------- Mock rows ----------------
function makeRows(qty = 120): Row[] {
    const rows: Row[] = [];
    const hoje = new Date();
    for (let i = 1; i <= qty; i++) {
        const op = rand(OPERADORAS);
        const planosDaOp = PLANOS.filter(p => p.id_operadora === op.id);
        const pl = planosDaOp.length ? rand(planosDaOp) : rand(PLANOS);
        const vars = VARIACOES.filter(v => v.id_plano === pl.id);
        const vr = vars.length ? rand(vars) : rand(VARIACOES);

        const pr = rand(PRACAS);
        const tipo = rand(TIPOS_COMP).descricao;
        const prof = rand(PROFISSOES);
        const et = rand(FAIXAS_ETARIAS);
        const fq = rand(FAIXAS_QTD);
        const fid = rand(FAIXAS_FIDELIDADE);

        const ini = new Date(hoje.getFullYear(), rand([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), rand([1, 5, 10, 15, 20, 25]));
        const fim = new Date(ini); fim.setMonth(ini.getMonth() + rand([6, 12, 18]));

        const valorBase = 200 + Math.round(Math.random() * 1500);
        const valorFinal = Math.round(valorBase * (1 + Math.random() * 0.2));

        rows.push({
            id: i,
            plano: `${pl.nome} (${pl.modalidade})`,
            variacao: vr.descricao,
            tipoCompulsorio: tipo,
            profissao: prof,
            faixaEtaria: et,
            faixaQtdVidas: fq.descricao,
            faixaFidelidade: fid,
            valorBase,
            valorFinal,
            iniVigencia: `${ini.getFullYear()}-${pad2(ini.getMonth() + 1)}-${pad2(ini.getDate())}`,
            fimVigencia: `${fim.getFullYear()}-${pad2(fim.getMonth() + 1)}-${pad2(fim.getDate())}`,
            createdAt: new Date(hoje.getFullYear(), 0, rand([1, 3, 7, 12, 18, 22, 27])).toISOString(),
            praca: `${pr.nome} - ${pr.uf}`,
            operadora: `${op.nome} - ${op.uf}`,
        });
    }
    return rows;
}

// ---------------- Sub-buscas ----------------
function OperadoraSearch({ onSelect }: { onSelect: (o: Operadora) => void }) {
    const [cnpj, setCnpj] = React.useState("");
    const [razao, setRazao] = React.useState("");
    const [nome, setNome] = React.useState("");

    const resultados = React.useMemo(() => {
        return OPERADORAS.filter((o) =>
            (!cnpj || o.cnpj.includes(cnpj)) &&
            (!razao || o.razao.toUpperCase().includes(razao.toUpperCase())) &&
            (!nome || o.nome.toUpperCase().includes(nome.toUpperCase()))
        );
    }, [cnpj, razao, nome]);

    return (
        <Stack gap={1.2}>
            <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                <TextField size="small" label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} fullWidth />
                <TextField size="small" label="Razão Social" value={razao} onChange={(e) => setRazao(e.target.value)} fullWidth />
                <TextField size="small" label="Nome Comercial" value={nome} onChange={(e) => setNome(e.target.value)} fullWidth />
            </Stack>

            <Paper sx={{ p: 0, overflow: "hidden" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ "& th": { backgroundColor: "#eef1f5", fontWeight: 600 } }}>
                            <TableCell>Operadora</TableCell>
                            <TableCell>UF</TableCell>
                            <TableCell>CNPJ</TableCell>
                            <TableCell>Razão Social</TableCell>
                            <TableCell width={120}>Ação</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resultados.map((o) => (
                            <TableRow key={o.id} hover>
                                <TableCell>{o.nome}</TableCell>
                                <TableCell>{o.uf}</TableCell>
                                <TableCell>{o.cnpj}</TableCell>
                                <TableCell>{o.razao}</TableCell>
                                <TableCell><Button size="small" variant="contained" onClick={() => onSelect(o)}>Selecionar</Button></TableCell>
                            </TableRow>
                        ))}
                        {resultados.length === 0 && (
                            <TableRow><TableCell colSpan={5}><Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>Sem resultados</Box></TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Stack>
    );
}

function PlanosSearch({ multi, idOperadora, onConfirm }: { multi?: boolean; idOperadora?: number; onConfirm: (planos: Plano[]) => void }) {
    const [op, setOp] = React.useState<number | "">(idOperadora || "");
    const [modalidade, setModalidade] = React.useState<string>("");
    const [texto, setTexto] = React.useState<string>("");
    const [sel, setSel] = React.useState<number[]>([]);

    const resultados = React.useMemo(() => {
        return PLANOS.filter((p) =>
            (!op || p.id_operadora === Number(op)) &&
            (!modalidade || p.modalidade.toUpperCase().includes(modalidade.toUpperCase())) &&
            (!texto || p.nome.toUpperCase().includes(texto.toUpperCase()))
        );
    }, [op, modalidade, texto]);

    const toggle = (id: number) => {
        if (!multi) { setSel([id]); return; }
        setSel((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    };

    return (
        <Stack gap={1.2}>
            <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                <TextField select size="small" label="Operadora" value={op} onChange={(e) => setOp(e.target.value ? Number(e.target.value) : "")} fullWidth>
                    <MenuItem value="">(Todas)</MenuItem>
                    {OPERADORAS.map(o => <MenuItem key={o.id} value={o.id}>{o.nome}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Modalidade" value={modalidade} onChange={(e) => setModalidade(e.target.value)} fullWidth />
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
                        {resultados.map((p) => (
                            <TableRow key={p.id} hover>
                                <TableCell>
                                    <Checkbox checked={sel.includes(p.id)} onChange={() => toggle(p.id)} sx={{ p: 0.5 }} />
                                </TableCell>
                                <TableCell>{p.nome}</TableCell>
                                <TableCell>{OPERADORAS.find(o => o.id === p.id_operadora)?.nome}</TableCell>
                                <TableCell>{p.modalidade}</TableCell>
                            </TableRow>
                        ))}
                        {resultados.length === 0 && (
                            <TableRow><TableCell colSpan={4}><Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>Sem resultados</Box></TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Stack direction="row" justifyContent="flex-end"><Button variant="contained" onClick={() => onConfirm(resultados.filter(p => sel.includes(p.id)))}>Confirmar</Button></Stack>
        </Stack>
    );
}

function VariacoesSearch({ multi, idsPlanos, onConfirm }: { multi?: boolean; idsPlanos?: number[]; onConfirm: (vars: Variacao[]) => void }) {
    const [texto, setTexto] = React.useState("");
    const [sel, setSel] = React.useState<number[]>([]);
    const resultados = React.useMemo(() => VARIACOES.filter(v => (!idsPlanos || idsPlanos.includes(v.id_plano)) && (!texto || v.descricao.toUpperCase().includes(texto.toUpperCase()))), [idsPlanos, texto]);
    const toggle = (id: number) => { if (!multi) { setSel([id]); return; } setSel((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); };
    return (
        <Stack gap={1.2}>
            <TextField size="small" label="Descrição" value={texto} onChange={(e) => setTexto(e.target.value)} fullWidth />
            <Paper sx={{ p: 0, overflow: "hidden" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ "& th": { backgroundColor: "#eef1f5", fontWeight: 600 } }}>
                            <TableCell width={60}></TableCell>
                            <TableCell>Descrição</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resultados.map((v) => (
                            <TableRow key={v.id} hover>
                                <TableCell><Checkbox checked={sel.includes(v.id)} onChange={() => toggle(v.id)} sx={{ p: 0.5 }} /></TableCell>
                                <TableCell>{v.descricao}</TableCell>
                            </TableRow>
                        ))}
                        {resultados.length === 0 && (<TableRow><TableCell colSpan={2}><Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>Sem resultados</Box></TableCell></TableRow>)}
                    </TableBody>
                </Table>
            </Paper>
            <Stack direction="row" justifyContent="flex-end"><Button variant="contained" onClick={() => onConfirm(resultados.filter(v => sel.includes(v.id)))}>Confirmar</Button></Stack>
        </Stack>
    );
}

function SimpleListSearch({ label, items, onSelect }: { label: string; items: string[]; onSelect: (val: string) => void }) {
    const [texto, setTexto] = React.useState("");
    const results = React.useMemo(() => items.filter(d => !texto || d.toUpperCase().includes(texto.toUpperCase())), [items, texto]);
    return (
        <Stack gap={1.2}>
            <TextField size="small" label={label} value={texto} onChange={(e) => setTexto(e.target.value)} fullWidth />
            <Paper sx={{ p: 0, overflow: "hidden" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ "& th": { backgroundColor: "#eef1f5", fontWeight: 600 } }}>
                            <TableCell>{label}</TableCell>
                            <TableCell width={120}>Ação</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((d, i) => (
                            <TableRow key={i} hover>
                                <TableCell>{d}</TableCell>
                                <TableCell><Button size="small" variant="contained" onClick={() => onSelect(d)}>Selecionar</Button></TableCell>
                            </TableRow>
                        ))}
                        {results.length === 0 && (<TableRow><TableCell colSpan={2}><Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>Sem resultados</Box></TableCell></TableRow>)}
                    </TableBody>
                </Table>
            </Paper>
        </Stack>
    );
}

// ---------------- Página ----------------
function TabelasPrecos() {
    const router = useRouter();

    const [rows, setRows] = React.useState<Row[]>([]);
    React.useEffect(() => setRows(makeRows(140)), []);

    // obrigatórios
    const [praca, setPraca] = React.useState<Praca | null>(null);
    const [operadora, setOperadora] = React.useState<Operadora | null>(null);

    // opcionais
    const [planosSel, setPlanosSel] = React.useState<Plano[]>([]);
    const [variacoesSel, setVariacoesSel] = React.useState<Variacao[]>([]);
    const [tipoCompSel, setTipoCompSel] = React.useState<typeof TIPOS_COMP[number] | null>(null);
    const [profissaoSel, setProfissaoSel] = React.useState<string | null>(null);
    const [faixaEtariaSel, setFaixaEtariaSel] = React.useState<string | null>(null);
    const [qtdVidas, setQtdVidas] = React.useState<number | "">("");
    const [faixaFidSel, setFaixaFidSel] = React.useState<string | null>(null);
    const [valorMin, setValorMin] = React.useState<number | "">("");
    const [valorMax, setValorMax] = React.useState<number | "">("");
    const [vigenciaFinal, setVigenciaFinal] = React.useState<string>("");
    const [apenasVigentes, setApenasVigentes] = React.useState(true);

    // dialogs
    const [openOp, setOpenOp] = React.useState(false);
    const [openPlanos, setOpenPlanos] = React.useState(false);
    const [openVars, setOpenVars] = React.useState(false);
    const [openProf, setOpenProf] = React.useState(false);
    const [openEt, setOpenEt] = React.useState(false);
    const [openFid, setOpenFid] = React.useState(false);

    // grid state
    const [selected, setSelected] = React.useState<Set<number>>(new Set());
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [sortField, setSortField] = React.useState<Exclude<ColKey, "select">>("plano");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
    const [colOrder, setColOrder] = React.useState<ColKey[]>(["select", "plano", "variacao", "tipoCompulsorio", "profissao", "faixaEtaria", "faixaQtdVidas", "faixaFidelidade", "valorBase", "valorFinal", "iniVigencia", "fimVigencia", "createdAt"]);
    const dragIndex = React.useRef<number | null>(null);

    const operadorasDaPraca = React.useMemo(() => (!praca ? OPERADORAS : OPERADORAS.filter(o => o.uf === praca.uf)), [praca]);
    const planosDaOperadora = React.useMemo(() => (!operadora ? [] : PLANOS.filter(p => p.id_operadora === operadora.id)), [operadora]);
    const variacoesDosPlanos = React.useMemo(() => { if (planosSel.length === 0) return [] as Variacao[]; const ids = new Set(planosSel.map(p => p.id)); return VARIACOES.filter(v => ids.has(v.id_plano)); }, [planosSel]);

    const filtered = React.useMemo(() => {
        let data = [...rows];
        if (praca) data = data.filter(r => r.praca === `${praca.nome} - ${praca.uf}`);
        if (operadora) data = data.filter(r => r.operadora.startsWith(operadora.nome));
        if (planosSel.length) { const nomes = new Set(planosSel.map(p => `${p.nome} (${p.modalidade})`)); data = data.filter(r => nomes.has(r.plano)); }
        if (variacoesSel.length) { const descs = new Set(variacoesSel.map(v => v.descricao)); data = data.filter(r => descs.has(r.variacao)); }
        if (tipoCompSel) data = data.filter(r => r.tipoCompulsorio === tipoCompSel.descricao);
        if (profissaoSel) data = data.filter(r => r.profissao === profissaoSel);
        if (faixaEtariaSel) data = data.filter(r => r.faixaEtaria === faixaEtariaSel);
        if (qtdVidas !== "") { const q = Number(qtdVidas); data = data.filter(r => { const match = FAIXAS_QTD.find(f => f.descricao === r.faixaQtdVidas); return match ? q >= match.min && q <= match.max : true; }); }
        if (faixaFidSel) data = data.filter(r => r.faixaFidelidade === faixaFidSel);
        if (valorMin !== "") data = data.filter(r => r.valorFinal >= Number(valorMin));
        if (valorMax !== "") data = data.filter(r => r.valorFinal <= Number(valorMax));
        if (vigenciaFinal) data = data.filter(r => r.fimVigencia === vigenciaFinal);
        if (apenasVigentes) { const d = new Date(); const today = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; data = data.filter(r => r.iniVigencia <= today && r.fimVigencia >= today); }
        data.sort((a, b) => { const A = a[sortField]; const B = b[sortField]; const cmp = typeof A === "number" && typeof B === "number" ? (A as number) - (B as number) : String(A).localeCompare(String(B), "pt-BR", { numeric: true }); return sortDir === "asc" ? cmp : -cmp; });
        return data;
    }, [rows, praca, operadora, planosSel, variacoesSel, tipoCompSel, profissaoSel, faixaEtariaSel, qtdVidas, faixaFidSel, valorMin, valorMax, vigenciaFinal, apenasVigentes, sortField, sortDir]);

    const paginated = React.useMemo(() => { const start = page * rowsPerPage; return filtered.slice(start, start + rowsPerPage); }, [filtered, page, rowsPerPage]);

    const toggleRow = (id: number) => setSelected(prev => { const c = new Set(prev); c.has(id) ? c.delete(id) : c.add(id); return c; });
    const allOnPageSelected = paginated.length > 0 && paginated.every(r => selected.has(r.id));
    const someOnPageSelected = paginated.some(r => selected.has(r.id)) && !allOnPageSelected;
    const toggleSelectPage = (checked: boolean) => setSelected(prev => { const c = new Set(prev); const ids = paginated.map(r => r.id); if (checked) ids.forEach(id => c.add(id)); else ids.forEach(id => c.delete(id)); return c; });

    const resetOptional = () => { setPlanosSel([]); setVariacoesSel([]); setTipoCompSel(null); setProfissaoSel(null); setFaixaEtariaSel(null); setQtdVidas(""); setFaixaFidSel(null); setValorMin(""); setValorMax(""); setVigenciaFinal(""); setApenasVigentes(true); };
    const handleClose = () => router.replace("/app");

    const toggleSort = (field: Exclude<ColKey, "select">) => () => { if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("asc"); } };
    const handleDrop = (i: number) => () => { if (dragIndex.current === null || dragIndex.current === i) return; setColOrder(prev => { const arr = [...prev]; const [moved] = arr.splice(dragIndex.current!, 1); arr.splice(i, 0, moved); return arr; }); };

    return (
        <Box sx={{ p: 2 }}>
            {/* Header */}
            <Paper sx={{ p: 1, mb: 2, backgroundColor: "#eef1f5", border: "1px solid #e5e7eb" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>Cadastro de Tabelas de Preços</Typography>
                    <Tooltip title="Fechar"><IconButton size="small" onClick={handleClose}><CloseIcon /></IconButton></Tooltip>
                </Stack>
            </Paper>

            <Stack gap={2}>
                {/* Filtros obrigatórios */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack gap={0.8}>
                        <Typography variant="subtitle1" fontWeight={700}>Filtros obrigatórios</Typography>
                        <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                            {/* Praça agora como dropdown */}
                            <TextField
                                select
                                size="small"
                                label="Praça"
                                value={praca?.id ?? ""}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setPraca(v ? PRACAS.find(p => p.id === Number(v)) || null : null);
                                }}
                                fullWidth
                            >
                                <MenuItem value="">(Selecione)</MenuItem>
                                {PRACAS.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{`${p.uf} - ${p.nome}`}</MenuItem>
                                ))}
                            </TextField>

                            <Stack direction="row" gap={1} sx={{ width: "100%" }}>
                                <TextField size="small" label="Operadora" value={operadora ? `${operadora.nome} - ${operadora.uf}` : ""} InputProps={{ readOnly: true }} fullWidth onClick={() => setOpenOp(true)} />
                                <Button startIcon={<SearchIcon />} variant="outlined" size="small" onClick={() => setOpenOp(true)}>Pesquisar</Button>
                            </Stack>

                            <Button startIcon={<SearchIcon />} size="small" variant="contained" sx={{ minWidth: 120 }} onClick={() => setPage(0)}>Buscar</Button>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Filtros opcionais */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack gap={0.8}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={700}>Filtros opcionais</Typography>
                            <Button onClick={resetOptional} startIcon={<RestartAltIcon />} size="small" variant="text">Limpar filtros</Button>
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                            {/* Plano - múltipla */}
                            <Stack direction="row" gap={1} sx={{ width: "100%" }}>
                                <TextField size="small" label="Plano (múltipla)" value={planosSel.map(p => `${p.nome} (${p.modalidade})`).join(", ")} InputProps={{ readOnly: true }} fullWidth onClick={() => operadora && setOpenPlanos(true)} placeholder={operadora ? "Pesquisar..." : "Selecione a operadora primeiro"} />
                                <Button variant="outlined" size="small" onClick={() => operadora && setOpenPlanos(true)} disabled={!operadora}>Pesquisar</Button>
                            </Stack>

                            {/* Plano Variação - múltipla */}
                            <Stack direction="row" gap={1} sx={{ width: "100%" }}>
                                <TextField size="small" label="Plano Variação (múltipla)" value={variacoesSel.map(v => v.descricao).join(", ")} InputProps={{ readOnly: true }} fullWidth onClick={() => planosSel.length && setOpenVars(true)} placeholder={planosSel.length ? "Pesquisar..." : "Selecione plano(s) primeiro"} />
                                <Button variant="outlined" size="small" onClick={() => planosSel.length && setOpenVars(true)} disabled={!planosSel.length}>Pesquisar</Button>
                            </Stack>

                            <TextField select size="small" label="Tipo Compulsório" value={tipoCompSel?.id ?? ""} onChange={(e) => setTipoCompSel(e.target.value ? TIPOS_COMP.find(t => t.id === Number(e.target.value)) || null : null)} fullWidth>
                                <MenuItem value="">(Qualquer)</MenuItem>
                                {TIPOS_COMP.map(t => <MenuItem key={t.id} value={t.id}>{t.descricao}{t.pf ? " (PF)" : ""}{t.mei ? " (MEI)" : ""}</MenuItem>)}
                            </TextField>
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                            {/* Profissão */}
                            <Stack direction="row" gap={1} sx={{ width: "100%" }}>
                                <TextField size="small" label="Profissão" value={profissaoSel ?? ""} InputProps={{ readOnly: true }} fullWidth onClick={() => setOpenProf(true)} />
                                <Button variant="outlined" size="small" onClick={() => setOpenProf(true)}>Pesquisar</Button>
                            </Stack>

                            {/* Faixa Etária */}
                            <Stack direction="row" gap={1} sx={{ width: "100%" }}>
                                <TextField size="small" label="Faixa Etária" value={faixaEtariaSel ?? ""} InputProps={{ readOnly: true }} fullWidth onClick={() => setOpenEt(true)} />
                                <Button variant="outlined" size="small" onClick={() => setOpenEt(true)}>Pesquisar</Button>
                            </Stack>

                            <TextField size="small" label="Qtd. de Vidas (nº)" type="number" value={qtdVidas} onChange={(e) => setQtdVidas(e.target.value === "" ? "" : Number(e.target.value))} fullWidth />
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} gap={1} sx={{ flexWrap: 'nowrap' }}>
                            {/* Faixa Fidelidade */}
                            <Stack direction="row" gap={1} sx={{ width: "100%", flexWrap: 'nowrap' }}>
                                <TextField size="small" label="Faixa Fidelidade" value={faixaFidSel ?? ""} InputProps={{ readOnly: true }} fullWidth onClick={() => setOpenFid(true)} />
                                <Button variant="outlined" size="small" onClick={() => setOpenFid(true)}>Pesquisar</Button>
                            </Stack>

                            <TextField size="small" label="Valor (mín)" type="number" value={valorMin} onChange={(e) => setValorMin(e.target.value === "" ? "" : Number(e.target.value))} sx={{ width: 160 }} />
                            <TextField size="small" label="Valor (máx)" type="number" value={valorMax} onChange={(e) => setValorMax(e.target.value === "" ? "" : Number(e.target.value))} sx={{ width: 160 }} />
                            <TextField size="small" label="Vigência Final (= data)" type="date" value={vigenciaFinal} onChange={(e) => setVigenciaFinal(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 180 }} />
                            <FormControlLabel control={<Checkbox checked={apenasVigentes} onChange={(e) => setApenasVigentes(e.target.checked)} />} label="Apenas Preços Vigentes" />
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
                                        <Checkbox indeterminate={someOnPageSelected} checked={allOnPageSelected} onChange={(e) => toggleSelectPage(e.target.checked)} />
                                    </TableCell>
                                    {colOrder.filter(c => c !== "select").map((key, idx) => {
                                        const meta = COL_META[key as keyof typeof COL_META];
                                        const active = sortField === key;
                                        return (
                                            <TableCell key={key} draggable onDragStart={() => (dragIndex.current = idx)} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop(idx)} align={meta.align ?? "left"} sx={{ minWidth: meta.minWidth }}>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <DragIndicatorIcon fontSize="small" sx={{ opacity: 0.6 }} />
                                                    <Button onClick={toggleSort(key as Exclude<ColKey, "select">)} size="small" sx={{ textTransform: "none", color: "inherit" }}>{meta.label}</Button>
                                                    {active && (sortDir === "asc" ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />)}
                                                </Stack>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginated.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell padding="checkbox"><Checkbox checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} /></TableCell>
                                        {colOrder.filter(c => c !== "select").map((c) => (
                                            <TableCell key={c} align={COL_META[c as keyof typeof COL_META].align ?? "left"}>
                                                {c === "valorBase" || c === "valorFinal" ? money(r[c as keyof Row] as number)
                                                    : c === "iniVigencia" || c === "fimVigencia" || c === "createdAt" ? fmtDate(r[c as keyof Row] as string)
                                                        : (r[c as keyof Row] as any)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {paginated.length === 0 && (
                                    <TableRow><TableCell colSpan={colOrder.length}><Box sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>Nenhum registro encontrado.</Box></TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 20, 50]} labelRowsPerPage="Linhas por página" />
                </Paper>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right", pr: 1 }}>Mostrando {paginated.length} de {filtered.length} registros filtrados</Typography>

                {/* Botões de comando (sem ações) */}
                <Paper sx={{ p: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Stack direction="row" gap={1}>
                            <Button startIcon={<AddIcon />} size="small" variant="contained">Incluir</Button>
                            <Button startIcon={<LibraryAddIcon />} size="small" variant="contained" color="secondary">Incluir em Lote</Button>
                            <Button startIcon={<EditIcon />} size="small" variant="outlined" disabled={selected.size !== 1}>Alterar</Button>
                            <Button startIcon={<DeleteIcon />} size="small" color="error" variant="outlined" disabled={selected.size === 0}>Excluir</Button>
                            <Button startIcon={<UploadIcon />} size="small" variant="outlined">Importar</Button>
                            <Button startIcon={<DownloadIcon />} size="small" variant="outlined">Exportar</Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>

            {/* ---------- DIALOGS ---------- */}
            <Dialog open={openOp} onClose={() => setOpenOp(false)} fullWidth maxWidth="md">
                <DialogTitle>Pesquisar Operadora</DialogTitle>
                <DialogContent dividers>
                    <OperadoraSearch onSelect={(o) => { setOperadora(o); setPlanosSel([]); setVariacoesSel([]); setOpenOp(false); }} />
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenOp(false)}>Fechar</Button></DialogActions>
            </Dialog>

            <Dialog open={openPlanos} onClose={() => setOpenPlanos(false)} fullWidth maxWidth="md">
                <DialogTitle>Pesquisar Planos (múltipla seleção)</DialogTitle>
                <DialogContent dividers>
                    <PlanosSearch multi idOperadora={operadora?.id} onConfirm={(ps) => { setPlanosSel(ps); setVariacoesSel([]); setOpenPlanos(false); }} />
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenPlanos(false)}>Fechar</Button></DialogActions>
            </Dialog>

            <Dialog open={openVars} onClose={() => setOpenVars(false)} fullWidth maxWidth="md">
                <DialogTitle>Pesquisar Plano Variação (múltipla seleção)</DialogTitle>
                <DialogContent dividers>
                    <VariacoesSearch multi idsPlanos={planosSel.map(p => p.id)} onConfirm={(vs) => { setVariacoesSel(vs); setOpenVars(false); }} />
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenVars(false)}>Fechar</Button></DialogActions>
            </Dialog>

            <Dialog open={openProf} onClose={() => setOpenProf(false)} fullWidth maxWidth="md">
                <DialogTitle>Pesquisar Profissão</DialogTitle>
                <DialogContent dividers>
                    <SimpleListSearch label="Descrição" items={PROFISSOES} onSelect={(d) => { setProfissaoSel(d); setOpenProf(false); }} />
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenProf(false)}>Fechar</Button></DialogActions>
            </Dialog>

            <Dialog open={openEt} onClose={() => setOpenEt(false)} fullWidth maxWidth="md">
                <DialogTitle>Pesquisar Faixa Etária</DialogTitle>
                <DialogContent dividers>
                    <SimpleListSearch label="Descrição" items={FAIXAS_ETARIAS} onSelect={(d) => { setFaixaEtariaSel(d); setOpenEt(false); }} />
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenEt(false)}>Fechar</Button></DialogActions>
            </Dialog>

            <Dialog open={openFid} onClose={() => setOpenFid(false)} fullWidth maxWidth="md">
                <DialogTitle>Pesquisar Faixa de Fidelidade</DialogTitle>
                <DialogContent dividers>
                    <SimpleListSearch label="Descrição" items={FAIXAS_FIDELIDADE} onSelect={(d) => { setFaixaFidSel(d); setOpenFid(false); }} />
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenFid(false)}>Fechar</Button></DialogActions>
            </Dialog>
        </Box>
    );
}

// Client-only para evitar hidratação divergente por mocks aleatórios
export default dynamic(() => Promise.resolve(TabelasPrecos), { ssr: false });