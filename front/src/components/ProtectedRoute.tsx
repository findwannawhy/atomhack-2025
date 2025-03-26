import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = () => {
  /*
  const [isAuth, setIsAuth] = useState(null); // null - проверка ещё не завершена

  useEffect(() => {
    axios
      .get("http://localhost:3100/", { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      })
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) {
    return <div>Загрузка...</div>;
  }
  */

  return true ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
