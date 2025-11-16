import React, { useState, FormEvent } from 'react';
import { Button } from './common/Button';
import { Input } from './common/Input';

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-200">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-teal-400">🏁 Sistema de Regatas</h1>
                    <p className="text-lg text-slate-300">Acesso Administrativo</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
                     <form onSubmit={handleAdminLogin}>
                        <Input
                            label="Usuário"
                            id="username"
                            type="text"
                            placeholder="Seu usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            label="Senha"
                            id="password"
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                            Entrar
                        </Button>
                        {error && <p className="text-rose-400 text-sm mt-3 text-center">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;