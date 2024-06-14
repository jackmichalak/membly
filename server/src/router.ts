
import express, { Request, Response } from 'express';
import cors from 'cors';

import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

import Constants from './constants';
import Db from './db'
import { MessageInfo } from './inference/provider'
import getProvider from './inference/acquire';
import Util from './util'

export default class Router {
    async start() {
        const app = express();
        const port = 3001;

        const sizeLimit = '50mb'
        app.use(cors());
        app.use(express.json({ limit: sizeLimit }));
        app.use(express.urlencoded({ extended: true, limit: sizeLimit }));

        let provider = await getProvider();
        let db = await Db.connect();

        app.post('/api/browse', async (req: Request, res: Response) => {
            let url = req.body.url
            let html = req.body.html
            let doc = new JSDOM(html)
            let reader = new Readability(doc.window.document);
            let article = reader.parse()
            if (article) {
                let title = article.title
                let text = article.textContent
                let embedding = await provider.embedText(text)
                let results = await db.findPages(embedding)
                for (let i = 0; i < results.length; i++) {
                    let result = results[i]
                    let dbEmbedding = JSON.parse(result.embedding)
                    let dist = Util.euclideanDistance(dbEmbedding, embedding)
                    if (result.url === url && (dist < Constants.EPSILON || result.text === text)) {
                        console.log("Skipping insertion of duplicate; same embedding?", dist < Constants.EPSILON, "same text?", result.text === text)
                        res.json({ success: true })
                        return
                    }
                }
                await db.insertPage(title, text, url, embedding)
                res.json({ success: true })
            } else {
                res.status(500).json({ success: false, error: "failed to extract" })
            }
        })

        app.get('/api/query', async (req: Request, res: Response) => {
            let encoded = req.query.encoded as string
            let parsed = JSON.parse(decodeURIComponent(encoded))
            let messageHistory: MessageInfo[] = parsed.map((m: any) => { return { role: m.direction === "out" ? "user" : "system", content: m.text } })
            let embedding = await provider.embedText(messageHistory[messageHistory.length - 1].content)
            let results = await db.findPages(embedding)
            console.log("The titles of these results are", results.map(r => r.title))
            let clientResults = results.map(r => {
                return {
                    id: r.id,
                    title: r.title,
                    text: r.text,
                    url: r.url,
                    timestamp: r.timestamp,
                }
            })

            console.log("Generating response")
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            let response = await provider.makeResponse(messageHistory, JSON.stringify(clientResults.reverse()), item => {
                const data = JSON.stringify({ timestamp: new Date(), part: item, });
                res.write(`data: ${data}\n\n`);
            })
            console.log("Streaming complete")
            let data = JSON.stringify({ timestamp: new Date(), full: response })
            res.write(`data: ${data}`)
            res.end()
        })

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }
}