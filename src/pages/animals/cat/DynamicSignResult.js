import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome } from 'react-icons/fa';

export default function DynamicSignResult() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8ecf4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '1.25rem',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        maxWidth: '420px',
        width: '100%',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
        <div style={{ fontSize: '2rem', color: '#43e97b', marginBottom: '0.5rem' }}>
          <FaCheckCircle />
        </div>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: '1.3rem',
          color: '#2d3748',
          marginBottom: '0.5rem',
        }}>
          Successfully Practised!
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1.5rem' }}>
          You have successfully practised the sign language. Keep going!
        </p>
        <button
          onClick={() => navigate('/dashboard-animals')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <FaHome /> Go to Dashboard
        </button>
      </div>
    </div>
  );
}
