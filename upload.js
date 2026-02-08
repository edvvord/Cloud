async function upload() {
    const skinFile = document.getElementById("skin").files[0];
    const capeFile = document.getElementById("cape").files[0];
    
    if (!skinFile && !capeFile) return alert("Select PNG skin or cape");
    
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
        return alert("Upload failed");
    }
    const json = await res.json();
    displayResults(json);
}

function displayResults(data) {
    const outDiv = document.getElementById("out");
    outDiv.innerHTML = "";
    
    if (data.skin) {
        outDiv.appendChild(createTextureBlock("Skin", data.skin));
    }
    if (data.cape) {
        outDiv.appendChild(createTextureBlock("Cape", data.cape));
    }
}

function createTextureBlock(title, texture) {
    const block = document.createElement("div");
    block.className = "texture-block";
    
    const heading = document.createElement("h3");
    heading.textContent = title;
    block.appendChild(heading);
    
    // Value
    const valueLabel = document.createElement("p");
    valueLabel.innerHTML = "<strong>Value:</strong>";
    block.appendChild(valueLabel);
    
    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.value = texture.value;
    valueInput.readOnly = true;
    valueInput.style.width = "100%";
    valueInput.style.marginBottom = "10px";
    block.appendChild(valueInput);
    
    const valueCopyBtn = document.createElement("button");
    valueCopyBtn.className = "copy-btn";
    valueCopyBtn.textContent = "Copy Value";
    valueCopyBtn.onclick = () => copyToClipboard(texture.value, valueCopyBtn);
    block.appendChild(valueCopyBtn);
    
    // Signature
    const sigLabel = document.createElement("p");
    sigLabel.innerHTML = "<strong style='margin-top: 15px; display: block;'>Signature:</strong>";
    block.appendChild(sigLabel);
    
    const sigInput = document.createElement("input");
    sigInput.type = "text";
    sigInput.value = texture.signature;
    sigInput.readOnly = true;
    sigInput.style.width = "100%";
    sigInput.style.marginBottom = "10px";
    block.appendChild(sigInput);
    
    const sigCopyBtn = document.createElement("button");
    sigCopyBtn.className = "copy-btn";
    sigCopyBtn.textContent = "Copy Signature";
    sigCopyBtn.onclick = () => copyToClipboard(texture.signature, sigCopyBtn);
    block.appendChild(sigCopyBtn);
    
    return block;
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = "✓ Copied!";
        button.classList.add("copied");
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove("copied");
        }, 2000);
    });
}
