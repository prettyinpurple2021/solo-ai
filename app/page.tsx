export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(to bottom right, #f9f0ff, #f0f4ff)'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        textAlign: 'center',
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#6d28d9',
          marginBottom: '20px'
        }}>
          SoloBoss AI
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#4b5563',
          marginBottom: '30px'
        }}>
          Our site is currently under maintenance. We'll be back soon with an amazing experience!
        </p>
        <div style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginTop: '40px'
        }}>
          © 2024 SoloBoss AI. All rights reserved.
        </div>
      </div>
    </div>
  )
}