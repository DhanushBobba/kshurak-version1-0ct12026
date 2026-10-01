import { convertImageToBase64 } from "./imageConverter";

interface Metric {
  title: string;
  value: string;
}

interface PDFData {
  image?: string;
  faceShape: string;
  symmetry: string;
  metrics: Metric[];
  style: string;
}

export const generatePDF = async (data: PDFData) => {
  let base64 = "";
  if (data.image) {
    try {
      base64 = await convertImageToBase64(data.image);
    } catch (err) {
      console.warn("Could not convert image for PDF", err);
    }
  }

  const imageSrc = base64 ? `data:image/jpeg;base64,${base64}` : data.image || "";

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kshurak AI Geometry Report</title>
<style>
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
body {
  font-family: Arial, Helvetica, sans-serif;
  background: #070708;
  color: #FFFFFF;
  padding: 30px;
  margin: 0;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  text-align: center;
  color: #F59E0B;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.sub {
  text-align: center;
  color: #9E9EA7;
  margin-bottom: 25px;
  font-size: 14px;
}
.image {
  width: 240px;
  height: 280px;
  object-fit: cover;
  border-radius: 16px;
  display: block;
  margin: 0 auto 20px;
  border: 2px solid #F59E0B;
}
.card {
  background: #17181A;
  padding: 18px;
  margin-top: 18px;
  border-radius: 14px;
  border: 1px solid #27282C;
}
.title {
  color: #F59E0B;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: #0D0D0E;
  margin-top: 8px;
  border-radius: 8px;
  border: 1px solid #27282C;
}
.label {
  color: #9E9EA7;
  font-size: 13px;
}
.value {
  color: #F59E0B;
  font-weight: bold;
  font-size: 13px;
}
h2 {
  color: #FFFFFF;
  font-size: 20px;
  margin: 0 0 6px;
}
p {
  color: #9E9EA7;
  font-size: 14px;
  line-height: 20px;
  margin: 0;
}
.footer {
  text-align: center;
  color: #71717A;
  font-size: 11px;
  margin-top: 30px;
  letter-spacing: 1px;
}
</style>
</head>
<body>

<div class="header">KSHURAK AI GEOMETRY REPORT</div>
<div class="sub">Personal Face & Style Analysis</div>

${imageSrc ? `<img class="image" src="${imageSrc}" alt="Analyzed Face" />` : ""}

<div class="card">
  <div class="title">FACE PROFILE</div>
  <div class="row">
    <span class="label">Face Shape:</span>
    <span class="value">${data.faceShape}</span>
  </div>
  <div class="row">
    <span class="label">Symmetry Score:</span>
    <span class="value">${data.symmetry}</span>
  </div>
</div>

<div class="card">
  <div class="title">FACIAL METRICS</div>
  ${data.metrics
    .map(
      (item) => `
    <div class="row">
      <span class="label">${item.title}</span>
      <span class="value">${item.value}</span>
    </div>
  `
    )
    .join("")}
</div>

<div class="card">
  <div class="title">AI STYLE RECOMMENDATION</div>
  <h2>${data.style}</h2>
  <p>Generated using Kshurak AI facial geometry and precision proportion analysis.</p>
</div>

<div class="footer">
  KSHURAK • AI POWERED HAIR & STYLE ANALYSIS PLATFORM
</div>

<script>
  window.onload = function() {
    window.print();
  };
</script>

</body>
</html>
`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback if popup blocked
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kshurak-geometry-report-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
