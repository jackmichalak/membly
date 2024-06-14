

import { Client } from 'pg'

import Constants from './constants'

class Db {
    private DB_VERSION = 2;

    static async connect() {
        let client = new Client({ connectionString: process.env.POSTGRES_URI });
        await client.connect();
        let ret = new Db(client);
        await ret.runMigrations();
        return ret;
    }

    private client

    private constructor(client: Client) {
        this.client = client;
    }

    async insertPage(title: string, text: string, url: string, embedding: number[]) {
        const embeddingString = `[${embedding.join(', ')}]`;
        let sql = 'INSERT INTO pages(title, text, url, timestamp, embedding) VALUES ($1, $2, $3, $4, $5)'
        let values = [title, text, url, new Date(), embeddingString]
        let result = await this.client.query(sql, values)
        console.log("Page inserted with result", result.rowCount)
    }

    async findPages(embedding: number[], limit = 5) {
        const embeddingString = `[${embedding.join(', ')}]`;
        let sql = 'SELECT * FROM pages ORDER BY embedding <-> $1 LIMIT $2'
        let params = [embeddingString, limit]
        let results = await this.client.query(sql, params)
        return results.rows
    }

    private async runMigrations() {
        try {
            await this.client.query("CREATE TABLE IF NOT EXISTS __migrations__ (version INT)")
            let versionQuery = await this.client.query("SELECT version FROM __migrations__")
            let currentVersion = !versionQuery.rowCount || versionQuery.rowCount <= 0 ? 1 : versionQuery.rows[0].version
            console.log("Got db currentVersion", currentVersion)
            if (this.DB_VERSION < currentVersion) {
                throw new Error("Target DB version is lower than current version")
            }
            if (this.DB_VERSION === currentVersion) {
                return;
            }
            await this.client.query("BEGIN")
            switch (currentVersion) {
                case 1: await this.upgradeFrom1();
                case this.DB_VERSION: break;
                default: throw new Error("Db upgrade not handled; got currentVersion " + currentVersion + " and DB_VERSION " + this.DB_VERSION)
            }
            let result = await this.client.query("UPDATE __migrations__ SET version = $1 WHERE 1=1 ", [this.DB_VERSION])
            if (!result.rowCount || result.rowCount <= 0) {
                await this.client.query("INSERT INTO __migrations__(version) VALUES ($1)", [this.DB_VERSION])
            }
            await this.client.query("COMMIT")
            console.log("DB upgrade complete, now version", this.DB_VERSION)
        } catch (e) {
            await this.client.query("ROLLBACK")
            console.log("Failed to run migrations; exiting", e)
            throw new Error("Migrations failed")
        }
    }

    private async upgradeFrom1() {
        await this.client.query(`CREATE TABLE pages (
            id SERIAL PRIMARY KEY,
            title TEXT,
            text TEXT,
            url TEXT,
            timestamp TIMESTAMP,
            embedding VECTOR(${Constants.DESIRED_VECTOR_SIZE})
        );`)
    }
}

export default Db;
