import { Box as BoxHP, Paper as PaperHP, Typography as TypographyHP } from "@mui/material";
export default function HospitaisPlanos() {
    return (
        <BoxHP sx={{ p: 2 }}>
            <PaperHP sx={{ p: 3 }}>
                <TypographyHP variant="h6">Hospitais Planos</TypographyHP>
                <TypographyHP color="text.secondary">Placeholder — conteúdo a definir.</TypographyHP>
            </PaperHP>
        </BoxHP>
    );
}