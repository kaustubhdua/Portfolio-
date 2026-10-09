import { FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { Section, Reveal } from './ui.jsx';
import Sprite from './Sprite.jsx';
import { profile, sections } from '../data/profile.js';

const meta = sections.find((s) => s.id === 'contact');

export default function Contact() {
  return (
    <Section id="contact" {...meta} title="Ender Chest" lead="Open to conversations about projects and collaboration.">
      <Reveal className="panel chest">
        <Sprite name="ender" size={72} />
        <p>The fastest way to reach me is LinkedIn. My code, issues and discussions live on GitHub.</p>
        <div className="chest-actions">
          <a className="btn btn-primary pixel" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn aria-hidden="true" /> LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="btn btn-secondary pixel" href={profile.links.github} target="_blank" rel="noopener noreferrer">
            <FaGithub aria-hidden="true" /> GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
