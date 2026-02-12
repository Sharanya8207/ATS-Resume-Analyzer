pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

// Master skill database
const masterSkills = [
  "html","css","javascript","react","node","express","mongodb",
  "git","github","java","spring","hibernate","sql",
  "python","pandas","numpy","tensorflow","machine learning",
  "aws","azure","docker","kubernetes","linux",
  "rest api","api","responsive design","power bi","tableau"
];

let jdSkills = [];
let chart = null;

// Extract text from PDF
async function extractPDF(file){
  const reader = new FileReader();
  return new Promise(resolve => {
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = "";

      for(let i = 1; i <= pdf.numPages; i++){
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ");
      }
      resolve(text.toLowerCase());
    };
    reader.readAsArrayBuffer(file);
  });
}

// Extract JD from PDF
async function extractJD(){
  const file = document.getElementById("jdFile").files[0];
  if(!file){
    alert("Upload JD PDF");
    return;
  }

  const jdText = await extractPDF(file);
  processJD(jdText);
}

// Extract JD from pasted text
function useJDText(){
  const jdText = document.getElementById("jdText").value.toLowerCase();
  if(jdText.trim() === ""){
    alert("Paste Job Description");
    return;
  }
  processJD(jdText);
}

// Process JD skills
function processJD(text){
  jdSkills = masterSkills.filter(skill => text.includes(skill));

  if(jdSkills.length === 0){
    alert("No recognizable skills found in JD");
    return;
  }

  alert("JD Skills Detected:\n" + jdSkills.join(", "));
  document.getElementById("resumeSection").classList.remove("hidden");
}

// Analyze Resume BASED ON JD
async function analyzeResume(){
  const file = document.getElementById("resumeFile").files[0];
  if(!file){
    alert("Upload Resume PDF");
    return;
  }

  const resumeText = await extractPDF(file);

  let matched = jdSkills.filter(skill => resumeText.includes(skill));
  let missing = jdSkills.filter(skill => !resumeText.includes(skill));

  let atsScore = Math.round((matched.length / jdSkills.length) * 100);

  // UI updates
  document.getElementById("score").innerText = atsScore;

  document.getElementById("matched").innerHTML =
    matched.map(s => `<span>${s}</span>`).join("");

  document.getElementById("missing").innerHTML =
    missing.map(s => `<span>${s}</span>`).join("");

  document.getElementById("result").classList.remove("hidden");

  // Chart
  if(chart) chart.destroy();
  const ctx = document.getElementById("skillChart").getContext("2d");

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Matched Skills", "Missing Skills"],
      datasets: [{
        data: [matched.length, missing.length],
        backgroundColor: ["#28a745", "#dc3545"]
      }]
    },
    options: {
      responsive: true
    }
  });
}
