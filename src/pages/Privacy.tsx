import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto prose prose-invert prose-sm py-12">
      <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-8">Privacy Policy</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">1. Data Collection</h2>
        <p className="text-gray-400 leading-relaxed">
          Concry does not require accounts. We do not collect your name, email, or profile information. 
          However, to prevent abuse and ensure safety, we collect:
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-2">
          <li>IP Address hashes (for rate limiting and reporting).</li>
          <li>Timestamps of your posts and comments.</li>
          <li>The content you voluntarily submit.</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">2. Data Usage</h2>
        <p className="text-gray-400 leading-relaxed">
          Your data is used solely to:
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-2">
          <li>Display your confessions and comments to others.</li>
          <li>Prevent spam and platform abuse.</li>
          <li>Comply with legal requests if necessary.</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">3. Cookies</h2>
        <p className="text-gray-400 leading-relaxed">
          We use local storage to remember your rate-limiting history on your device. 
          We do not use tracking cookies for advertising.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">4. Data Retention</h2>
        <p className="text-gray-400 leading-relaxed">
          Confessions remain on the platform until deleted by the owner using their secret link 
          or removed by administrators due to violations.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">5. Third Parties</h2>
        <p className="text-gray-400 leading-relaxed">
          We use Supabase for database hosting. Your data is stored securely on their infrastructure. 
          We do not sell your data to third parties.
        </p>
      </section>
    </div>
  );
};

export default Privacy;
