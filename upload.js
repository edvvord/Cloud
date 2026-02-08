async function upload() {
    const file = document.getElementById("skin").files[0];
    if (!file) return alert("Select PNG skin");

    const form = new FormData();
    form.append("skin", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: form
    });

    const json = await res.json();
    document.getElementById("out").textContent =
        JSON.stringify(json, null, 2);
}
