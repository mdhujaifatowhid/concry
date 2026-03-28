import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto prose prose-invert prose-sm py-12">
      <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-8">Terms of Service</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">1. Acceptance of Terms</h2>
        <p className="text-gray-400 leading-relaxed">
          By using Concry, you agree to these terms. If you do not agree, do not use the platform. 
          Concry is an anonymous platform for entertainment and support.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">2. User Responsibility</h2>
        <p className="text-gray-400 leading-relaxed">
          You are solely responsible for the content you post. You agree not to:
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-2">
          <li>Expose real identities (names, addresses, phone numbers).</li>
          <li>Post non-consensual sexual content.</li>
          <li>Engage in targeted harassment or bullying.</li>
          <li>Post illegal content or threats of violence.</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">3. Content Removal</h2>
        <p className="text-gray-400 leading-relaxed">
          Concry reserves the right to remove any content at any time for any reason. 
          Content that receives multiple reports may be automatically hidden pending review.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">4. Report & Takedown</h2>
        <p className="text-gray-400 leading-relaxed">
          If you find content that violates these terms or your rights, please use the "Report" button 
          or contact us at <a href="mailto:report@concry.com" className="text-blue-400">report@concry.com</a>.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">5. Disclaimer</h2>
        <p className="text-gray-400 leading-relaxed italic">
          Concry is provided "as is" without warranties of any kind. We are not responsible for 
          the psychological impact of roasts or comments received on this platform.
        </p>
      </section>
    </div>
  );
};

export default Terms;
