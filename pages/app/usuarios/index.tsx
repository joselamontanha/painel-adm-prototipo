import { Box as BoxU, Paper as PaperU, Typography as TypographyU } from "@mui/material";
export default function Usuarios() {
    return (
        <BoxU sx={{ p: 2 }}>
            <PaperU sx={{ p: 3 }}>
                <TypographyU variant="h6">Usuários</TypographyU>
                <TypographyU color="text.secondary">Placeholder — conteúdo a definir.</TypographyU>
            </PaperU>
        </BoxU>
    );
}