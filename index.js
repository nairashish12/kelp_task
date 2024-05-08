const express = require('express');
const app = express();
const csv = require('csv-parser');
const path = require('path')
const Table = require('cli-table');
const pgp = require('pg-promise')();
const dotenv = require('dotenv');
dotenv.config()
const fs = require('fs');
const port = process.env.PORT || 3000

const db = pgp({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

const insertData = async(res) => {
    let filePath = path.join(__dirname, process.env.File)
    let result = []
    
    fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
        const addressKeys = Object.keys(data).filter(key => key.startsWith('address.'));
        const address = {}
        addressKeys.forEach(key => {
            address[key.split(".")[1]] = data[key]
        })
        
        const json = {
            name: `${data['name.firstName']} ${data['name.lastName']}`,
            age: data.age,
            address: JSON.stringify(address),
            gender: data.gender
        }

        result.push(json);
    }).on('end', async () => {
        try {
            let recordData = result.map(record => {
                let { name, age, address, ...rest } = record
    
                return {
                    name: name,
                    age: age,
                    address: address,
                    additional_info: JSON.stringify(rest)
                }
            })
            
            const columnSet = new pgp.helpers.ColumnSet(['name', 'age', 'address', 'additional_info'], { table: 'users' });
            const insertQuery = pgp.helpers.insert(recordData, columnSet);
            await db.none(insertQuery);
    
            retrieveData(res);
        }
        catch(exception) {        
            sendError(res, exception)
        }
    }).on('error', error => {
        sendError(res, error)
    });
}

const sendError = (res, err) => {
    console.log(err)
    res.send("Oops! Something went wrong.")
}

const retrieveData = async(res) => {
    try {
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
                let perc = ((records[0][key]/records[0].total_users)*100).toFixed(2)
                table.push([key, perc])
            }
        }
        console.log(table.toString())
        res.send("Data uploaded successfully!")
    }
    catch(exception) {
        sendError(res, exception);
    }
}

app.get('/convert-csv', async (req, res) => {
    insertData(res);
})

app.listen(port, () => {
    console.log(`Server listening at port ${port}`)
})