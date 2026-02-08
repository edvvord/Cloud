async function upload() {
    const skinFile = document.getElementById("skin").files[0];
    const capeFile = document.getElementById("cape").files[0];
    
    if (!skinFile && !capeFile) return alert("Выбери PNG скин или плащ");
    
    const outDiv = document.getElementById("out");
    outDiv.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
    
    const form = new FormData();
    if (skinFile) form.append("skin", skinFile);
    if (capeFile) form.append("cape", capeFile);
    
    const res = await fetch("/api/upload", {
        method: "POST",
        body: form
    });
    
    if (!res.ok) {
        const text = await res.text();
        console.error(text);
        outDiv.innerHTML = '';
        return alert("Ошибка загрузки");
    }
    
    const json = await res.json();
    displayResults(json);
}

function displayResults(data) {
    const outDiv = document.getElementById("out");
    outDiv.innerHTML = "";
    
    if (data.skin) {
        outDiv.appendChild(createTextureBlock("Скин", data.skin));
    }
    if (data.cape) {
        outDiv.appendChild(createTextureBlock("Плащ", data.cape));
    }
}

function createTextureBlock(title, texture) {
    const block = document.createElement("div");
    block.className = "texture-block";
    
    const heading = document.createElement("h3");
    heading.textContent = title;
    block.appendChild(heading);
    
    // URL секция
    const urlSection = document.createElement("div");
    urlSection.className = "url-section";
    
    const urlLabel = document.createElement("label");
    urlLabel.textContent = "URL текстуры:";
    urlSection.appendChild(urlLabel);
    
    const urlWrapper = document.createElement("div");
    urlWrapper.className = "url-input-wrapper";
    
    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.value = texture.url;
    urlInput.readOnly = true;
    
    const urlCopyBtn = document.createElement("button");
    urlCopyBtn.textContent = "Копировать";
    urlCopyBtn.onclick = () => copyToClipboard(texture.url, urlCopyBtn);
    
    urlWrapper.appendChild(urlInput);
    urlWrapper.appendChild(urlCopyBtn);
    urlSection.appendChild(urlWrapper);
    block.appendChild(urlSection);
    
    // Dropdown секция с деталями
    const detailsSection = document.createElement("div");
    detailsSection.className = "details-section";
    
    const detailsHeader = document.createElement("div");
    detailsHeader.className = "details-header";
    detailsHeader.innerHTML = `Подробности <span class="arrow">▼</span>`;
    
    const detailsContent = document.createElement("div");
    detailsContent.className = "details-content";
    
    // Value
    const valueItem = createDetailItem("Value", texture.value);
    detailsContent.appendChild(valueItem);
    
    // Signature
    const sigItem = createDetailItem("Signature", texture.signature);
    detailsContent.appendChild(sigItem);
    
    detailsHeader.onclick = () => {
        detailsContent.classList.toggle("open");
        detailsHeader.querySelector(".arrow").classList.toggle("open");
    };
    
    detailsSection.appendChild(detailsHeader);
    detailsSection.appendChild(detailsContent);
    block.appendChild(detailsSection);
    
    return block;
}

function createDetailItem(label, value) {
    const item = document.createElement("div");
    item.className = "detail-item";
    
    const labelEl = document.createElement("label");
    labelEl.textContent = label + ":";
    item.appendChild(labelEl);
    
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.readOnly = true;
    item.appendChild(input);
    
    const copyBtn = document.createElement("button");
    copyBtn.className = "detail-copy-btn";
    copyBtn.textContent = "Копировать";
    copyBtn.onclick = () => copyToClipboard(value, copyBtn);
    item.appendChild(copyBtn);
    
    return item;
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = "✓ Скопировано!";
        button.style.backgroundColor = "#45a049";
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = "";
        }, 2000);
    });
}
