exports.handler = async function (event, context) {
    // Sadece POST isteklerine izin ver
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { messages, codeSnippet } = JSON.parse(event.body);

        // Netlify Dashboard'unda ayarlayacağınız API Anahtarı
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: { message: "Sunucuda API Anahtarı eksik (GROQ_API_KEY)." } })
            };
        }

        // Groq API İstek Gövdesi
        const payload = {
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048,
        };

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                // İsteğe bağlı: Sadece kendi alan adınıza izin vermek için CORS ayarları eklenebilir
                // "Access-Control-Allow-Origin": "https://siteniz.netlify.app" 
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: { message: error.message } })
        };
    }
};
