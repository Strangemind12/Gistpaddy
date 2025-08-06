// client/src/components/Splash.jsx
import React, { useEffect, useState } from 'react';

const Splash = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish(); // tell App to switch screen
    }, 3000); // show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div style={styles.container}>
      <img src="/splashscreen.gif" alt="Loading..." style={styles.gif} />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gif: {
    width: '200px',
    height: '200px',
    objectFit: 'contain',
  },
};

export default Splash;