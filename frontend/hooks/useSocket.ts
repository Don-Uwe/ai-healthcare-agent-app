// frontend/socket.js or in a component

import {useEffect} from 'react';
import io from 'socket.io-client';

const socket = io('http://51.20.1.81:8081'); 

const useSocket = () => {
  useEffect(() => {

    socket.on('new-comment', data => {
      console.log('New Comment:', data);
    });

    socket.on('new-reply', data => {
      console.log('New Reply:', data);
    });

    socket.on('edit-comment', comment => {
      console.log('Edited Comment:', comment);
      // Handle comment edit (e.g. update in UI)
    });

    socket.on('delete-comment', data => {
      console.log('Deleted Comment:', data);
      // Handle comment deletion (e.g. remove from UI)
    });

    socket.on('comments-loaded', data => {
      console.log('Comments Loaded:', data);
      // Update UI with comments
    });

    socket.on('update-parent-comment', data => {
      console.log('Updated Parent Comment:', data);
      // Update parent comment UI
    });

    // Clean up on component unmount
    return () => {
      socket.off('new-comment');
      socket.off('new-reply');
      socket.off('edit-comment');
      socket.off('delete-comment');
      socket.off('comments-loaded');
      socket.off('update-parent-comment');
    };
  }, []);

  return socket;
};

export default useSocket;
