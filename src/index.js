const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', (options, _callback) => {
        const {error, user} = addUser({id: socket.id, ...options});
        const {room, username} = user;

        if (error) {
            return _callback(error);
        }

        socket.join(room);
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(room).emit('message', generateMessage('Admin', `${username} has joined!`));
        io.to(room).emit('roomData', {
            room,
            users: getUsersInRoom(room)
        });

        _callback();
    });

    socket.on('sendMessage', (message, _callback) => {
        const {room, username} = getUser(socket.id) || {};
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return _callback('Profanity is not allowed!');
        }

        io.to(room).emit('message', generateMessage(username, message));
        _callback();
    });

    socket.on('sendLocation', ({latitude, longitude}, _callback) => {
        const {room, username} = getUser(socket.id);
        io.to(room).emit('locationMessage', generateLocationMessage(username, `https://www.google.com/maps?q=${latitude},${longitude}`));
        _callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            const {username, room} = user;
            io.to(room).emit('message', generateMessage('Admin', `${username} has left`));
            io.to(room).emit('roomData', {
                room,
                users: getUsersInRoom(room)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
});