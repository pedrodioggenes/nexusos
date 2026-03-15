/**
 * Workspace Document PDF Template
 * Professional A4 layout for BlockNote documents.
 */
import React from "react";
import { Document } from "@react-pdf/renderer";
import { CoverPage, FlowPage } from "../components";
import { blocksToPdfElements } from "../blocknote-to-pdf";

export interface WorkspaceDocumentData {
  title: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  blocks: unknown[];
  resolvedImageUrls: Map<string, string>;
}

export function WorkspaceDocumentPDF({ data }: { data: WorkspaceDocumentData }) {
  const dateLabel = data.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const elements = blocksToPdfElements(
    data.blocks as any[],
    data.resolvedImageUrls
  );

  return (
    <Document title={data.title} author="nexusOS" creator="Marketing">
      <CoverPage
        title={data.title}
        subtitle="Documento"
        periodLabel={dateLabel}
        reportType="DOC"
        confidential={false}
      />
      <FlowPage moduleName="Gestão • Documentos">
        {elements}
      </FlowPage>
    </Document>
  );
}
