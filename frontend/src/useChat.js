import { useReducer, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const useChat = ({ backendUrl, roomId }) => {
  const [user, setUser] = useState({});
  const [socket, setSocket] = useState();
  const [iceToken, setIceToken] = useState();
  const [room, dispatch] = useReducer(
    (room, action) => {
      console.log(action);
      switch (action.type) {
        case "newMessage":
          return {
            ...room,
            messages: [...room.messages, action],
          };
        case 'iceTokenCreated':
          return setIceToken(action.token)
        default:
          return room;
      }
    },
    { messages: [], roomId }
  );
  useEffect(() => {
    const jsonUser = localStorage.getItem("user");
    let newUser = jsonUser ? JSON.parse(jsonUser) : null;
    if (!newUser) {
      newUser = { _id: uuidv4() };
      localStorage.setItem("user", JSON.stringify(user));
    }
    setUser(newUser);
    const socket = io(backendUrl);
    setSocket(socket);
    socket.emit('action', {
      type: 'joined',
      roomId
    })
  
    socket.on("action", (action) => {
      console.log('action');
      dispatch(action);
    });
  }, []);


  const newMessage = (text) => {
    socket.emit("action", {
      type: "newMessage",
      _id: uuidv4(),
      text,
      from: user,
      roomId
    });
  };

  return {
    newMessage,
    room,
    user,
    roomId
  };
};

export default useChat;
