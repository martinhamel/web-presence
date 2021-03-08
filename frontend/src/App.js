import './App.css';
import Chat from './Chat';

function App() {
  return (
    <div className="App">
      <Chat backendUrl={process.env.REACT_APP_BACKEND_URL} roomId='526dff6e-3943-4e57-9c77-6892ba019967' />
    </div>
  );
}

export default App;
