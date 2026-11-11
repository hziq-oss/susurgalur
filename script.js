// Data Awal Contoh (Mock Data)
let familyMembers = JSON.parse(localStorage.getItem('familyMembers')) || [
    {
        id: "1",
        name: "Hasan Bin Abdullah",
        gender: "Lelaki",
        gen: 1,
        parentId: "",
        maritalStatus: "Kahwin",
        spouseName: "Siti Aminah Binti Yusuf",
        spouseStatus: "active"
    },
    {
        id: "2",
        name: "Ahmad Bin Hasan",
        gender: "Lelaki",
        gen: 2,
        parentId: "1",
        maritalStatus: "Kahwin",
        spouseName: "Fatima Zahra",
        spouseStatus: "active"
    },
    {
        id: "3",
        name: "Zainab Binti Hasan",
        gender: "Perempuan",
        gen: 2,
        parentId: "1",
        maritalStatus: "Bujang",
        spouseName: "",
        spouseStatus: "active"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    renderTree();
    updateParentDropdown();
});

// Paparkan Salasilah ke Skrin
function renderTree(filterText = "") {
    const container = document.getElementById("treeContainer");
    container.innerHTML = "";

    // Kumpul mengikut Generasi
    let generations = {};
    familyMembers.forEach(member => {
        if (!generations[member.gen]) {
            generations[member.gen] = [];
        }
        generations[member.gen].push(member);
    });

    // Susun mengikut Gen (1, 2, 3...)
    const sortedGens = Object.keys(generations).sort((a, b) => a - b);

    if (sortedGens.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted);">Tiada rekod ahli keluarga. Sila klik "Tambah Ahli Keluarga".</p>`;
        document.getElementById("totalMembers").innerText = 0;
        return;
    }

    let totalCount = 0;

    sortedGens.forEach(gen => {
        const genRow = document.createElement("div");
        genRow.className = "gen-row";

        const genLabel = document.createElement("div");
        genLabel.className = "gen-label";
        genLabel.innerText = `Generasi ${gen}`;
        genRow.appendChild(genLabel);

        const nodesWrapper = document.createElement("div");
        nodesWrapper.className = "nodes-wrapper";

        generations[gen].forEach(member => {
            // Tapis carian jika ada
            if (filterText && !member.name.toLowerCase().includes(filterText.toLowerCase())) {
                return;
            }
            totalCount++;

            const unitDiv = document.createElement("div");
            unitDiv.className = "family-unit";

            // Kad Individu Utama
            const mainCard = document.createElement("div");
            mainCard.className = `person-card ${member.gender === 'Perempuan' ? 'female' : 'male'}`;
            mainCard.innerHTML = `
                <div class="person-avatar">
                    <i class="fa-solid ${member.gender === 'Perempuan' ? 'fa-venus' : 'fa-mars'}"></i>
                </div>
                <div class="person-name">${member.name}</div>
                <div class="person-status">Gen ${member.gen}</div>
            `;
            unitDiv.appendChild(mainCard);

            // Jika ada Pasangan (Berkahwin / Pernah Kahwin di sebelah kanan)
            if (member.maritalStatus !== "Bujang" && member.spouseName) {
                const divider = document.createElement("div");
                divider.className = "spouse-divider";
                divider.innerHTML = `
                    <i class="fa-solid fa-ring"></i>
                    <span>${member.spouseStatus === 'divorced' ? 'Cerai' : 'Kahwin'}</span>
                `;
                unitDiv.appendChild(divider);

                const spouseCard = document.createElement("div");
                spouseCard.className = `person-card ${member.gender === 'Perempuan' ? 'male' : 'female'}`;
                spouseCard.innerHTML = `
                    <div class="person-avatar">
                        <i class="fa-solid ${member.gender === 'Perempuan' ? 'fa-mars' : 'fa-venus'}"></i>
                    </div>
                    <div class="person-name">${member.spouseName}</div>
                    <div class="person-status">${member.spouseStatus === 'divorced' ? 'Bekas Pasangan' : 'Pasangan'}</div>
                `;
                unitDiv.appendChild(spouseCard);
            }

            // Butang Tindakan (Edit / Padam)
            const actions = document.createElement("div");
            actions.className = "node-actions";
            actions.innerHTML = `
                <button onclick="editMember('${member.id}')" title="Sunting"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteMember('${member.id}')" title="Padam"><i class="fa-solid fa-trash"></i></button>
            `;
            unitDiv.appendChild(actions);

            nodesWrapper.appendChild(unitDiv);
        });

        genRow.appendChild(nodesWrapper);
        container.appendChild(genRow);
    });

    document.getElementById("totalMembers").innerText = totalCount;
}

// Kawalan Modal
function openAddModal() {
    document.getElementById("modalTitle").innerText = "Tambah Ahli Keluarga Baru";
    document.getElementById("memberForm").reset();
    document.getElementById("memberId").value = "";
    document.getElementById("spouseContainer").style.display = "none";
    updateParentDropdown();
    document.getElementById("memberModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("memberModal").style.display = "none";
}

function toggleSpouseFields() {
    const status = document.getElementById("maritalStatus").value;
    const spouseContainer = document.getElementById("spouseContainer");
    if (status === "Bujang") {
        spouseContainer.style.display = "none";
    } else {
        spouseContainer.style.display = "block";
    }
}

// Simpan Data
function saveMember(event) {
    event.preventDefault();
    const id = document.getElementById("memberId").value;
    const name = document.getElementById("memberName").value;
    const gender = document.getElementById("memberGender").value;
    const gen = parseInt(document.getElementById("memberGen").value);
    const parentId = document.getElementById("parentSelect").value;
    const maritalStatus = document.getElementById("maritalStatus").value;
    const spouseName = document.getElementById("spouseName").value;
    const spouseStatus = document.getElementById("spouseActiveStatus").value;

    if (id) {
        // Kemaskini Ahli Sedia Ada
        familyMembers = familyMembers.map(m => {
            if (m.id === id) {
                return { ...m, name, gender, gen, parentId, maritalStatus, spouseName, spouseStatus };
            }
            return m;
        });
    } else {
        // Tambah Ahli Baru
        const newMember = {
            id: Date.now().toString(),
            name,
            gender,
            gen,
            parentId,
            maritalStatus,
            spouseName,
            spouseStatus
        };
        familyMembers.push(newMember);
    }

    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
    closeModal();
    renderTree();
    updateParentDropdown();
}

// Sunting Rekod (Sudah dibetulkan)
function editMember(id) {
    const member = familyMembers.find(m => m.id === id);
    if (!member) return;

    document.getElementById("modalTitle").innerText = "Sunting Maklumat Ahli";
    document.getElementById("memberId").value = member.id;
    document.getElementById("memberName").value = member.name;
    document.getElementById("memberGender").value = member.gender;
    document.getElementById("memberGen").value = member.gen;
    document.getElementById("maritalStatus").value = member.maritalStatus;
    document.getElementById("spouseName").value = member.spouseName || "";
    document.getElementById("spouseActiveStatus").value = member.spouseStatus || "active";
    
    toggleSpouseFields();
    updateParentDropdown();
    document.getElementById("parentSelect").value = member.parentId || "";

    // Paparkan modal dengan betul
    document.getElementById("memberModal").style.display = "flex";
}

// Padam Rekod
function deleteMember(id) {
    if (confirm("Adakah anda pasti mahu memadam ahli keluarga ini?")) {
        familyMembers = familyMembers.filter(m => m.id !== id);
        localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
        renderTree();
        updateParentDropdown();
    }
}

// Kemaskini Senarai Ibu Bapa di Dropdown
function updateParentDropdown() {
    const select = document.getElementById("parentSelect");
    select.innerHTML = `<option value="">-- Tiada (Generasi Pertama) --</option>`;
    familyMembers.forEach(m => {
        const option = document.createElement("option");
        option.value = m.id;
        option.innerText = `${m.name} (Gen ${m.gen})`;
        select.appendChild(option);
    });
}

// Fungsi Carian
function filterMembers() {
    const query = document.getElementById("searchInput").value;
    renderTree(query);
}

// Set Semula Data
function resetData() {
    if (confirm("Semua data akan dikembalikan kepada asal. Teruskan?")) {
        localStorage.removeItem('familyMembers');
        location.reload();
    }
}

// Eksport Data ke JSON
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(familyMembers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "salasilah_keluarga.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
