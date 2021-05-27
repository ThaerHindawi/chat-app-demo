const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;
const ejs = require('ejs');

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const mysql = require('mysql');

// create a connection
const con = mysql.createConnection({
    user: "root",
    password: "",
    database: "public_chat"
});

con.connect((err) => {
    if (err) throw err;
    console.log('Connected To The Datebase!');

    // Create Database
    con.query("CREATE DATABASE IF NOT EXISTS public_chat", (err, result) => {
        if (err) throw err;
        console.log("Datebase Created");
    });

    // Create Table
    const sql = "CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), body VARCHAR(255), createdAt datetime)";
    con.query(sql, (err, result) => {
        if (err) throw err;
        console.log("table has been created...");
    });
})

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

let name;

app.get('/', (req, res) => {
    // Select All
    const sql = "SELECT * FROM messages";
    con.query(sql, function (err, result, fields) {
        if(err) throw err;
        console.log(result);
        res.render('chat', {
            name: name,
            messages: result
        });
    });    
});

// Listen on connections
io.on("connection", socket => {
    name = 'user' + Math.floor(Math.random() * 1000000);
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    console.log(`${name} is connected`);

    socket.on('message', async (message) => {
        console.log(message);

        let current_datetime = new Date();
        // formatte date
        let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();

        if (message.body) {

            try {                
                // Insert Into Table
                const sql = `INSERT INTO messages (name, body, createdAt) VALUES ('${name}', '${message.body}', '${formatted_date}')`;
                console.log(sql);
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Data inserted into table...");
                });

                io.emit('newMessage', {
                    name: name,
                    body: message.body,
                    createdAt: formatted_date
                });
            } catch (err) {
                console.log(err);
                // on error
                socket.send({
                    error: err
                });
            }

        } else {
            // on error
            socket.send({
                error: 'body of the message is null'
            });
        }
    });
});

server.listen(PORT, () => {
    console.log('server listen on port: ' + PORT);
});