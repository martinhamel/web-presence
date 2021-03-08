import styles from "./Chat.module.css";
import Fab from "@material-ui/core/Fab";
import ChatIcon from "@material-ui/icons/Chat";
import CloseIcon from "@material-ui/icons/Close";
import SendIcon from "@material-ui/icons/Send";
import { useState, useRef, useLayoutEffect } from "react";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import ReactMarkdown from "react-markdown";
import useVideo from "./useVideo";
import useChat from "./useChat";

const Chat = ({ backendUrl, roomId }) => {
  const messagesRef = useRef();
  const [shift, setShift] = useState(false);
  const [open, setOpen] = useState(false);
  const [newText, setNewText] = useState("");
  // useVideo({backendUrl});
  const { newMessage, room, user } = useChat({
    backendUrl,
    roomId,
  });
  useLayoutEffect(() => {
    messagesRef?.current?.scroll({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [room]);

  const fabIcon = !open ? (
    <ChatIcon className={styles.fabIcon} />
  ) : (
    <CloseIcon className={styles.fabIcon} />
  );

  const messages = room?.messages?.map((message) => {
    console.log(message, user);
    const classe = message.from._id === user._id ? styles.seller : styles.user;
    return (
      <Paper className={`${styles.message} ${classe}`} key={message._id}>
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </Paper>
    );
  });

  const card = open ? (
    <Card raised={true} className={styles.card}>
      <div className={styles.header}>Bonjour</div>
      <div className={styles.messages} ref={messagesRef}>
        {messages}
      </div>

      <div className={styles.newMessage}>
        <TextField
          id="outlined-basic"
          variant="outlined"
          multiline
          value={newText}
          onChange={(e) => {
            setNewText(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Shift") {
              setShift(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Shift") {
              setShift(true);
            }
            if (e.key === "Enter" && !shift) {
              e.preventDefault();
              setNewText("");
              newMessage(newText);
            }
            if (e.key === "Enter" && shift) {
              e.preventDefault();
              setNewText(`${newText}\n`);
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={() => {
            setNewText("");
            newMessage(newText, room);
          }}
        >
          <SendIcon fontSize="large" />
        </IconButton>
      </div>
    </Card>
  ) : (
    ""
  );

  return (
    <div className={styles.main}>
      {card}
      <Fab
        className={styles.fab}
        color="primary"
        onClick={() => setOpen(!open)}
      >
        {fabIcon}
      </Fab>
    </div>
  );
};

export default Chat;
