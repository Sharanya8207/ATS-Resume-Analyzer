// PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

// Job Role Details
const roles = {
    "Frontend Developer": {
        skills: ["html", "css", "javascript", "react", "git", "api", "responsive design"],
        roadmap: [
            "Learn HTML, CSS, JavaScript",
            "Build 3 responsive websites",
            "Learn React framework",
            "Learn Git & GitHub",
            "Build API-based project",
            "Create portfolio website"
        ]
    },

    "Java Backend Developer": {
        skills: ["java", "spring", "hibernate", "sql", "oops", "rest api"],
        roadmap: [
            "Master Core Java + OOPS",
            "Learn JDBC + SQL",
            "Learn Spring Boot",
            "Build REST APIs",
            "Learn Hibernate/JPA",
            "Build 2 backend projects"
        ]
    },

    "Full Stack Developer": {
        skills: ["html", "css", "javascript", "react", "node", "express", "mongodb", "git"],
        roadmap: [
            "Master frontend basics",
            "Learn React",
            "Learn Node.js + Express",
            "Learn MongoDB",
            "Build 2 full stack projects",
            "Deploy project on cloud"
        ]
    },

    "Security Engineer": {
        skills: ["networking", "linux", "python", "firewalls", "vulnerability testing", "siem"],
        roadmap: [
            "Learn Networking + Linux",
            "Master SIEM tools",
            "Practice penetration testing",
            "Learn Python automation",
            "Do bug bounty practice",
            "Get Security+ certification"
        ]
    },

    "Cloud Engineer": {
        skills: ["aws", "azure", "docker", "kubernetes", "linux", "terraform", "devops"],
        roadmap: [
            "Learn Linux & Networking",
            "Learn AWS / Azure basics",
            "Learn Docker & Kubernetes",
            "Learn Terraform",
            "Build CI/CD pipelines",
            "Get Cloud Practitioner certification"
        ]
    },

    "AI Engineer": {
        skills: ["python", "numpy", "pandas", "tensorflow", "deep learning", "llm"],
        roadmap: [
            "Master Python",
            "Learn NumPy & Pandas",
            "Study ML algorithms",
            "Learn TensorFlow/PyTorch",
            "Build neural network projects",
            "Learn LLMs"
        ]
    },

    "Machine Learning Engineer": {
        skills: ["python", "pandas", "numpy", "sklearn", "ml algorithms", "data preprocessing"],
        roadmap: [
            "Master Python",
            "Learn data preprocessing",
            "Study ML algorithms",
            "Build ML models using sklearn",
            "Learn hyperparameter tuning",
            "Deploy ML models"
        ]
    },

    "Data Analyst": {
        skills: ["excel", "python", "sql", "tableau", "power bi", "statistics"],
        roadmap: [
            "Learn Excel (Pivot, Lookup)",
            "Learn SQL queries",
            "Learn Python (Pandas, NumPy)",
            "Learn Data Visualization",
            "Build dashboards",
            "Make 3 analysis projects"
        ]
    }
};

// Display Role Cards
let roleContainer = document.getElementById("roles");
for (let role in roles) {
    roleContainer.innerHTML += `<div class='role-card' onclick="selectRole('${role}')">${role}</div>`;
}

let selectedRole = "";
let chart = null;

function selectRole(role) {
    selectedRole = role;
    document.getElementById("roleTitle").innerText = "Selected Role: " + role;
    document.getElementById("uploadSection").classList.remove("hidden");
}

// Extract PDF Text
async function extractPDF(file) {
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onload = async () => {
            const typedArray = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;

            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                let page = await pdf.getPage(i);
                let content = await page.getTextContent();
                let strings = content.items.map((item) => item.str).join(" ");
                text += strings + " ";
            }
            resolve(text.toLowerCase());
        };
        reader.readAsArrayBuffer(file);
    });
}

// Analyze Resume
async function analyzeResume() {
    if (!selectedRole) {
        alert("Select a role first!");
        return;
    }

    const file = document.getElementById("resumeFile").files[0];
    if (!file) {
        alert("Upload a PDF resume!");
        return;
    }

    let text = await extractPDF(file);
    let roleSkills = roles[selectedRole].skills;

    let matched = roleSkills.filter(skill => text.includes(skill));
    let missing = roleSkills.filter(skill => !text.includes(skill));

    let score = Math.round((matched.length / roleSkills.length) * 100);

    document.getElementById("score").innerText = score;
    document.getElementById("matched").innerText = matched.join(", ");
    document.getElementById("missing").innerText = missing.join(", ");

    // Roadmap
    let roadmapUI = document.getElementById("roadmap");
    roadmapUI.innerHTML = "";
    roles[selectedRole].roadmap.forEach(step => {
        roadmapUI.innerHTML += `<li>${step}</li>`;
    });

    document.getElementById("result").classList.remove("hidden");

    // PIE CHART
    if (chart) chart.destroy();

    let ctx = document.getElementById("skillChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Matched Skills", "Missing Skills"],
            datasets: [{
                data: [matched.length, missing.length]
            }]
        },
        options: {
            responsive: true
        }
    });
}
