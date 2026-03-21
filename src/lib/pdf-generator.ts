import type { CVStructured } from "@/types";

// Server-side PDF generation using a simple approach that produces ATS-friendly output
export async function generateATSPdf(cvData: CVStructured): Promise<Buffer> {
  // We'll build a simple but ATS-parseable PDF using PDFKit-like approach
  // For now, we'll generate a clean text-based PDF structure
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  const addText = (text: string, size: number, bold: boolean = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += size * 0.45;
    }
  };

  const addSectionHeader = (title: string) => {
    y += 4;
    addText(title.toUpperCase(), 12, true);
    doc.setDrawColor(0);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3;
  };

  // Contact Info
  const { contact } = cvData;
  addText(contact.name, 18, true);
  y += 1;

  const contactParts: string[] = [];
  if (contact.email) contactParts.push(contact.email);
  if (contact.phone) contactParts.push(contact.phone);
  if (contact.location) contactParts.push(contact.location);
  if (contactParts.length > 0) {
    addText(contactParts.join(" | "), 9);
  }

  const linkParts: string[] = [];
  if (contact.linkedin) linkParts.push(contact.linkedin);
  if (contact.website) linkParts.push(contact.website);
  if (linkParts.length > 0) {
    addText(linkParts.join(" | "), 9);
  }

  // Summary
  if (cvData.summary) {
    addSectionHeader("Professional Summary");
    addText(cvData.summary, 10);
  }

  // Experience
  if (cvData.experience.length > 0) {
    addSectionHeader("Experience");
    for (const exp of cvData.experience) {
      addText(`${exp.title} - ${exp.company}`, 10, true);
      const dateStr = `${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}`;
      const locStr = exp.location ? ` | ${exp.location}` : "";
      addText(`${dateStr}${locStr}`, 9);
      for (const bullet of exp.bullets) {
        addText(`  •  ${bullet}`, 9);
      }
      y += 2;
    }
  }

  // Education
  if (cvData.education.length > 0) {
    addSectionHeader("Education");
    for (const edu of cvData.education) {
      addText(`${edu.degree} - ${edu.institution}`, 10, true);
      const parts: string[] = [];
      if (edu.graduationDate) parts.push(edu.graduationDate);
      if (edu.location) parts.push(edu.location);
      if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
      if (parts.length > 0) addText(parts.join(" | "), 9);
      if (edu.details) {
        for (const detail of edu.details) {
          addText(`  •  ${detail}`, 9);
        }
      }
      y += 2;
    }
  }

  // Skills
  if (cvData.skills.length > 0) {
    addSectionHeader("Skills");
    addText(cvData.skills.join(", "), 10);
  }

  // Certifications
  if (cvData.certifications && cvData.certifications.length > 0) {
    addSectionHeader("Certifications");
    for (const cert of cvData.certifications) {
      addText(`•  ${cert}`, 10);
    }
  }

  // Projects
  if (cvData.projects && cvData.projects.length > 0) {
    addSectionHeader("Projects");
    for (const project of cvData.projects) {
      addText(project.name, 10, true);
      addText(project.description, 9);
      if (project.technologies && project.technologies.length > 0) {
        addText(`Technologies: ${project.technologies.join(", ")}`, 9);
      }
      y += 2;
    }
  }

  // Languages
  if (cvData.languages && cvData.languages.length > 0) {
    addSectionHeader("Languages");
    addText(cvData.languages.join(", "), 10);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
