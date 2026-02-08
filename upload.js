async function upload() {
    const file = document.getElementById("skin").files[0];
    if (!file) return alert("Select PNG skin");

    const form = new FormData();
    form.append("skin", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: form
    });

    if (!res.ok) {
        const text = await res.text(); // для дебага
        console.error(text);
        return alert("Upload failed");
    }

    const json = await res.json();
    document.getElementById("out").textContent =
        JSON.stringify(json, null, 2);
}
