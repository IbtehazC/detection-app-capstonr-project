import { io } from "../server.js";

const onCallRejected = async (data) => {
  const { ongoingCall } = data;

  // Notify the caller that the call was rejected
  if (ongoingCall.participants.caller.socketId) {
    io.to(ongoingCall.participants.caller.socketId).emit("callRejected", {
      ongoingCall,
    });
  }
};

export default onCallRejected;
