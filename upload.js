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
    document.getElementById("out").textContent =
        JSON.stringify(json, null, 2);
}
