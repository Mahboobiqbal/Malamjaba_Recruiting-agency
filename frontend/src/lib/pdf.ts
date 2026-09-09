import html2pdf from "html2pdf.js";

const PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #000; background: #fff; }
  .print-document { padding: 40px; position: relative; }
  .print-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 72px; font-weight: 800; color: rgba(0,0,0,0.03); text-transform: uppercase; letter-spacing: 8px; pointer-events: none; white-space: nowrap; }
  .print-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid hsl(25, 30%, 45%); padding-bottom: 16px; margin-bottom: 24px; }
  .print-logo { display: flex; align-items: center; gap: 12px; }
  .print-logo-icon { width: 48px; height: 48px; background: hsl(25, 30%, 45%); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .print-logo-text h1 { font-size: 20px; font-weight: 700; color: hsl(25, 30%, 15%); margin: 0; }
  .print-logo-text p { font-size: 11px; font-weight: 500; color: hsl(25, 20%, 45%); text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
  .print-title { text-align: right; }
  .print-title h2 { font-size: 18px; font-weight: 700; color: hsl(25, 30%, 15%); margin: 0; }
  .print-title p { font-size: 12px; color: hsl(25, 20%, 45%); margin: 2px 0 0; }
  .print-section { margin-bottom: 20px; }
  .print-section-title { font-size: 13px; font-weight: 600; color: hsl(25, 30%, 45%); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
  .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
  .print-field { display: flex; flex-direction: column; }
  .print-field-label { font-size: 11px; font-weight: 500; color: hsl(25, 20%, 50%); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
  .print-field-value { font-size: 14px; font-weight: 500; color: hsl(25, 40%, 15%); }
  .print-field-value.large { font-size: 18px; font-weight: 700; }
  .print-status { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .print-status.active, .print-status.approved, .print-status.paid { background: #dcfce7; color: #166534; }
  .print-status.pending, .print-status.partial { background: #fef3c7; color: #92400e; }
  .print-status.expired, .print-status.cancelled, .print-status.unpaid { background: #fee2e2; color: #991b1b; }
  .print-divider { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  .print-footer { margin-top: 32px; border-top: 2px solid hsl(25, 30%, 45%); padding-top: 16px; }
  .print-signature { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
  .print-signature-line { text-align: center; }
  .print-signature-line .line { width: 180px; border-top: 1px solid #000; margin-bottom: 6px; }
  .print-signature-line p { font-size: 12px; color: #666; margin: 0; }
`;

export async function downloadPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const cloned = element.cloneNode(true) as HTMLElement;
  cloned.style.position = "static";
  cloned.style.left = "0";
  cloned.style.display = "block";

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<style>${PRINT_CSS}</style>`;
  wrapper.appendChild(cloned);

  const opt = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  };

  await html2pdf().set(opt).from(wrapper).save();
}

export function printDocument(elementId: string) {
  const content = document.getElementById(elementId)?.innerHTML;
  if (!content) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print</title>
      <style>${PRINT_CSS}</style>
    </head>
    <body>${content}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
}
