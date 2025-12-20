import React from 'react';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const socials = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/johannes-meyer-young-and-calculated',
    color: 'hover:border-[#0077b5] hover:shadow-[#0077b5]/20',
    text: 'hover:text-[#0077b5]',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8" role="img" aria-labelledby="linkedin-icon">
        <title id="linkedin-icon">LinkedIn</title>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    )
  },
  {
    name: 'GitHub',
    url: 'https://github.com/JohannesMeyerYC',
    color: 'hover:border-white hover:shadow-white/20',
    text: 'hover:text-white',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8" role="img" aria-labelledby="github-icon">
        <title id="github-icon">GitHub</title>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/JenRWVCfzh', 
    color: 'hover:border-[#5865F2] hover:shadow-[#5865F2]/20',
    text: 'hover:text-[#5865F2]',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8" role="img" aria-labelledby="discord-icon">
        <title id="discord-icon">Discord</title>
      </svg>
    )
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@quantenthusiasts',
    color: 'hover:border-[#FF0000] hover:shadow-[#FF0000]/20',
    text: 'hover:text-[#FF0000]',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8" role="img" aria-labelledby="youtube-icon">
        <title id="youtube-icon">YouTube</title>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/quant_enthusiasts',
    color: 'hover:border-[#E1306C] hover:shadow-[#E1306C]/20',
    text: 'hover:text-[#E1306C]',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-labelledby="instagram-icon">
        <title id="instagram-icon">Instagram</title>
      </svg>
    )
  },
  {
    name: 'PayPal',
    url: 'https://paypal.me/youngandcalculated',
    color: 'hover:border-[#0070BA] hover:shadow-[#0070BA]/20',
    text: 'hover:text-[#0070BA]',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8" role="img" aria-labelledby="paypal-icon">
        <title id="paypal-icon">PayPal</title>
      </svg>
    )
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

function About() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
      <Helmet>
        <title>About Johannes Meyer | QuantFinanceWiki</title>
        <meta name="description" content="I'm an 18-year-old building resources for the quantitative finance community." />
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <m.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-16 md:space-y-20"
        >
          {/* Header */}
          <m.section variants={itemVariants} className="text-left max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
              Making Quantitative <br className="hidden md:block"/> Finance Known.
            </h1>
            <div className="h-1.5 w-24 bg-emerald-500 rounded-full mb-10"></div>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
              I’m Johannes Meyer. I’m an 18-year-old from South Africa. In 2026, I’m heading to Stellenbosch University to study Financial Risk Management.
            </p>
          </m.section>

          {/* What I Do - Cleaned Up */}
          <m.section variants={itemVariants} className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-6 text-lg text-slate-300 font-light leading-relaxed">
              <p>
                I spend most of my time coding in <span className="text-emerald-400 font-normal">C++</span> for high-performance systems and Python for machine learning. I invest and trade independently, mostly looking at ETFs and forex.
              </p>
              <p>
                Outside of charts, I run <span className="text-white font-medium">Quant Conversations</span>, a podcast where I talk to professionals. Before this site, I wrote for <em>Young & Calculated</em>, helping students understand finance.
              </p>
            </div>
            <div className="space-y-6 text-lg text-slate-300 font-light leading-relaxed">
              <p>
                I founded <span className="text-white font-medium">Quant Enthusiasts</span>, a community of over 5,000 members across Discord and WhatsApp where students and professionals connect.
              </p>
              <p>
                I built <strong>QuantFinanceWiki</strong> because good info is hard to find. It brings roadmaps, guides, and firm lists into one place. It’s a living resource, built with React and Python.
              </p>
            </div>
          </m.section>

          {/* WSQ Bootcamp */}
          <m.section variants={itemVariants}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 p-8 md:p-10 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 group shadow-lg shadow-black/20">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                    The Wall Street Quants Bootcamp
                  </h2>
                  <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                    If you are looking for structured training, I recommend checking out this bootcamp. You train directly with mentors from top firms to fast-track your career.
                  </p>
                </div>
                <div className="flex-shrink-0 pt-2">
                  <a 
                    href="http://thewallstreetquants.com/survey?ori=jmey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-amber-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] hover:-translate-y-1 active:scale-95 whitespace-nowrap"
                  >
                    View Bootcamp
                  </a>
                </div>
              </div>
            </div>
          </m.section>

          {/* Connect / Socials Grid */}
          <m.section variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-8">Connect with me</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-xl border border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 ${social.color}`}
                >
                  <div className={`mb-3 text-slate-400 transition-colors duration-300 ${social.text}`}>
                    {social.icon}
                  </div>
                  <span className={`font-medium text-slate-400 transition-colors duration-300 ${social.text}`}>
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </m.section>

          {/* Contact Footer */}
          <m.section variants={itemVariants} className="pt-12 border-t border-slate-800 text-center md:text-left">
            <h2 className="text-xl font-bold text-white mb-2">Business Inquiries</h2>
            <p className="text-slate-400 mb-4">
              I’m open to brand or business collaborations.
            </p>
            <a href="mailto:johannesmeyer2017@gmail.com" className="text-2xl md:text-3xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors tracking-tight">
              johannesmeyer2017@gmail.com
            </a>
          </m.section>
        </m.div>
      </main>
    </div>
  );
}

export default About;