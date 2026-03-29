import React from 'react';
import { Info, Shield, Heart, Flame, Zap } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto pt-12 px-4 space-y-16 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-black">
          About CONCRY
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          The anonymous confession platform where your secrets meet their destiny. 
          No accounts, no logs, just raw human truth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight">Total Anonymity</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            We don't ask for your name, email, or social profiles. Your identity is protected by our zero-log policy. 
            Once you post, it's out there—unfiltered and untraceable.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight text-blue-600">Help Section</h3>
          <p className="text-blue-900/60 text-sm leading-relaxed">
            Sometimes we just need to be heard. The Help section is for those seeking support, advice, or just a digital hug. 
            Kindness is the currency here.
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight text-red-600">Humiliate Section</h3>
          <p className="text-red-900/60 text-sm leading-relaxed">
            For the brave and the thick-skinned. The Humiliate section is where roasts happen. 
            Expect harsh truths, sharp wit, and zero sugar-coating.
          </p>
        </div>

        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight">Controlled Chaos</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            CONCRY is an experiment in human expression. We provide the platform, you provide the content. 
            We moderate only to prevent real-world harm, leaving the rest to the community.
          </p>
        </div>
      </div>

      <div className="bg-black text-white rounded-[40px] p-12 text-center space-y-6">
        <h2 className="text-3xl font-black uppercase italic tracking-tight">Join the Experiment</h2>
        <p className="text-gray-400 max-w-md mx-auto text-sm">
          Ready to release your secret? Or are you here to judge others? 
          Either way, you're part of the destiny now.
        </p>
        <div className="pt-4">
          <a href="/create" className="inline-block px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-gray-200 transition-all">
            Start Confessing
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
