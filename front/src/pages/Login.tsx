import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3100/login", {
        email: email,
        pass: password,
      });
      
      if (response.status === 200) {
        localStorage.setItem("email", email);
        navigate("/");
      }
    } catch (error) {
      console.error("Ошибка входа", error);
      alert("Ошибка входа! Неверный логин или пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">С возвращением</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Адрес электронной почты" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full"
            />
            <Input 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Загрузка..." : "Продолжить"}
            </Button>
          </form>
          <p className="mt-4 text-center">
            У вас нет учетной записи?{" "}
            <Link to="/register" className="text-primary underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
