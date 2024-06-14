
import Provider from "./provider";

import OpenAIProvider from './openai'
import OllamaProvider from './ollama'

export default async function getProvider(): Promise<Provider> {
    let provider: Provider
    if (process.env.INFERENCE_PROVIDER === "openai") {
        provider = new OpenAIProvider();
    } else {
        provider = new OllamaProvider();
    }
    await provider.init()
    return provider
}