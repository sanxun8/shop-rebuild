module.exports = {
  "/api/user/:id": {
    get: {
      query: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
        required: ["name"],
      },
    },
  },
};
