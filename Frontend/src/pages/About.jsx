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
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" role="img" aria-labelledby="linkedin-icon">
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
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" role="img" aria-labelledby="github-icon">
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
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" role="img" aria-labelledby="discord-icon">
        <title id="discord-icon">Discord</title>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>
      </svg>
    )
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@quantenthusiasts',
    color: 'hover:border-[#FF0000] hover:shadow-[#FF0000]/20',
    text: 'hover:text-[#FF0000]',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" role="img" aria-labelledby="youtube-icon">
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
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" role="img" aria-labelledby="instagram-icon">
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
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" role="img" aria-labelledby="paypal-icon">
        <title id="paypal-icon">PayPal</title>
      </svg>
    )
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
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
        <title>About Johannes Meyer & Legal Information | QuantFinanceWiki</title>
        <meta name="description" content="Information about Johannes Meyer, creator of QuantFinanceWiki. Includes Privacy Policy, Terms & Conditions, Disclaimer, and Copyright Notice." />
      </Helmet>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <m.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-16 md:space-y-24"
        >
          {/* Header */}
          <m.section variants={itemVariants} className="text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              About This Website
            </h1>
            <div className="h-1.5 w-20 bg-emerald-500 rounded-full mb-8"></div>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
              This website is built and maintained by Johannes Meyer. I am an 18-year-old from South Africa. In 2026, I will study Financial Risk Management at Stellenbosch University.
            </p>
          </m.section>

          {/* What I Do */}
          <m.section variants={itemVariants} className="space-y-8">
            <div className="space-y-6 text-base md:text-lg text-slate-300 font-light leading-relaxed">
              <p>
                I code in C++ for high-performance systems and Python for machine learning. I also invest and trade independently, focusing on ETFs and forex markets.
              </p>
              <p>
                I run Quant Conversations, a podcast where I interview professionals in quantitative finance. Before creating this site, I wrote articles for Young & Calculated to help students understand finance topics.
              </p>
              <p>
                I founded Quant Enthusiasts, a community with over 5,000 members across Discord and WhatsApp. This community connects students and professionals interested in quantitative finance.
              </p>
              <p>
                I built QuantFinanceWiki because quality information about quantitative finance careers is difficult to find. This site brings together roadmaps, guides, and firm information in one place. It is built with React and Python and is updated regularly.
              </p>
            </div>
          </m.section>

          {/* WSQ Bootcamp */}
          <m.section variants={itemVariants}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 md:p-8 rounded-xl border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 group shadow-lg shadow-black/20">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                    The Wall Street Quants Bootcamp
                  </h2>
                  <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                    If you want structured training, consider this bootcamp. You work directly with mentors from top firms to prepare for quantitative finance careers.
                  </p>
                </div>
                <div className="flex-shrink-0 pt-2">
                  <a 
                    href="http://thewallstreetquants.com/survey?ori=jmey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-amber-950 bg-amber-500 hover:bg-amber-400 rounded-lg md:rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] hover:-translate-y-1 active:scale-95 whitespace-nowrap"
                  >
                    View Bootcamp
                  </a>
                </div>
              </div>
            </div>
          </m.section>

          {/* Connect Section */}
          <m.section variants={itemVariants}>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Connect</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 mb-12">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col items-center justify-center p-4 md:p-6 bg-slate-900/50 rounded-lg md:rounded-xl border border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 ${social.color}`}
                >
                  <div className={`mb-2 md:mb-3 text-slate-400 transition-colors duration-300 ${social.text}`}>
                    {social.icon}
                  </div>
                  <span className={`font-medium text-sm md:text-base text-slate-400 transition-colors duration-300 ${social.text}`}>
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
            
            <div className="pt-8 border-t border-slate-800">
              <h3 className="text-lg font-bold text-white mb-3">Business Inquiries</h3>
              <p className="text-slate-400 mb-4">
                I consider brand collaborations and business opportunities.
              </p>
              <a href="mailto:johannesmeyer2017@gmail.com" className="text-lg md:text-xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors tracking-tight">
                johannesmeyer2017@gmail.com
              </a>
            </div>
          </m.section>

          {/* Legal Sections */}
          <m.section variants={itemVariants} className="space-y-16">
            
            {/* Privacy Policy */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Privacy Policy</h2>
              <div className="space-y-4 text-slate-300 text-sm md:text-base">
                <p>
                  This website does not collect personal information unless you provide it directly. If you subscribe to the newsletter, your email address is stored with Substack, our email service provider. You can unsubscribe at any time.
                </p>
                <p>
                  We use basic analytics to understand website traffic. This includes counting page views and visitor locations. We do not use this information to identify individual users.
                </p>
                <p>
                  Third-party services like Substack and social media platforms have their own privacy policies. We do not control how they handle your data.
                </p>
                <p>
                  If you have questions about privacy, contact johannesmeyer2017@gmail.com.
                </p>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Terms & Conditions</h2>
              <div className="space-y-4 text-slate-300 text-sm md:text-base">
                <p>
                  By using this website, you agree to these terms. All content is for informational purposes only. You may read and download content for personal use.
                </p>
                <p>
                  You may not copy, distribute, or sell the content without permission. You may not use automated systems to scrape or collect data from this website.
                </p>
                <p>
                  The content is provided as is. We make no guarantees about accuracy or completeness. We may update or remove content without notice.
                </p>
                <p>
                  Links to external sites are provided for reference. We do not control those sites and are not responsible for their content.
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Disclaimer</h2>
              <div className="space-y-4 text-slate-300 text-sm md:text-base">
                <p>
                  The information on this website is for educational purposes only. It is not financial advice. Do not make investment decisions based on this content.
                </p>
                <p>
                  Quantitative finance involves risk. Trading and investing can result in financial loss. Past performance does not indicate future results.
                </p>
                <p>
                  The career information represents general industry observations. Individual experiences may vary. Job markets change over time.
                </p>
                <p>
                  We are not responsible for any decisions you make based on this information. Consult qualified professionals for specific advice.
                </p>
              </div>
            </div>

            {/* Copyright Notice */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Copyright Notice</h2>
              <div className="space-y-4 text-slate-300 text-sm md:text-base">
                <p>
                  Copyright © 2024 Johannes Meyer. All rights reserved.
                </p>
                <p>
                  All original content on this website, including text, images, and design, is owned by Johannes Meyer. This includes roadmaps, articles, and resource materials.
                </p>
                <p>
                  You may share links to this website. You may quote short excerpts with attribution. For other uses, contact johannesmeyer2017@gmail.com for permission.
                </p>
                <p>
                  Some content may include third-party materials used under fair use or with permission. Those materials remain property of their respective owners.
                </p>
                <p>
                  This website is built with React and other open-source technologies. Those technologies have their own licenses.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
              <p>Last updated: December 2024</p>
              <p className="mt-2">QuantFinanceWiki.com is created and maintained by Johannes Meyer</p>
            </div>
          </m.section>
        </m.div>
      </main>
    </div>
  );
}

export default About;