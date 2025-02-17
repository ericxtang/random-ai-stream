"use client"; // <-- Important for client components

import { useState, useEffect, CSSProperties } from 'react';

interface Stream {
  musicLink: string;
  sourceLink: string;
  sourceStreamID: string;
  name: string;
  musicStreamStatus: string;
  sourceStreamStatus: string;
}

const coverVideoURL: string = process.env.NEXT_PUBLIC_COVER_VIDEO_URL ?? "";

export default function HomePage() {

  const [currentStream, setCurrentStream] = useState('');
  const [statuses, setStatuses] = useState<Stream[]>([]);

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/stream-status');
      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error('Error fetching statuses:', error)
    }
  };

  const handleStreamSwitch = (link: string) => {
    console.log(link);
    setCurrentStream(link);
  };

  useEffect(() => {
    handleStreamSwitch(coverVideoURL);
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.page}>
            {/* HEADER */}
            <header style={styles.header}>
        <h1 style={styles.heading}>24/7 AI Live Streams</h1>

        {/* GITHUB LINK */}
        <a
          href="https://github.com/ericxtang/random-ai-stream"
          style={styles.githubLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/github_logo.png"
            alt="GitHub"
            style={styles.githubIcon}
          />
        </a>
      </header>

      {/* <h1 style={styles.heading}>24/7 AI Live Streams<a href="https://github.com/ericxtang/random-ai-stream">(Github)</a></h1> */}

      {/* Responsive container for 16:9 video */}
      <div style={styles.videoContainer}>

        <iframe 
          src={`https://lvpr.tv?url=${currentStream}`}
          style={styles.iframe}
          frameBorder="0" allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture" 
          sandbox="allow-same-origin allow-scripts">
        </iframe>
      </div>

      <div style={styles.streamList}>
        {statuses.map((stream) => (
          <div key={stream["name"]} style={styles.streamItem}>
            <div style={styles.streamTitle}>{stream["name"]}</div>

            <button style={styles.streamButton} onClick={() => handleStreamSwitch(stream["musicLink"])}>
              AI + Music
            </button>
            <span
              style={{
                ...styles.status,
                color: stream["musicStreamStatus"] === 'Online' ? 'green' : 'red',
              }}
            >
              {stream["musicStreamStatus"] || 'Checking...'}
            </span>

            <button style={styles.streamButton} onClick={() => handleStreamSwitch(stream["sourceLink"])}>
               AI Only
            </button>
            <span
              style={{
                ...styles.status,
                color: stream["sourceStreamStatus"] === 'Online' ? 'green' : 'red',
              }}
            >
              {stream["sourceStreamStatus"] || 'Checking...'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

  const styles: { [key: string]: CSSProperties } = {
    page: {
      // Let’s take full viewport height, center everything
      minHeight: "50vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",     // horizontal center
      justifyContent: "center", // vertical center
      backgroundColor: "#f5f5f5",
      padding: "2rem",
      boxSizing: "border-box",
    },
    header: {
      position: "relative",
      width: "100%",
      marginBottom: "1rem",
    },
    heading: {
      textAlign: "center",
      margin: 0,
      fontFamily: "sans-serif",
      fontSize: "3rem",
      fontWeight: "bold",
      lineHeight: "1.2",
      color: "#444",
    },
    githubLink: {
      position: "absolute",
      top: 0,
      right: 0,
      padding: "0.5rem",
    },
    githubIcon: {
      width: "100px",
      height: "auto",
    },
    videoContainer: {
      position: "relative",
      width: "100%",
      maxWidth: "800px",     // so it doesn’t get too huge on large screens
      paddingBottom: "40%", // 16:9 aspect ratio
      margin: "0 auto",      // center container horizontally if narrower than screen
      overflow: "hidden",
      backgroundColor: "#000", // black background behind the video
    },
    iframe: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      border: "none",
    },
    streamList: {
      display: "flex",
      flexDirection: "row",
      gap: "1rem",
      marginTop: "2rem",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    streamItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.5rem 1rem",
      backgroundColor: "#fff",
      border: "1px solid #ddd",
      borderRadius: "4px",
      width: "150px",
    },
    streamTitle: {
      color: "#333",
      fontWeight: "bold",
      paddingBottom: "5px"
    },
    streamButton: {
      padding: "0.5rem 1rem",
      fontSize: "1rem",
      cursor: "pointer",
      backgroundColor: "#333",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
    },
    status: {
      marginLeft: "1rem",
      fontSize: "0.9rem",
      textAlign: 'center',
      color: "#666",
      paddingBottom: "15px",
    },
    button: {
      marginTop: "1.5rem",
      padding: "0.75rem 1.5rem",
      fontSize: "1rem",
      cursor: "pointer",
      backgroundColor: "#333",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
    },
};