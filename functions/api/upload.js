export async function onRequestPost({ request }) {
    try {
        const form = await request.formData();
        const skinFile = form.get("skin");
        const capeFile = form.get("cape");
        
        if (!skinFile && !capeFile) {
            return new Response("No files provided", { status: 400 });
        }
        
        const result = {};
        
        if (skinFile) {
            try {
                const mineForm = new FormData();
                mineForm.append("file", skinFile);
                const res = await fetch("https://api.mineskin.org/generate/upload", {
                    method: "POST",
                    headers: { "User-Agent": "SkinUploader" },
                    body: mineForm
                });
                
                if (!res.ok) {
                    return new Response(`MineSkin API error: ${res.status}`, { status: 400 });
                }
                
                const json = await res.json();
                
                if (!json.data || !json.data.texture) {
                    return new Response("Invalid MineSkin response", { status: 400 });
                }
                
                result.skin = {
                    value: json.data.texture.value,
                    signature: json.data.texture.signature,
                    url: json.data.texture.url || "N/A"
                };
            } catch (e) {
                return new Response(`Skin upload error: ${e.message}`, { status: 400 });
            }
        }
        
        if (capeFile) {
            try {
                const mineForm = new FormData();
                mineForm.append("file", capeFile);
                const res = await fetch("https://api.mineskin.org/generate/upload", {
                    method: "POST",
                    headers: { "User-Agent": "SkinUploader" },
                    body: mineForm
                });
                
                if (!res.ok) {
                    return new Response(`MineSkin API error: ${res.status}`, { status: 400 });
                }
                
                const json = await res.json();
                
                if (!json.data || !json.data.texture) {
                    return new Response("Invalid MineSkin response", { status: 400 });
                }
                
                result.cape = {
                    value: json.data.texture.value,
                    signature: json.data.texture.signature,
                    url: json.data.texture.url || "N/A"
                };
            } catch (e) {
                return new Response(`Cape upload error: ${e.message}`, { status: 400 });
            }
        }
        
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(`Server error: ${e.message}`, { status: 500 });
    }
}
