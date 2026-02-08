export async function onRequestPost({ request }) {
    const form = await request.formData();
    const file = form.get("skin");

    if (!file) return new Response("No file provided", { status: 400 });

    const mineForm = new FormData();
    mineForm.append("file", file);

    const res = await fetch("https://api.mineskin.org/generate/upload", {
        method: "POST",
        headers: {
            "User-Agent": "SkinUploader"
        },
        body: mineForm
    });

    const json = await res.json();

    return new Response(JSON.stringify({
        value: json.data.texture.value,
        signature: json.data.texture.signature
    }), { headers: { "Content-Type": "application/json" } });
}
