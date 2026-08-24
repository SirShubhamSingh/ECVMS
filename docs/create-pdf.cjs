const fs = require("fs");
const source = fs.readFileSync("docs/ECMVS-Project-Guide.md", "utf8");
const lines = source.split(/\r?\n/).flatMap((line) => {
  const clean = line.replace(/^#{1,6}\s*/, "").replace(/^[-*]\s+/, "- ").replace(/`/g, "");
  if (!clean.trim()) return [""];
  const chunks = [];
  for (let i = 0; i < clean.length; i += 92) chunks.push(clean.slice(i, i + 92));
  return chunks;
});
const pages = [];
for (let i = 0; i < lines.length; i += 48) pages.push(lines.slice(i, i + 48));
const objects = [];
const add = (value) => { objects.push(value); return objects.length; };
const catalog = add("<< /Type /Catalog /Pages 2 0 R >>");
const pageTree = add("<< /Type /Pages /Kids [PAGE_IDS] /Count PAGE_COUNT >>");
const font = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
const pageIds = [];
for (const pageLines of pages) {
  const commands = ["BT", "/F1 10 Tf", "48 748 Td", "14 TL"];
  pageLines.forEach((line, index) => {
    const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    if (index) commands.push("T*");
    commands.push(`(${escaped}) Tj`);
  });
  commands.push("ET");
  const stream = commands.join("\n");
  const streamId = add(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
  pageIds.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${streamId} 0 R >>`));
}
objects[1] = objects[1].replace("PAGE_IDS", pageIds.map((id) => `${id} 0 R`).join(" ")).replace("PAGE_COUNT", String(pageIds.length));
let pdf = "%PDF-1.4\n";
const offsets = [0];
objects.forEach((object, index) => { offsets[index + 1] = Buffer.byteLength(pdf, "binary"); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
const xref = Buffer.byteLength(pdf, "binary");
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
fs.writeFileSync("docs/ECMVS-Project-Guide.pdf", pdf, "binary");
