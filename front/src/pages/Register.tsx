import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// Импортируем shadcn компоненты
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3100/register", {
        email: email,
        pass: password,
      });
      if (response.status === 201) {
        alert("Регистрация успешна!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Ошибка регистрации", error);
      alert("Ошибка регистрации! Возможно, email уже занят.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Создать учетную запись</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Адрес электронной почты</label>
              <Input 
                type="email" 
                placeholder="Введите email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Пароль</label>
              <Input 
                type="password" 
                placeholder="Введите пароль" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Загрузка..." : "Продолжить"}
            </Button>
          </form>
          <p className="mt-4 text-center">
            У вас уже есть учетная запись?{" "}
            <Link to="/login" className="text-primary underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
