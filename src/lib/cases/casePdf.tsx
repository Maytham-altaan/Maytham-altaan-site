import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { CaseRow } from "./types";

const s = StyleSheet.create({
  page: { paddingTop: 54, paddingBottom: 60, paddingHorizontal: 56, fontSize: 10.5, lineHeight: 1.5, color: "#1a1a1a", fontFamily: "Helvetica" },
  brandRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#0f766e", paddingBottom: 6, marginBottom: 16 },
  brand: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0f766e" },
  brandMeta: { fontSize: 8.5, color: "#666" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 6, lineHeight: 1.3 },
  author: { fontSize: 10.5, color: "#333", marginBottom: 2 },
  metaLine: { fontSize: 9, color: "#666", marginBottom: 2 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, marginBottom: 14 },
  badge: { fontSize: 8, color: "#0f766e", backgroundColor: "#ccfbf1", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  h2: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0f766e", marginTop: 12, marginBottom: 3, textTransform: "uppercase" },
  body: { fontSize: 10.5, textAlign: "justify" },
  abstractBox: { backgroundColor: "#f5f5f4", borderRadius: 4, padding: 10, marginBottom: 6 },
  footer: { position: "absolute", bottom: 28, left: 56, right: 56, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 6, fontSize: 7.5, color: "#888" },
});

function Section({ title, body }: { title: string; body?: string | null }) {
  if (!body) return null;
  return (
    <View wrap={false}>
      <Text style={s.h2}>{title}</Text>
      <Text style={s.body}>{body}</Text>
    </View>
  );
}

function CaseDoc({ c, author, url }: { c: CaseRow; author: string; url: string }) {
  const year = new Date(c.submitted_at).getFullYear();
  const date = new Date(c.submitted_at).toISOString().slice(0, 10);
  const orcid = c.submitter_orcid?.replace("https://orcid.org/", "");
  return (
    <Document title={c.title_en} author={author} subject="Clinical case report">
      <Page size="A4" style={s.page}>
        <View style={s.brandRow} fixed>
          <Text style={s.brand}>Clinical Case Library</Text>
          <Text style={s.brandMeta}>Open access · CC BY 4.0</Text>
        </View>

        <Text style={s.title}>{c.title_en}</Text>
        <Text style={s.author}>{author}</Text>
        {c.submitter_affiliation ? <Text style={s.metaLine}>{c.submitter_affiliation}</Text> : null}
        {orcid ? <Text style={s.metaLine}>ORCID: {orcid}</Text> : null}
        <Text style={s.metaLine}>Published {date} · Clinical Case Library, Maytham Altaan</Text>
        {c.doi ? <Text style={s.metaLine}>DOI: {c.doi}</Text> : null}
        <Text style={s.metaLine}>{url}</Text>

        <View style={s.badgeRow}>
          <Text style={s.badge}>{c.specialty}</Text>
          <Text style={s.badge}>{c.case_type}</Text>
          {c.outcome ? <Text style={s.badge}>{c.outcome}</Text> : null}
          {c.drug ? <Text style={s.badge}>{c.drug}</Text> : null}
          {c.patient_age !== null ? <Text style={s.badge}>{`Patient: ${c.patient_age}y ${c.patient_sex || ""}`}</Text> : null}
        </View>

        <Text style={s.h2}>Abstract</Text>
        <View style={s.abstractBox}>
          <Text style={s.body}>{c.summary_en}</Text>
        </View>

        <Section title="Presentation" body={c.presentation} />
        <Section title="Investigations" body={c.investigations} />
        <Section title="Diagnosis" body={c.diagnosis} />
        <Section title="Treatment" body={c.treatment} />
        <Section title="Outcome" body={c.case_outcome} />
        <Section title="Learning points" body={c.learning_points} />
        <Section title="References" body={c.references_text} />

        <Text style={s.footer} fixed>
          {`${author}. "${c.title_en}". Clinical Case Library, Maytham Altaan. ${year}. ${c.doi ? "https://doi.org/" + c.doi : url}  ·  Licensed CC BY 4.0`}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderCasePdf(c: CaseRow): Promise<Buffer> {
  const author =
    c.display_author || (c.show_author ? c.submitter_name : "Anonymous contributor");
  const url = `https://maytham-altaan.com/en/cases/${c.slug}`;
  return await renderToBuffer(<CaseDoc c={c} author={author} url={url} />);
}
