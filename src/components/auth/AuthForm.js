// src/components/AuthForm.js
import { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async () => {
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                alert('Logged in successfully');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                alert('Account created successfully');
            }
        } catch (error) {
            console.error("Error in authentication: ", error.message);
        }
    };

    return (
        <div>
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={handleAuth}>
                {isLogin ? "Login" : "Sign Up"}
            </button>
            <p onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </p>
        </div>
    );
}

export default AuthForm;
