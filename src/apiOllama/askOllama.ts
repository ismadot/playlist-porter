const {OLLAMA_API_URL} = process.env

export async function askOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt,
      stream: false
    }),
  });

  const json = await res.json() as any;
  return json.response.trim();
}
