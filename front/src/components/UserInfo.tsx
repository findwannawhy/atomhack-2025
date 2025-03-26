import { useEffect, useState } from "react";

const UserInfo = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);

  return (
    <div className="p-4">
      <span>Вы вошли как: {email || "Гость"}</span>
    </div>
  );
};

export default UserInfo;
