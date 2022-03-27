const users = [];

//to keep track of users who are connected to app

const addUser = async (userId, socketId) => {
  //if uuser is already connected with this user Id and if socket is also same as new request then return
  const user = users.find(user => user.userId === userId);

  if (user && user.socketId === socketId) {
    return users;
  }
  //if user is there but socket is not same as new request then remove uuser completely and add new user
  else {
    if (user && user.socketId !== socketId) {
      await removeUser(user.socketId);
    }
    //otherwise create new user and push new user to users

    const newUser = { userId, socketId };

    users.push(newUser);

    return users;
  }
};

//
const removeUser = async socketId => {
  const indexOf = users.map(user => user.socketId).indexOf(socketId);

  await users.splice(indexOf, 1);

  return;
};

const findConnectedUser = userId => users.find(user => user.userId === userId);

module.exports = { addUser, removeUser, findConnectedUser };
