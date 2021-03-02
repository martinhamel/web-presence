module.exports = {
  chat: async (socket, io) => {
    const db = await getDatabase();
    const user = await userinfo(socket.handshake.headers.authorization);

    socket.on('initConversation', async (conversationId) => {
      socket.rooms.forEach(room => socket.leave(room));
      let conversation;
      if (user) {
        conversation = await db
          .collection("conversations")
          .findOne({ userEmail: user.email });
      }
      if (!conversation && conversationId) {
        conversation = await db
          .collection("conversations")
          .findOne({ _id: conversationId });
        if (conversation && user && !conversation.userEmail && user.email) {
          conversation.userEmail = user.email;
          db.collection("conversations").replaceOne(
            { _id: conversationId },
            conversation,
            { upsert: true }
          );
        }
        if (user &&
            conversation &&
            conversation?.userEmail !== user?.email &&
            !user?.permissions?.includes('admin:access')) {
          socket.emit("error", { error: "conversation denied" });
          return;
        }
      }
      if (!conversation) {
        conversation = {
          userEmail: user?.email,
          _id: conversationId ? conversationId : uuid.v4(),
          messages: [],
        };
        db.collection("conversations").insertOne(
          conversation
        );
      }
      socket.join(conversation._id);
      socket.emit("conversation", conversation);
      conversationId = conversation._id;
    })

    socket.on("userMessage", async (message) => {
      const user = await userinfo(socket.handshake.headers.authorization);
      const conversation = await db
        .collection("conversations")
        .findOne({ _id: message.conversationId });
      if (!user?.permissions?.includes('admin:access') && conversation?.userEmail && conversation?.userEmail != user?.email) {
        socket.emit("error", { message: "denied" });
        return;
      }
      io.to(conversation._id).emit('conversation', {
        ...conversation,
        messages: [...conversation.messages, message]
      })

      db.collection("conversations").updateOne(
        { _id: message.conversationId },
        {
          $push: {
            messages: message,
          },
        }
      );
    });

    socket.on("allConversations", async () => {
      const user = await userinfo(socket.handshake.headers.authorization);
      if (!user?.permissions?.includes('admin:access')) {
        return;
      }
      const conversations = await db
        .collection("conversations")
        .find()
        .toArray();
      socket.emit('allConversationsResponse', conversations);
    });

    socket.on('pingUser', (conversationId) => {
      db.collection('conversations')
        .updateOne({ _id: conversationId }, { $set: { lastUserPing: new Date() } })
    })
  },
};
