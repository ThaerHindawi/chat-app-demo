$(function () {
    const socket = io();

    const name = $('#name').val();    
    
    socket.on('connect', () => {
        console.log('user connected from browser');
    });

    $('#send-message').on('click', (event) => {
        $('#message-form').submit();
    });

    $('#message-form').on('submit', (event) => {
        event.preventDefault();
        let msg = $('#msg').val().trim();

        if (msg === ' ' || !msg) return;

        socket.emit('message', {
            body: msg,
            name: name
        });
        $('#msg').val('');
    });

    socket.on('newMessage', (data) => {
        console.log(data);
        let darker = ' darker';
        if (name === data.name) {
            darker = '';
        }
        const message = `
        <div class="container${darker}">
        <p class="name">${data.name}</p>
        <p>${data.body}</p>
        <span class="time-right">${data.createdAt}</span>
    </div>`;

        $('#messages').append(message);
    });
});