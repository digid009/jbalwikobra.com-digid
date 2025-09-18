import React from 'react';

export default function MaintenancePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>Under Maintenance</h1>
      <p>We're currently performing maintenance. Please check back soon.</p>
    </div>
  );
}