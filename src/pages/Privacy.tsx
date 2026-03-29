import React from 'react';
import { Shield, Lock, Eye, Trash2, ShieldAlert } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto pt-12 px-4 space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-black">
          Privacy Policy
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          How we handle your data. Spoiler: We don't.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-black">
            <Lock className="w-6 h-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-black">Data Collection</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            We do not collect personal data. No names, no emails, no phone numbers. 
            We only store the content of your confessions and comments. 
            Your IP address is hashed using a one-way cryptographic function for moderation purposes only. 
            This hash cannot be reversed to find your real IP.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-blue-600">
            <Eye className="w-6 h-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-blue-600">Cookies</h3>
          </div>
          <p className="text-blue-900/60 text-sm leading-relaxed">
            We use local storage to remember your posting history and reaction state. 
            We do not use tracking cookies or third-party analytics that follow you across the web.
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <Trash2 className="w-6 h-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-red-600">Data Deletion</h3>
          </div>
          <p className="text-red-900/60 text-sm leading-relaxed">
            When you post a confession, you are given a secret management link. 
            This is the ONLY way to delete your confession. If you lose this link, 
            we cannot delete it for you as we have no way to verify you are the owner.
          </p>
        </div>

        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-gray-800">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-gray-800">Law Enforcement</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Because we do not store identifying information, we have nothing to provide to law enforcement 
            beyond the public content already visible on the site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
