const newMsgSound = senderName => {
  const sound = new Audio("/light.mp3");

  sound && sound.play();

  if (senderName) {
    document.title = `New message from ${senderName}`;

    //this means if user has our poirot tab opened and not browsing on any other tab then
    if (document.visibilityState === "visible") {
      setTimeout(() => {
        document.title = "Messages";
      }, 5000);
    }
  }
};

export default newMsgSound;
