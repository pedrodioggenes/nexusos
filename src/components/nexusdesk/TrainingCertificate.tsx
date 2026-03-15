import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { BRAND, TYPE, SPACE, PAGE } from "@/lib/pdf/theme";

interface TrainingCertificateProps {
  userName: string;
  trainingTitle: string;
  completedAt: string;
  tenantName: string;
  mandatory?: boolean;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: BRAND.white,
    padding: 0,
    position: "relative",
  },
  topStrip: {
    height: 6,
    backgroundColor: BRAND.red,
  },
  bottomStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: BRAND.red,
  },
  body: {
    flex: 1,
    paddingHorizontal: 80,
    paddingTop: 60,
    paddingBottom: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: TYPE.caption,
    color: BRAND.gray400,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: SPACE.lg,
  },
  title: {
    fontSize: TYPE.hero,
    fontFamily: "Helvetica-Bold",
    color: BRAND.gray900,
    marginBottom: SPACE.xl,
    textAlign: "center",
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: BRAND.red,
    marginBottom: SPACE.xxl,
  },
  certText: {
    fontSize: TYPE.h3,
    color: BRAND.gray600,
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: SPACE.sm,
  },
  userName: {
    fontSize: TYPE.h1,
    fontFamily: "Helvetica-Bold",
    color: BRAND.gray900,
    textAlign: "center",
    marginTop: SPACE.md,
    marginBottom: SPACE.md,
  },
  courseTitle: {
    fontSize: TYPE.h2,
    fontFamily: "Helvetica-Bold",
    color: BRAND.red,
    textAlign: "center",
    marginTop: SPACE.sm,
    marginBottom: SPACE.xxl,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    marginTop: SPACE.xl,
  },
  dateLabel: {
    fontSize: TYPE.body,
    color: BRAND.gray500,
  },
  dateValue: {
    fontSize: TYPE.body,
    fontFamily: "Helvetica-Bold",
    color: BRAND.gray700,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 80,
    right: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: TYPE.tiny,
    color: BRAND.gray400,
  },
  badge: {
    paddingHorizontal: SPACE.sm,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: BRAND.redLight,
  },
  badgeText: {
    fontSize: TYPE.tiny,
    fontFamily: "Helvetica-Bold",
    color: BRAND.red,
  },
});

export function TrainingCertificate({
  userName,
  trainingTitle,
  completedAt,
  tenantName,
  mandatory,
}: TrainingCertificateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.topStrip} />
        <View style={s.body}>
          <Text style={s.label}>Certificado de Conclusão</Text>
          <Text style={s.title}>Certificado</Text>
          <View style={s.divider} />
          <Text style={s.certText}>Certificamos que</Text>
          <Text style={s.userName}>{userName}</Text>
          <Text style={s.certText}>concluiu com êxito o treinamento</Text>
          <Text style={s.courseTitle}>{trainingTitle}</Text>
          {mandatory && (
            <View style={s.badge}>
              <Text style={s.badgeText}>TREINAMENTO OBRIGATÓRIO</Text>
            </View>
          )}
          <View style={s.dateRow}>
            <Text style={s.dateLabel}>Data de conclusão:</Text>
            <Text style={s.dateValue}>{completedAt}</Text>
          </View>
        </View>
        <View style={s.footer}>
          <Text style={s.footerText}>{tenantName} — NexusDesk</Text>
          <Text style={s.footerText}>Documento gerado automaticamente</Text>
        </View>
        <View style={s.bottomStrip} />
      </Page>
    </Document>
  );
}
