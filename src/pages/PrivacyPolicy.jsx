import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Last updated: October 2026</p>
      
      <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
        Welcome to our website. We respect your privacy and are committed to protecting your personal data.
      </p>

      <h2 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px' }}>Google AdSense & Cookies</h2>
      <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
        We use Google AdSense to serve ads. Google uses cookies to serve ads based on a user's prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google Ad Settings.
      </p>

      <h2 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px' }}>Contact Us</h2>
      <p style={{ lineHeight: '1.6' }}>
        If you have any questions regarding this Privacy Policy, please contact us.
      </p>
    </div>
  );
};

export default PrivacyPolicy;