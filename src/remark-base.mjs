// Prefix root-relative markdown links with the site base (for the github.io preview)
export default function remarkBase() {
  const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
  return (tree) => {
    const walk = (n) => { if ((n.type === 'link' || n.type === 'definition') && typeof n.url === 'string' && n.url.startsWith('/') && !n.url.startsWith('//')) n.url = base + n.url; (n.children || []).forEach(walk); };
    walk(tree);
  };
}
