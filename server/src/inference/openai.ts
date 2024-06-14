
import OpenAI from 'openai'

import Constants from '../constants'
import Provider, { MessageInfo, TokenStreamConsumer } from './provider'
import Util from '../util'


const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
})

// TODO: Retries

export default class OpenaiProvider extends Provider {
  async init() { }

  async embedText(text: string) {
    let embeddingResult = await openai.embeddings.create({
      input: text,
      model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-ada-002',
    })
    let embedding = Util.extendArray(embeddingResult.data[0].embedding, Constants.DESIRED_VECTOR_SIZE, 0)
    return embedding
  }

  async chatComplete(messages: MessageInfo[], tokenStreamConsumer?: TokenStreamConsumer) {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4',
      messages: messages,
    });
    let completion = response.choices[0].message.content
    if (!completion) {
      throw new Error("OpenAI chat completion failed")
    }
    return completion
  }
}
