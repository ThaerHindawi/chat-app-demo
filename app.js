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

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/chat.html');
});

// Listen on connections
io.on("connection", socket => {
    const name = 'user' + Math.floor(Math.random() * 1000000);
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    console.log(`${socket.id} is connected`);

    socket.on('message', async (message) => {
        console.log(message);

        let current_datetime = new Date();
        // formatte date
        let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();

        if (message.body) {

            try {
                // save message in database here if you want

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