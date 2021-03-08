import {useState, useEffect} from 'react';
import axios from 'axios';

const useVideo = ({backendUrl}) => {
  const [connection, setConnection] = useState();

  useEffect(() => {
    (async () => {
      const response = await axios.get(`${backendUrl}/rtcToken`)
      const token = response.data;
      const connection = new RTCPeerConnection({
        iceServers: token.ice_servers
      })
      console.log(connection);
      setConnection(connection)
    })()
  }, [])

  return connection
}


export default useVideo;