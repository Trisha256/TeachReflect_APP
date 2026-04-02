  
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import type { Lesson, Student } from '../types';
import { analyseLessons, formatDate } from './helpers';

// ─── Palette ───────────────────────────────────────────────────────────────────
const PRIMARY = [37, 99, 235] as const;   // blue-600
const GREEN   = [22, 163, 74] as const;   // green-600
const AMBER   = [217, 119, 6] as const;   // amber-600
const RED     = [220, 38, 38] as const;   // red-600
const GRAY    = [107, 114, 128] as const; // gray-500
const LIGHT   = [249, 250, 251] as const; // gray-50
const BORDER  = [229, 231, 235] as const; // gray-200

type RGB = readonly [number, number, number];

const scoreColor = (score: number): RGB =>
  score >= 75 ? GREEN : score >= 50 ? AMBER : RED;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const addPageNumber = (doc: jsPDF): void => {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(
      `Page ${i} of ${pages}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }
};

const sectionTitle = (doc: jsPDF, y: number, text: string): number => {
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 8, 1, 1, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text(text, 18, y + 5.5);
  return y + 12;
};

const kpiRow = (
  doc: jsPDF,
  y: number,
  items: { label: string; value: string; color?: RGB }[]
): number => {
  const pageW = doc.internal.pageSize.getWidth();
  const colW = (pageW - 28) / items.length;
  items.forEach(({ label, value, color }, i) => {
    const x = 14 + i * colW;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(x, y, colW - 3, 16, 1.5, 1.5, 'FD');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(color ?? PRIMARY));
    doc.text(value, x + colW / 2 - 1.5, y + 10, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(label, x + colW / 2 - 1.5, y + 14.5, { align: 'center' });
  });
  return y + 20;
};

// ─── Main export function ──────────────────────────────────────────────────────

export const exportReportPDF = (
  lessons: Lesson[],
  students: Student[],
  teacherName?: string
): void => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const today = formatDate(new Date().toISOString().split('T')[0]);

  // ── Cover header ────────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 38, 'F');

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TeachReflect', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Teaching Practice Report', 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254); // blue-200
  const subtitle = teacherName
    ? `${teacherName}  ·  Generated ${today}`
    : `Generated ${today}`;
  doc.text(subtitle, 14, 29);

  let y = 46;

  // ── Summary KPIs ───────────────────────────────────────────────────────────
  const completedLessons = lessons.filter((l) => l.status === 'completed');
  const analysed = completedLessons.map((l) => analyseLessons(l));
  const avgScore =
    analysed.length > 0
      ? Math.round(
          analysed.reduce((s, a) => s + a.effectiveness_score, 0) / analysed.length
        )
      : 0;
  const ealCount = students.filter((s) => Boolean(s.eal_level)).length;
  const senCount = students.filter((s) => s.sen_needs.length > 0).length;

  y = sectionTitle(doc, y, 'Summary');
  y = kpiRow(doc, y, [
    { label: 'Total Lessons', value: String(lessons.length) },
    { label: 'Completed', value: String(completedLessons.length), color: GREEN },
    {
      label: 'Avg Effectiveness',
      value: avgScore > 0 ? `${avgScore}%` : '—',
      color: scoreColor(avgScore),
    },
    { label: 'Students', value: String(students.length), color: GRAY },
    { label: 'EAL', value: String(ealCount), color: AMBER },
    { label: 'SEN', value: String(senCount), color: [139, 92, 246] as const },
  ]);

  // ── Lesson table ───────────────────────────────────────────────────────────
  y = sectionTitle(doc, y + 2, 'Completed Lessons');

  if (completedLessons.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text('No completed lessons to display.', 18, y + 5);
    y += 12;
  } else {
    const rows = completedLessons
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((l) => {
        const a = analyseLessons(l);
        return [
          l.title || 'Untitled',
          l.subject || '—',
          l.year_group || '—',
          formatDate(l.date),
          `${a.effectiveness_score}%`,
          a.engagement_level,
          l.reflection.objectives_met === true
            ? 'Yes'
            : l.reflection.objectives_met === false
            ? 'No'
            : 'Partial',
        ];
      });

    autoTable(doc, {
      startY: y,
      head: [['Title', 'Subject', 'Year', 'Date', 'Score', 'Engagement', 'Obj. Met']],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: {
        fillColor: [...PRIMARY],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 52 },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const raw = String(data.cell.raw).replace('%', '');
          const score = parseInt(raw, 10);
          if (!isNaN(score)) {
            data.cell.styles.textColor = [...scoreColor(score)];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // ── EAL / SEN section ───────────────────────────────────────────────────────
  if (y > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    y = 14;
  }

  y = sectionTitle(doc, y, 'EAL & SEN Support');

  const lessonsWithEAL = lessons.filter(
    (l) => l.differentiation.eal.strategies_used.length > 0
  ).length;
  const lessonsWithSEN = lessons.filter(
    (l) => l.differentiation.sen.accommodations_used.length > 0
  ).length;

  const ealSenRows: string[][] = [
    ['EAL students supported', String(ealCount)],
    ['SEN students supported', String(senCount)],
    ['Lessons with EAL strategies', String(lessonsWithEAL)],
    ['Lessons with SEN accommodations', String(lessonsWithSEN)],
  ];

  autoTable(doc, {
    startY: y,
    body: ealSenRows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 90, fontStyle: 'bold', textColor: [55, 65, 81] },
      1: { halign: 'center', textColor: [...PRIMARY], fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── Top EAL strategies ──────────────────────────────────────────────────────
  const strategyCount: Record<string, number> = {};
  lessons.forEach((l) => {
    l.differentiation.eal.strategies_used.forEach((s) => {
      strategyCount[s] = (strategyCount[s] ?? 0) + 1;
    });
  });
  const topStrategies = Object.entries(strategyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (topStrategies.length > 0) {
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 14;
    }
    y = sectionTitle(doc, y, 'Top EAL Strategies Used');
    autoTable(doc, {
      startY: y,
      head: [['Strategy', 'Times Used']],
      body: topStrategies.map(([s, c]) => [s, String(c)]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: {
        fillColor: [...AMBER],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      columnStyles: { 1: { halign: 'center' } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // ── Student list ────────────────────────────────────────────────────────────
  if (students.length > 0) {
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 14;
    }
    y = sectionTitle(
      doc,
      y,
      students.length > 30
        ? `Student Overview (showing 30 of ${students.length})`
        : 'Student Overview'
    );
    const studentRows = students.slice(0, 30).map((s) => [
      s.name,
      s.year_group || '—',
      s.class_name || '—',
      s.eal_level ? s.eal_level.replace(/_/g, ' ') : 'N/A',
      s.sen_needs.length > 0 ? 'Yes' : 'No',
      s.is_gifted ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Name', 'Year', 'Class', 'EAL Level', 'SEN', 'Gifted']],
      body: studentRows,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [250, 245, 255] },
      columnStyles: {
        4: { halign: 'center' },
        5: { halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Page numbers ────────────────────────────────────────────────────────────
  addPageNumber(doc);

  // ── Save ────────────────────────────────────────────────────────────────────
  const filename = `teachreflect-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
