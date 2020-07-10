const users = [];

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        };
    }

    const existingUser = users.find(({username: name, room: roomId}) =>
        roomId === room && name === username);

    if (existingUser) {
        return {
            error: 'Username is in use!'
        };
    }

    const user = {id, username, room};
    users.push(user);
    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex(({id: userId}) => userId === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    return users.find(({id: userId}) => userId === id);
};

const getUsersInRoom = (room) => {
    return users.filter(({room: roomId}) => roomId === room);
};

module.exports = {addUser, removeUser, getUser, getUsersInRoom};