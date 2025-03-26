import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <Button onClick={handleLogout} variant="destructive">
      Выйти
    </Button>
  );
};

export default LogoutButton;
