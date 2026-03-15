/**
 * PDF Generation System — Public API
 * Uses @react-pdf/renderer for native vector PDF generation.
 */
export { BRAND, TYPE, SPACE, PAGE, baseStyles } from "./theme";

export {
  CoverPage,
  ContentPage,
  FlowPage,
  SmartSection,
  SectionHeader,
  KpiRow,
  DataTable,
  ProgressBar,
  CalloutBox,
  HorizontalBarChart,
  TwoColumn,
  StatusBadge,
  InsightGrid,
  DonutChart,
  VerticalBarChart,
} from "./components";

export { WBRDocument, type WBRData } from "./templates/wbr-template";
export { MMRDocument, type MMRData } from "./templates/mmr-template";
export { QBRDocument, type QBRData } from "./templates/qbr-template";
export { PMOReportDocument, type PMOReportData } from "./templates/pmo-report-template";
export { FinancialReportDocument, type FinancialReportData } from "./templates/financial-report-template";
export {
  ResumoMensalDocument, type ResumoMensalData,
  CustosCategoriaDocument, type CustosCategoriaData,
  GastoOrcamentoDocument, type GastoOrcamentoData,
  TopCustosDocument, type TopCustosData,
  LancamentosDocument, type LancamentosData,
} from "./templates/financial-sub-reports";
export { CDOperationsDocument, type CDOperationsData } from "./templates/cd-operations-report-template";
export { WorkspaceDocumentPDF, type WorkspaceDocumentData } from "./templates/workspace-document-template";
export { blocksToPdfElements, collectImageUrls, resolveAllImageUrls } from "./blocknote-to-pdf";
export { generateAndDownloadPDF } from "./generate-report";
