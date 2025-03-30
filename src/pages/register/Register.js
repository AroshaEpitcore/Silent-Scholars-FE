import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import './register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    name: name,
                    email: email,
                });

                navigate('/');
            } catch (error) {
                setErrorMessage(error.message);
            }
        },
        [email, password, name, navigate]
    );

    return (
        <>
            <section className="vh-100">
                <div className="container pb-5 h-100">
                    <div className="row d-flex align-items-center justify-content-center h-100">
                        <div className="col-md-8 col-lg-7 col-xl-6">
                            <img
                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                                className="img-fluid"
                                alt="Phone"
                            />
                        </div>
                        <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                            <form onSubmit={handleSubmit}>
                                {/* Name input */}
                                <div className="form-outline mb-4">
                                    <input
                                        type="text"
                                        id="form1ExampleName"
                                        className="form-control form-control-lg"
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        required
                                    />
                                    <label className="form-label" htmlFor="form1ExampleName">
                                        Name
                                    </label>
                                </div>

                                {/* Email input */}
                                <div className="form-outline mb-4">
                                    <input
                                        type="email"
                                        id="form1Example13"
                                        className="form-control form-control-lg"
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
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
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
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
                                    Sign Up
                                </button>

                                {/* Login page navigation */}
                                <div className="text-center mt-3">
                                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Register;