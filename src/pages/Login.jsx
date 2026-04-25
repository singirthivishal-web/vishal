import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if(email && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-danger/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-surface/80 backdrop-blur-xl border border-secondary/30 w-full max-w-md rounded-3xl shadow-2xl p-8 z-10">
        <div className="flex justify-center mb-8">
           <div className="bg-background p-4 rounded-2xl border border-secondary/20 shadow-inner">
             <Layout className="w-10 h-10 text-primary" />
           </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-textMain mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-textMuted text-sm">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1.5 ml-1">Email Address</label>
            <input 
              type="email"
              required
              className="w-full bg-background border border-secondary/30 rounded-xl px-4 py-3 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-secondary" 
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1.5 ml-1">Password</label>
            <input 
              type="password"
              required
              className="w-full bg-background border border-secondary/30 rounded-xl px-4 py-3 text-textMain focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-secondary" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-secondary/30 bg-background text-primary focus:ring-primary focus:ring-offset-background" />
              <span className="text-sm text-textMuted">Remember me</span>
            </label>
            <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-textMuted">
            Don't have an account? <a href="#" className="text-primary hover:underline font-medium">Sign up for free</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
