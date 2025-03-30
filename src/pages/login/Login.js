import React, { useState } from 'react';
import { auth, googleProvider } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import './login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <section className="vh-100">
            <div className="container pb-5 h-100">
                <div className="row d-flex align-items-center justify-content-center h-100">
                    {/* Left Column with Image */}
                    <div className="col-md-8 col-lg-7 col-xl-6">
                        <img
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                            className="img-fluid"
                            alt="Login"
                        />
                    </div>

                    {/* Right Column with Form */}
                    <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                        <form onSubmit={handleSignIn}>
                            {/* Email input */}
                            <div className="form-outline mb-4">
                                <input
                                    type="email"
                                    id="form1Example13"
                                    className="form-control form-control-lg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <label className="form-label" htmlFor="form1Example13">
                                    Email address
                                </label>
                            </div>

                            {/* Password input */}
                            <div className="form-outline mb-4">
                                <input
                                    type="password"
                                    id="form1Example23"
                                    className="form-control form-control-lg"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <label className="form-label" htmlFor="form1Example23">
                                    Password
                                </label>
                            </div>

                            {/* Error message */}
                            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                            {/* Submit button */}
                            <button type="submit" className="btn btn-primary btn-lg btn-block">
                                Sign in
                            </button>

                            {/* Register route */}
                            <div className="text-center mt-3">
                                <p>Don't have an account? <Link to="/register">Register here</Link></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}