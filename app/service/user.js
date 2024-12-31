module.exports = (app) => {
  return class UserService {
    getUser() {
      return {
        name: "三旬",
        age: 18,
      };
    }
  };
};
