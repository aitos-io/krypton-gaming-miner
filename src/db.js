import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const dbPath = path.join(__dirname, '../bin/db.sqlite3');
const db = new Database(dbPath, )
db.pragma('journal_mode = WAL');

export async function insert(sql,params){
    db.prepare(sql).run(params);
}

export async function deleteItem(sql,params){
    db.prepare(sql).run(params);
}

export async function update(sql,params){
    db.prepare(sql).run(params);
}

export async function all(sql,params){
   return  db.prepare(sql).all(params);
}

export async function get(query, params) {
    return db.prepare(query).get(params);
}

/*async function queryDatabase() {

    const list = await db.all("SELECT * FROM lorem");

    console.log(list)
}

queryDatabase();*/
