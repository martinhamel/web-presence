const twilio = require("twilio");

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

 
module.exports = {
  chat: async (socket, io) => {
    socket.on("action", async (action) => {
      switch(action.type) {
        case 'joined':
          socket.join(action.roomId);
          const token = await client.tokens.create();
          socket.emit({
            type: 'iceTokenCreated',
            token
          })

        case 'newMessage':
          io.to(action.roomId).emit('action',  action)
      }
    });
  },
};
