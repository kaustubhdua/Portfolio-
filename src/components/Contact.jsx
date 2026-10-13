import { useState } from 'react';
import { FaCopy, FaEnvelope, FaFileArrowDown, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { Section, Reveal } from './ui.jsx';
import Sprite from './Sprite.jsx';
import { profile, sections } from '../data/profile.js';

const meta = sections.find((s) => s.id === 'contact');

export default function Contact() {
  const [copied, setCopied] = useState('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.links.email);
      setCopied('Email address copied.');
    } catch {
      setCopied(`Copy failed. Address: ${profile.links.email}`);
    }
    setTimeout(() => setCopied(''), 3000);
  };
  return (
    <Section id="contact" {...meta} title="Ender Chest" lead="Open to conversations about projects and collaboration.">
      <Reveal className="panel chest">
        <Sprite name="ender" size={72} />
        <p>The most direct way to reach me is email. LinkedIn works too, and my code lives on GitHub.</p>
        <div className="chest-actions">
          <a className="btn btn-primary pixel" href={`mailto:${profile.links.email}`}>
            <FaEnvelope aria-hidden="true" /> Email
          </a>
          <button type="button" className="btn btn-secondary pixel" onClick={copy}>
            <FaCopy aria-hidden="true" /> Copy address
          </button>
          <a className="btn btn-secondary pixel" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn aria-hidden="true" /> LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="btn btn-secondary pixel" href={profile.links.resume} download>
            <FaFileArrowDown aria-hidden="true" /> Download CV<span className="sr-only"> (PDF)</span>
          </a>
          <a className="btn btn-secondary pixel" href={profile.links.github} target="_blank" rel="noopener noreferrer">
            <FaGithub aria-hidden="true" /> GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <p className="chest-note" role="status">{copied}</p>
      </Reveal>
    </Section>
  );
}
