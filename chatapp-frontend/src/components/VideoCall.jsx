import React, { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";
import "./VideoCall.css";

const VideoCall = ({ currentUserId, selectedUser }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const peerConnection = useRef(null);

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    socket.on("offer", async (offer) => {
      if (!selectedUser) return;
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

      peerConnection.current.ontrack = (event) => {
        userVideo.current.srcObject = event.streams[0];
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, to: selectedUser._id });
        }
      };

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", { answer, to: selectedUser._id });
    });

    socket.on("answer", async (answer) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      setCallAccepted(true);
    });

    socket.on("ice-candidate", async (data) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [selectedUser]);

  const startCall = async () => {
    if (!selectedUser) return alert("Select a user to call!");
    setIsCalling(true);

    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current.ontrack = (event) => {
      userVideo.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, to: selectedUser._id });
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    myVideo.current.srcObject = stream;
    stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("offer", { offer, to: selectedUser._id });
  };

  return (
    <div className="video-call-container">
      <video ref={myVideo} autoPlay muted className="my-video" />
      <video ref={userVideo} autoPlay className="user-video" />
      <button onClick={startCall} disabled={isCalling}>Start Video Call</button>
    </div>
  );
};

export default VideoCall;
