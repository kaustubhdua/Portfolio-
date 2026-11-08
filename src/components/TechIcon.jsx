const marks = {
  python: 'Py', typescript: 'TS', javascript: 'JS', cpp: 'C++', htmlcss: '5',
  react: 'R', nextjs: 'N', vite: 'V', tailwind: 'TW', threejs: '3D',
  fastapi: 'API', supabase: 'S', rest: 'HTTP', postgres: 'PG', ortools: 'OR',
  docker: 'D', git: 'Git', githubactions: 'CI', ollama: 'O', appium: 'A',
  pytorch: 'PT', opencv: 'CV', sqlite: 'SQL', streamlit: 'ST', linux: 'L',
};

/** Lightweight, readable technology marks avoid shipping a large icon font bundle. */
export default function TechIcon({ item }) {
  const mark = item.glyph || marks[item.id] || item.name.slice(0, 2).toUpperCase();
  return <span className="glyph tech-mark pixel" aria-hidden="true">{mark}</span>;
}
