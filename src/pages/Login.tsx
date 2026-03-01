import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, LogIn, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Optionally, automatically prompt them when they arrive on the login page:
            setTimeout(() => {
                const wantToInstall = window.confirm("Would you like to install the App for a better experience?");
                if (wantToInstall) {
                    e.prompt();
                    e.userChoice.then((choiceResult: any) => {
                        if (choiceResult.outcome === 'accepted') {
                            setDeferredPrompt(null);
                        }
                    });
                }
            }, 1000);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, password, remember);
            toast({ title: 'Success', description: 'Logged in successfully' });
            // Let the user install the app if they chose not to before logging in
            if (deferredPrompt) {
                handleInstall();
            }
            navigate('/');
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Login failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md glass-card p-8 space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <LogIn className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground">Log in to manage your budget</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Username"
                                className="pl-9 bg-secondary border-border"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="pl-9 pr-10 bg-secondary border-border"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 text-sm text-muted-foreground cursor-pointer">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="rounded border-border text-primary focus:ring-primary bg-secondary"
                            />
                            <span>Remember me</span>
                        </label>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
