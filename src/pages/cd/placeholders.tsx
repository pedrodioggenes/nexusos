// CD Placeholder Pages — each exports a default component wrapping PlaceholderPage
import PlaceholderPage from "./PlaceholderPage";

export const CDAlertasPage = () => <PlaceholderPage title="Alertas" description="Centro de alertas operacionais" />;
export const CDPerdasPage = () => <PlaceholderPage title="Perdas" description="Registro de perdas por origem" />;
export const CDShrinkPage = () => <PlaceholderPage title="Shrink Rate" description="Taxa de perdas e vendor shrink" />;
export const CDPainelLojaPage = () => <PlaceholderPage title="Painel da Loja" description="Visão consolidada por unidade" />;
export const CDPainelCLevelPage = () => <PlaceholderPage title="Painel C-Level" description="Dashboard executivo consolidado" />;
export const CDImportacaoPage = () => <PlaceholderPage title="Importar Dados" description="Upload de consumo histórico (CSV)" />;
