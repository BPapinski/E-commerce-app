import useApi from "../../pages/utils/api";

const useNotificationActions = () => {
  const { authFetch } = useApi();

  const markNotificationsAsRead = async () => {
    try {
      const res = await authFetch("http://127.0.0.1:8000/api/store/notifications/read/", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Błąd przy oznaczaniu powiadomień jako przeczytane");
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("markNotificationsAsRead error:", err);
      throw err;
    }
  };

  return { markNotificationsAsRead };
};

export default useNotificationActions;
