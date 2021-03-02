const useChat = () => {
  const newMessage = (message) => {
    console.log(message);
  }

  return {
    newMessage
  }
}

export default useChat