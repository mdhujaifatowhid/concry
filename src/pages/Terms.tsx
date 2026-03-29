import React from 'react';
import { FileText, ShieldAlert, AlertTriangle, Scale, UserCheck } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto pt-12 px-4 space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-black">
          Terms & Policy
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          The rules of the game. By using CONCRY, you agree to these terms. 
          Read them carefully—or don't, but you're still bound by them.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-black">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tight">Zero-Log Policy</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            We do not store IP addresses, browser fingerprints, or any identifying information in our permanent logs. 
            However, we use temporary hashes to prevent spam and abuse. These hashes are not reversible to your real identity.
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tight">Prohibited Content</h3>
          </div>
          <div className="space-y-4">
            <p className="text-red-900/60 text-sm leading-relaxed">
              While we value unfiltered expression, the following are strictly prohibited and will be deleted:
            </p>
            <ul className="list-disc list-inside text-red-900/60 text-sm space-y-2">
              <li>Real names, addresses, or phone numbers (Doxxing)</li>
              <li>Direct threats of violence or self-harm</li>
              <li>Child exploitation material (Zero tolerance)</li>
              <li>Illegal activities or solicitation</li>
              <li>Spam or commercial advertisements</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-blue-600">
            <Scale className="w-6 h-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tight">User Responsibility</h3>
          </div>
          <p className="text-blue-900/60 text-sm leading-relaxed">
            You are solely responsible for the content you post. CONCRY is a platform, not a publisher. 
            By posting, you grant us a non-exclusive license to display your content. 
            We reserve the right to remove any content at our sole discretion.
          </p>
        </div>

        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-gray-800">
            <UserCheck className="w-6 h-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tight">Age Requirement</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            You must be at least 18 years old to use this platform. Some content may be mature, 
            disturbing, or offensive. Use at your own risk.
          </p>
        </div>
      </div>

      <div className="text-center text-gray-400 text-[10px] uppercase tracking-widest font-bold pt-8">
        Last Updated: March 2026
      </div>
    </div>
  );
};

export default Terms;
