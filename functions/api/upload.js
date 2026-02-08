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
                const skinResult = await uploadWithRetry(skinFile);
                result.skin = skinResult;
            } catch (e) {
                return new Response(`Skin upload error: ${e.message}`, { status: 400 });
            }
        }
        
        // Задержка между запросами
        if (skinFile && capeFile) {
            await sleep(2000);
        }
        
        if (capeFile) {
            try {
                const capeResult = await uploadWithRetry(capeFile);
                result.cape = capeResult;
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

async function uploadWithRetry(file, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const mineForm = new FormData();
            mineForm.append("file", file);
            
            const res = await fetch("https://api.mineskin.org/generate/upload", {
                method: "POST",
                headers: { "User-Agent": "SkinUploader" },
                body: mineForm
            });
            
            if (res.status === 429) {
                // Экспоненциальная задержка: 3сек, 6сек, 12сек
                const delay = 3000 * Math.pow(2, i);
                console.log(`Rate limited, waiting ${delay}ms before retry ${i + 1}/${retries}`);
                await sleep(delay);
                continue;
            }
            
            if (!res.ok) {
                throw new Error(`API returned status ${res.status}`);
            }
            
            const json = await res.json();
            
            if (!json.data || !json.data.texture) {
                throw new Error("Invalid API response structure");
            }
            
            return {
                value: json.data.texture.value,
                signature: json.data.texture.signature,
                url: json.data.texture.url || "N/A"
            };
        } catch (e) {
            if (i === retries - 1) throw e;
            await sleep(1000);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
