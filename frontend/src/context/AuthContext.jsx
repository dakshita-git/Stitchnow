import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

const AuthContext = createContext();

let socketInstance = null;

export const getSocket = () => socketInstance;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null"),
  );

  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const connectSocket = (currentUser) => {
    if (!currentUser?._id && !currentUser?.id) return;

    const userId = currentUser._id || currentUser.id;

    if (!socketInstance) {
      socketInstance = io("http://localhost:5000");
    }

    socketInstance.emit("joinUserRoom", userId);
    socketInstance.off("notification");

    socketInstance.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setToast(notification);

      setTimeout(() => {
        setToast(null);
      }, 5000);
    });
  };

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (error) {
      console.log("Could not load notifications");
    }
  };

  useEffect(() => {
    if (user) {
      connectSocket(user);
      loadNotifications();
    }

    return () => {
      if (socketInstance) {
        socketInstance.off("notification");
      }
    };
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
    connectSocket(data.user);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
    connectSocket(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setNotifications([]);
    setToast(null);

    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        notifications,
        toast,
        setToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
