export function About() {
  return (
    <div className="p-6 space-y-3 text-sm">
      <h2 className="neon-text text-xl tracking-widest">GEEK//OS 1.0 "Cyberglow"</h2>
      <p className="opacity-80">A browser-based, fictional operating system inspired by hacker culture and cyberpunk dev environments.</p>
      <ul className="text-xs opacity-80 list-disc list-inside space-y-1">
        <li>Cinematic boot sequence and CRT effects</li>
        <li>Draggable, resizable windows + draggable desktop icons</li>
        <li>Real navigator-driven System Monitor (CPU, memory, battery, network)</li>
        <li>Terminal with command history, autocomplete, and a real AI assistant (NYX)</li>
        <li>Cyber Lab: SQLi, XSS, CSRF, Path Traversal, JWT, Command Injection</li>
        <li>CTF challenges (multi-stage, crypto, forensics, networking)</li>
        <li>WiFi cracker simulation, Network Visualizer, Password Analyzer, API Inspector</li>
        <li>Achievements, progress persistence, themes &amp; wallpapers</li>
      </ul>
      <p className="text-[10px] opacity-50 pt-3">All "scans", "exploits" and "networks" are simulated for educational purposes only.</p>
    </div>
  );
}
