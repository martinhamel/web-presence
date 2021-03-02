const EventEmitter = require("events");
const { expressJwtSecret } = require("jwks-rsa");
const { chat } = require("./chat");
const getDatabase = require("../../backend/src/utils/db");
const userinfo = require("../../backend/src/utils/userinfo");
jest.mock("./utils/db");
jest.mock("./utils/userinfo");

describe("chat", () => {
  let io;
  let socket;
  let collection;
  let findOne;
  let insertOne;
  let updateOne;
  let replaceOne;
  const user = { email: "user@email", name: "firstname lastname" };
  const conversation = { _id: "cid", userEmail: user.email, messages: [] };
  beforeEach(async () => {
    io = {
      to: jest.fn(() => ({emit: jest.fn()}))
    };
    collection = jest.fn();
    findOne = jest.fn(async () => conversation);
    insertOne = jest.fn();
    updateOne = jest.fn();
    replaceOne = jest.fn();
    watch = jest.fn(() => ({ on: jest.fn() }));
    userinfo.mockImplementation(async () => user);
    socket = {
      emit: jest.fn(), handshake: {
        headers: {
          authorization: "Bearer token",
          conversationid: 'cid'
        },
      },
      join: jest.fn(),
      to: jest.fn(() => ({emit: jest.fn()})),
      rooms: []
    };
    socket.on = (name, fn) => {
      socket[name] = fn
    }
    getDatabase.mockImplementation(() => ({ collection }));
    collection.mockImplementation(() => ({
      findOne,
      insertOne,
      updateOne,
      replaceOne,
      watch
    }));
    findOne.mockImplementation(async () => conversation);
  });
  describe("Given no previous conversation", () => {
    beforeEach(() => {
      socket.handshake.headers.conversationid = undefined;
      userinfo.mockImplementation(async() => null)
    })
    afterEach(() => {
      userinfo.mockImplementation(async() => user)
    })
    it("should create a new conversation with a new id", async () => {
      await chat(socket);
      await socket.initConversation();
      expect(insertOne).toHaveBeenCalled()
    });
  });
  describe("Given a conversation with an id", () => {
    describe("Given the user of the request is the one of the conversation", () => {
      it("should return the conversation to the user", async () => {
        await chat(socket);
        await socket.initConversation();
        expect(socket.emit).toHaveBeenCalledWith('conversation', conversation)
      });
      it("should listen on new messages on that conversation", () => { });
    });
  });
  describe("on userMessage", () => {
    describe("Given a new message", () => {
      let message = { conversationId: "cid", message: "messageText" };
      describe("Given you are not the owner of the conversation", () => {
        beforeEach(async () => {
          await chat(socket);
          userinfo.mockImplementation(async () => ({ email: "wrong@email" }));
        })
        afterEach(() => {
          userinfo.mockImplementation(async () => (user));
        })
        it("should give an error message", async () => {
          await socket.userMessage({})
          expect(socket.emit).toHaveBeenLastCalledWith('error', {
            message:
              'denied'
          })
        });
      });
      describe("Given you have the authorization for that conversation", () => {
        it("should save the message in the conversation", async () => {
          await chat(socket, io);
          await socket.userMessage(message);
          expect(updateOne).toHaveBeenCalledWith({_id: conversation._id}, { "$push": { messages: message }}, );
        });
      });
    });
  });
});
