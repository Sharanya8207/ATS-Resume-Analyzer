pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

// Predefined Roles & Skills
const roles = {
  "Frontend Developer": {
    skills: ["html","css","javascript","react","git","api","responsive design"],
    roadmap: ["Learn HTML/CSS/JS","Build 3 responsive websites","Learn React","Learn Git/GitHub","Build API project","Portfolio website"]
  },
  "Java Backend Developer": {
    skills: ["java","spring","hibernate","sql","oops","rest api"],
    roadmap: ["Master Java","Learn JDBC+SQL","Learn Spring Boot","Build REST APIs","Learn Hibernate/JPA","2 backend projects"]
  },
  "Full Stack Developer": {
    skills: ["html","css","javascript","react","node","express","mongodb","git"],
    roadmap: ["Frontend basics","Learn React","Learn Node/Express","Learn MongoDB","2 full stack projects","Deploy project"]
  }
};

// Master skill list for JD extraction
const masterSkills = ["html","css","javascript","react","node","express","mongodb","git","java","spring","hibernate","sql","python","tensorflow","pandas","numpy","excel","tableau","aws","azure","docker","kubernetes","terraform","rest api","api","responsive design","linux","networking","ml algorithms","deep learning","siem","power bi"];

let jdSkills = [];
let selectedRole = "";
let chart = null;

// Display role cards
const roleContainer = document.getElementById("roles");
for (let role in roles){
  roleContainer.innerHTML += `<div class='role-card' onclick="selectRole('${role}')">${role}</div>`;
}

function selectRole(role){
  selectedRole = role;
  document.getElementById("roleTitle").innerText = "Selected Role: "+role;
  document.getElementById("uploadSection").classList.remove("hidden");
}

// Extract PDF text
async function extractPDF(file){
  const reader = new FileReader();
  return new Promise(resolve=>{
    reader.onload = async ()=>{
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text="";
      for (let i=1;i<=pdf.numPages;i++){
        let page = await pdf.getPage(i);
        let content = await page.getTextContent();
        let strings = content.items.map(item=>item.str).join(" ");
        text+=strings+" ";
      }
      resolve(text.toLowerCase());
    };
    reader.readAsArrayBuffer(file);
  });
}

// Extract skills from JD PDF
async function extractJD(){
  const file = document.getElementById("jdFile").files[0];
  if(!file){ alert("Upload JD PDF!"); return; }
  const text = await extractPDF(file);
  jdSkills = masterSkills.filter(skill=>text.includes(skill));
  alert("JD Skills extracted: "+jdSkills.join(", "));
  document.getElementById("uploadSection").classList.remove("hidden");
}

// Use pasted JD
function useJDText(){
  const text = document.getElementById("jdText").value.toLowerCase();
  jdSkills = masterSkills.filter(skill=>text.includes(skill));
  alert("JD Skills extracted: "+jdSkills.join(", "));
  document.getElementById("uploadSection").classList.remove("hidden");
}

// Analyze Resume
async function analyzeResume(){
  const file = document.getElementById("resumeFile").files[0];
  if(!file){ alert("Upload a resume!"); return; }

  const text = await extractPDF(file);

  let skillsToCompare = jdSkills.length ? jdSkills : (selectedRole ? roles[selectedRole].skills : []);
  if(!skillsToCompare.length){ alert("Select a role or upload JD first!"); return; }

  let matched = skillsToCompare.filter(skill=>text.includes(skill));
  let missing = skillsToCompare.filter(skill=>!text.includes(skill));
  let score = Math.round((matched.length/skillsToCompare.length)*100);

  document.getElementById("score").innerText = score;

  // Highlight matched/missing
  document.getElementById("matched").innerHTML = matched.map(s=>`<span>${s}</span>`).join(" ");
  document.getElementById("missing").innerHTML = missing.map(s=>`<span>${s}</span>`).join(" ");

  // Show roadmap
  const roadmapUI = document.getElementById("roadmap");
  roadmapUI.innerHTML = "";
  if(selectedRole && roles[selectedRole].roadmap){
    roles[selectedRole].roadmap.forEach(step=>{
      roadmapUI.innerHTML += `<li>${step}</li>`;
    });
  }

  document.getElementById("result").classList.remove("hidden");

  // Pie chart
  if(chart) chart.destroy();
  const ctx = document.getElementById("skillChart").getContext("2d");
  chart = new Chart(ctx,{
    type:"pie",
    data:{
      labels:["Matched Skills","Missing Skills"],
      datasets:[{
        data:[matched.length,missing.length],
        backgroundColor:["#28a745","#dc3545"]
      }]
    },
    options:{responsive:true}
  });
}

// Export report as PDF
function exportReport(){
  const element = document.getElementById("result");
  html2pdf().from(element).save("ATS_Report.pdf");
}
