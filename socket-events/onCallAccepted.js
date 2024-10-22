import { io } from "../server.js";

const onCallAccepted = async (data) => {
  const { ongoingCall } = data;
  console.log("Server handling callAccepted", {
    caller: ongoingCall.participants.caller.socketId,
    receiver: ongoingCall.participants.receiver.socketId,
  });

  // Notify the caller that the call was accepted
  if (ongoingCall.participants.caller.socketId) {
    console.log(
      "Emitting callAccepted to caller",
      ongoingCall.participants.caller.socketId
    );
    io.to(ongoingCall.participants.caller.socketId).emit("callAccepted", {
      ongoingCall: {
        ...ongoingCall,
        isRinging: false, // Ensure isRinging is set to false
      },
    });
  }
};

export default onCallAccepted;
