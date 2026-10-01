import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

interface Metric {
    title: string;
    value: string;
}

interface PDFData {
    image: string;
    faceShape: string;
    symmetry: string;
    metrics: Metric[];
    style: string;
}

export const generatePDF = async (data: PDFData) => {
    const base64 = await imageToBase64(data.image);

    const html = `
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{
font-family:Arial,Helvetica,sans-serif;
background:#070708;
color:#FFFFFF;
padding:25px;
margin:0;
}
.header{
text-align:center;
color:#F59E0B;
font-size:28px;
font-weight:bold;
margin-bottom:8px;
}
.sub{
text-align:center;
color:#9E9EA7;
margin-bottom:25px;
font-size:14px;
}
.image{
width:260px;
height:320px;
object-fit:cover;
border-radius:20px;
display:block;
margin:auto;
border:1px solid #27282C;
}
.card{
background:#17181A;
padding:15px;
margin-top:20px;
border-radius:15px;
border:1px solid #27282C;
}
.title{
color:#F59E0B;
font-size:18px;
font-weight:bold;
margin-bottom:10px;
}
.row{
padding:11px;
background:#0D0D0E;
margin-top:8px;
border-radius:8px;
border:1px solid #27282C;
}
.label{
color:#9E9EA7;
}
.value{
color:#F59E0B;
font-weight:bold;
}
h2{
color:#FFFFFF;
font-size:20px;
margin-top:5px;
}
p{
color:#9E9EA7;
font-size:14px;
line-height:20px;
}
.footer{
text-align:center;
color:#71717A;
font-size:11px;
margin-top:25px;
}
</style>
</head>
<body>

<div class="header">
KSHURAK AI GEOMETRY REPORT
</div>

<div class="sub">
Personal Face Analysis
</div>

<img
class="image"
src="data:image/jpeg;base64,${base64}"
/>

<div class="card">

<div class="title">
FACE PROFILE
</div>

<div class="row">
<span class="label">
Face Shape:
</span>
<span class="value">
${data.faceShape}
</span>
</div>

<div class="row">
<span class="label">
Symmetry:
</span>
<span class="value">
${data.symmetry}
</span>
</div>

</div>

<div class="card">

<div class="title">
FACIAL METRICS
</div>

${data.metrics.map(
        item => `
<div class="row">
<span class="label">
${item.title}
</span>
<span class="value">
${item.value}
</span>
</div>
`
    ).join("")}

</div>

<div class="card">

<div class="title">
AI STYLE RECOMMENDATION
</div>

<h2>
${data.style}
</h2>

<p>
Generated using Kshurak AI face geometry analysis.
</p>

</div>

<div class="footer">
KSHURAK • AI POWERED HAIR & STYLE ANALYSIS
</div>

</body>
</html>
`;

    const file = await Print.printToFileAsync({
        html: html
    });

    await Sharing.shareAsync(file.uri);
};

const imageToBase64 = async (uri: string) => {
    const base64 = await FileSystem.readAsStringAsync(
        uri,
        {
            encoding: FileSystem.EncodingType.Base64
        }
    );

    return base64;
};