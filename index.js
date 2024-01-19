const express = require('express')
const app = express()
const csv = require('csvtojson')
const path = require('path')
const Table = require('cli-table');
const pgp = require('pg-promise')();
const dotenv = require('dotenv');
dotenv.config()
const port = process.env.PORT || 3000

const db = pgp({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

const insertData = async() => {
    let filePath = path.join(__dirname, process.env.File)
    const data = await csv().fromFile(filePath);

    let recordData = data.map(record => {
        let { name: {firstName, lastName}, age, address, ...rest } = record

        return {
            name: `${firstName} ${lastName}`,
            age: age,
            address: JSON.stringify(address),
            additional_info: JSON.stringify(rest)
        }
    })

    const columnSet = new pgp.helpers.ColumnSet(['name', 'age', 'address', 'additional_info'], { table: 'users' });
    const insertQuery = pgp.helpers.insert(recordData, columnSet);
    await db.none(insertQuery);

    retrieveData();
}

const retrieveData = async() => {
    const getQuery = `
        SELECT COUNT(CASE WHEN age < 20 THEN 1 END) AS "< 20",
        COUNT(CASE WHEN age BETWEEN 20 AND 40 THEN 1 END) AS "20 to 40",
        COUNT(CASE WHEN age BETWEEN 41 AND 60 THEN 1 END) AS "41 to 60",
        COUNT(CASE WHEN age > 60 THEN 1 END) AS "> 60",
        COUNT(*) AS "total_users" FROM users;`;

    const records = await db.query(getQuery);

    let table = new Table({
        head: ['Age-Group', '% Distribution'],
        colWidths: [20, 20]
    });

    for(let key in records[0]) {
        if(key != 'total_users') {
            table.push([key, (records[0][key]/records[0].total_users)*100])
        }
    }
    console.log(table.toString())
}

app.get('/convert-csv', async (req, res) => {
    insertData();
    res.send("Data uploaded successfully!")
})

app.listen(port, () => {
    console.log(`Server listening at port ${port}`)
})