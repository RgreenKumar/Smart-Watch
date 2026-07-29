import React, { useState, useEffect } from 'react';
import { Link, Route  } from 'react-router-dom';
import Usersidebar from './usersidebar'
import { useNavigate } from 'react-router-dom';
import Video from './video';
import Footer from './Footer';
import API_URL from '../Config';

export const Test = () => {
  // const handleGoogleLogin = () => {
  //   // Redirect to the Spring Boot endpoint that starts the OAuth flow
  //   window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  // };

  const [message, setMessage] = useState('Tell me a joke');
  const [responses, setResponses] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setResponses([]);
    setIsStreaming(true);

    // Create an EventSource to listen for streaming responses from your endpoint.
    const eventSource = new EventSource(
      `http://localhost:8080/ai/generateStream?message=${encodeURIComponent(message)}`
    );

    eventSource.onmessage = (event) => {
      try {
        // Parse each event data as JSON.
        const parsedData = JSON.parse(event.data);
        const text = parsedData.result.output.text;
        // const data = JSON.parse(event.data.result.output.text);
        setResponses((prev) => [...prev, text]);
      } catch (err) {
        console.error('Error parsing event data', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
      eventSource.close();
      setIsStreaming(false);
    };

    // Optionally close the connection after 10 seconds.
    // setTimeout(() => {
    //   eventSource.close();
    //   setIsStreaming(false);
    // }, 10000);
  };

  return (
//     <i
//       className="fa-brands fa-google"
//       onClick={handleGoogleLogin}
//       style={{ cursor: 'pointer', width: '400px', fontSize: 'xxx-large' }}
//       title="Login with Google"
//     />
//   );
// }
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
    <h1>AI Chat Stream</h1>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '300px', padding: '0.5rem' }}
      />
      <button type="submit" style={{ padding: '0.5rem', marginLeft: '1rem' }}>
        Send
      </button>
    </form>

    {isStreaming && <p>Streaming responses...</p>}
    <div style={{ marginTop: '2rem' }}>
        <h2>Responses:</h2>
        {responses.length === 0 ? (
          <p>No responses yet.</p>
        ) : (
          <p>{responses.join(' ')}</p>
        )}
      </div>
  </div>


  );
};

export default Test;

