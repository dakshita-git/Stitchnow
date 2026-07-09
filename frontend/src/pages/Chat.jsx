import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send, Image as ImageIcon } from "lucide-react";
import { useAuth, getSocket } from "../context/AuthContext";
import api from "../services/api";

let typingTimeout;

export default function Chat() {
  const { bookingId } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const currentUserId = user?._id || user?.id;

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/chat/${bookingId}`);
      setMessages(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load chat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [bookingId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("joinBookingRoom", bookingId);

    socket.off("chatMessage");
    socket.off("userTyping");
    socket.off("userStoppedTyping");

    socket.on("chatMessage", (message) => {
      const roomId = message.booking?._id || message.booking;
      if (roomId !== bookingId) return;

      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === message._id);
        return exists ? prev : [...prev, message];
      });
    });

    socket.on("userTyping", ({ bookingId: roomId, userName }) => {
      if (roomId === bookingId) setTypingUser(userName || "Someone");
    });

    socket.on("userStoppedTyping", ({ bookingId: roomId }) => {
      if (roomId === bookingId) setTypingUser("");
    });

    return () => {
      socket.emit("leaveBookingRoom", bookingId);
      socket.off("chatMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleTyping = (e) => {
    setText(e.target.value);

    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing", {
      bookingId,
      userName: user?.name || "User",
    });

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", { bookingId });
    }, 1000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!selectedImage) return "";

    const formData = new FormData();
    formData.append("image", selectedImage);

    const { data } = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.imageUrl;
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !selectedImage) return;

    try {
      setSending(true);

      const socket = getSocket();
      socket?.emit("stopTyping", { bookingId });

      let imageUrl = "";

      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const { data } = await api.post("/chat", {
        bookingId,
        message: text.trim(),
        image: imageUrl,
      });

      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === data._id);
        return exists ? prev : [...prev, data];
      });

      setText("");
      setSelectedImage(null);
      setPreview("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="chat-page">
      <section className="chat-box">
        <div className="chat-header">
          <Link to="/orders" className="chat-back">
            <ArrowLeft size={18} />
            Back
          </Link>

          <div>
            <h2>StitchNow Chat</h2>
            <p>Talk directly with the boutique</p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="chat-messages">
          {loading ? (
            <div className="chat-empty">
              <h3>Loading conversation...</h3>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <h3>No messages yet</h3>
              <p>Start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMine = senderId === currentUserId;

              return (
                <div
                  key={msg._id}
                  className={`chat-message ${isMine ? "mine" : "theirs"}`}
                >
                  <div className="chat-bubble">
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="chat-image"
                      />
                    )}

                    {msg.message && <p>{msg.message}</p>}

                    <small>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                </div>
              );
            })
          )}

          {typingUser && (
            <div className="typing-indicator">{typingUser} is typing...</div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {preview && (
          <div className="chat-image-preview">
            <img src={preview} alt="Preview" />
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setPreview("");
              }}
            >
              Remove
            </button>
          </div>
        )}

        <form className="chat-input-form" onSubmit={sendMessage}>
          <label className="chat-upload-btn">
            <ImageIcon size={20} />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </label>

          <input
            value={text}
            onChange={handleTyping}
            placeholder="Type your message..."
          />

          <button type="submit" disabled={sending}>
            <Send size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}
