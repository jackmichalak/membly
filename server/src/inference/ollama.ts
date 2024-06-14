
import ollama from 'ollama'

import Constants from '../constants'
import Provider, { MessageInfo, TokenStreamConsumer } from './provider'
import Util from '../util'

export default class OllamaProvider extends Provider {
  private embeddingModel: string = process.env.OLLAMA_EMBEDDING_MODEL ?? 'mxbai-embed-large'
  private chatModel: string = process.env.OLLAMA_CHAT_MODEL ?? 'llama3'

  async init() {
    console.log(`Ensuring embedding model ${this.embeddingModel} available`)
    let embeddingPull = await ollama.pull({
      model: this.embeddingModel,
      insecure: false,
    })
    console.log("Embedding pull result", embeddingPull)
    console.log(`Ensuring chat model ${this.chatModel} available`)
    let chatPull = await ollama.pull({
      model: this.chatModel,
      insecure: false,
    })
    console.log("Chat pull result", chatPull)
  }

  async embedText(text: string) {
    let embeddingResult = await ollama.embeddings({
      model: this.embeddingModel,
      prompt: text,
    })
    let embedding = Util.extendArray(embeddingResult.embedding, Constants.DESIRED_VECTOR_SIZE, 0)
    return embedding
  }

  async chatComplete(messages: MessageInfo[], tokenStreamConsumer?: TokenStreamConsumer) {
    if (tokenStreamConsumer !== undefined) {
      const ollamatest = await ollama.chat({
        model: this.chatModel,
        messages: messages,
        stream: true,
      })
      let completion = ""
      for await (const part of ollamatest) {
        let newPart = part.message.content
        tokenStreamConsumer({ done: part.done, text: newPart })
        completion += newPart
      }
      return completion
    } else {
      const ollamatest = await ollama.chat({
        model: this.chatModel,
        messages: messages,
      })
      const completion = ollamatest.message.content
      return completion
    }
  }
}
