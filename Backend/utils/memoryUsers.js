const memoryUsers = [];

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createMemoryUser(userData) {
  const user = {
    ...userData,
    _id: userData._id || generateId(),
    id: userData.id || userData._id || generateId()
  };

  memoryUsers.push(user);
  return user;
}

function findMemoryUserByEmail(email) {
  return memoryUsers.find((user) => user.email === email) || null;
}

function findMemoryUserById(id) {
  return memoryUsers.find((user) => user.id === id || user._id === id) || null;
}

function updateMemoryUser(id, updates) {
  const user = findMemoryUserById(id);
  if (!user) return null;

  Object.assign(user, updates);
  return user;
}

module.exports = {
  memoryUsers,
  createMemoryUser,
  findMemoryUserByEmail,
  findMemoryUserById,
  updateMemoryUser
};
