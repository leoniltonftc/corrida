import React, { useState, FormEvent } from 'react';
import { Button } from './common/Button';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                onLogin();
            } else {
                setError('Usuário ou senha incorretos.');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">🏁 Sistema de Regatas</h1>
                    <p className="text-lg opacity-90">Acesso Administrativo</p>
                </div>
                <div className="bg-white/95 text-gray-800 rounded-2xl p-8 shadow-2xl">
                     <form onSubmit={handleAdminLogin}>
                        <input
                            type="text"
                            placeholder="Usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 mb-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 mb-4 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Entrar
                        </Button>
                        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;