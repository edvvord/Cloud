export async function onRequestPost({ request }) {
    const form = await request.formData();
    const skinFile = form.get("skin");
    const capeFile = form.get("cape");
    
    if (!skinFile && !capeFile) {
        return new Response("No files provided", { status: 400 });
    }
    
    const result = {};
    
    if (skinFile) {
        const mineForm = new FormData();
        mineForm.append("file", skinFile);
        const res = await fetch("https://api.mineskin.org/generate/upload", {
            method: "POST",
            headers: { "User-Agent": "SkinUploader" },
            body: mineForm
        });
        const json = await res.json();
        result.skin = {
            value: json.data.texture.value,
            signature: json.data.texture.signature,
            url: json.data.texture.url
        };
    }
    
    if (capeFile) {
        const mineForm = new FormData();
        mineForm.append("file", capeFile);
        const res = await fetch("https://api.mineskin.org/generate/upload", {
            method: "POST",
            headers: { "User-Agent": "SkinUploader" },
            body: mineForm
        });
        const json = await res.json();
        result.cape = {
            value: json.data.texture.value,
            signature: json.data.texture.signature,
            url: json.data.texture.url
        };
    }
    
    return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
    });
}
