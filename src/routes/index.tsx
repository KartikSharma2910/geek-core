import { createFileRoute } from "@tanstack/react-router";
import { useOS } from "@/os/store";
import { BootScreen } from "@/os/Boot";
import { Desktop } from "@/os/Desktop";
import { MatrixRain } from "@/os/MatrixRain";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Geek OS — A Cyberpunk Web Operating System" },
      { name: "description", content: "Boot into Geek OS: a browser-based hacker desktop with a real AI terminal, cyber labs (SQLi, XSS, CSRF, JWT), CTF challenges, WiFi cracker simulator and live system monitor." },
      { property: "og:title", content: "Geek OS — A Cyberpunk Web Operating System" },
      { property: "og:description", content: "A futuristic browser OS with a real AI terminal, cyber labs, CTFs and live system monitoring." },
    ],
  }),
  component: Index,
});

function Index() {
  const { booted, matrixBg } = useOS();
  return (
    <>
      {matrixBg && <MatrixRain />}
      {!booted && <BootScreen />}
      {booted && <Desktop />}
    </>
  );
}
