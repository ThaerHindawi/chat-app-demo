const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = 3000;

const ejs = require('ejs');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('join-room.html');
});

app.post('/chat', (req, res) => {
    console.log(req.body);
    res.render('chat', {
        senderId: req.body.senderId,
        receiverId: req.body.receiverId
    });
});

// Listen on connections
io.on("connection", socket => {

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    console.log(`${socket.id} is connected`);

    // join private chat between two users
    socket.on('joinPrivate', (data, callback) => {
        if (data) {
            let privateId;
            let senderId = data.senderId;
            let receiverId = data.receiverId;
            if (receiverId && senderId) {
                // arrange users ID between sender and receiver
                // to make new ID that will be used to connect the two users together
                // example if receiverId = 6032b74134afe118a4156081 and senderId = 6032b70234afe118a415607f
                // the combination between them will be 6032b74134afe118a4156081&6032b70234afe118a415607f
                // and if receiverId = 6032b70234afe118a415607f and senderId = 6032b74134afe118a4156081
                // the combination between them will be 6032b74134afe118a4156081&6032b70234afe118a415607f
                // so it will be end in the same result
                if (receiverId > senderId) {
                    privateId = `${receiverId}&${senderId}`;
                } else {
                    privateId = `${senderId}&${receiverId}`;
                }
                console.log(privateId);
                if (privateId) {
                    // join private messaging by private Id 
                    // private Id is combination between senderId and receiverId
                    socket.join(privateId);
                    console.log(`user ${senderId} join private chat: ${privateId}`);
                    // emit privateId to frontend to use it there if you want
                    // socket.emit('privateId', privateId);
                }
            }
        }
        callback();
    });

    socket.on('privateMessage', async (message, callback) => {
        console.log(message);
        let privateId;
        if (message.receiverId > message.senderId) {
            privateId = `${message.receiverId}&${message.senderId}`;
        } else {
            privateId = `${message.senderId}&${message.receiverId}`;
        }
        
        let current_datetime = new Date();
        // formatte date
        let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();

        if (message.body) {

            // save message in database here if you want

            // send message to the other user using privateId
            // other user will be listen on event newPrivateMessage 
            io.to(privateId).emit('newPrivateMessage', {
                body: message.body,
                createdAt: formatted_date,
                senderId: message.senderId,
                receiverId: message.receiverId,
            });
            
        } else {
            // on error
            socket.send({
                error: 'body of the message is null'
            });
        }
        callback();
    });
});

server.listen(PORT, () => {
    console.log('server listen on port: ' + PORT);
});