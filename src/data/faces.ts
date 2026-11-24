export const faces = [
  {
    id: "hero",
    name: "Solo",
    description:
      "Jeden agent na całym ekranie. Dotknij go, aby zobaczyć aktualne zadanie i kolejkę. Powrót przywraca widok agentów.",
    group: "focus",
    label: "Duży agent",
  },
  ...([
    ["equalizer", "Equalizer", "Agent i animowany equalizer pokazują jego bieżącą aktywność."],
    ["cosmos", "Kosmos", "Agent w spokojnej, animowanej przestrzeni orbitalnej."],
    ["radar", "Radar", "Agent w centrum technicznego radaru z poruszającymi się znacznikami."],
    ["waves", "Fale", "Agent otoczony płynną animacją fal."],
    ["spectrum", "Spektrum", "Pulsujące słupki wizualizują aktywność agenta."],
    ["orbitals", "Orbity", "Poruszające się punkty i orbity otaczają agenta."],
    ["rings", "Pierścienie", "Koncentryczne pierścienie reagują na pracę agenta."],
    ["pulse", "Puls", "Subtelny puls i świetlne znaczniki podkreślają status agenta."],
  ] as const).map(([id, name, description]) => ({
    id,
    name,
    description: `${description} Dotknij agenta, aby zobaczyć jego aktualne zadanie i kolejkę.`,
    group: "focus" as const,
    label: "Jeden agent",
  })),
  {
    id: "duo",
    name: "Duet",
    description:
      "Dotknij lewego lub prawego agenta, aby otworzyć jego zadania. Każdy ma własną kolejkę. Powrót przywraca duet.",
    group: "team",
    label: "Dwóch agentów",
  },
  {
    id: "grid",
    name: "Zespół",
    description:
      "Czterech agentów i ich statusy w jednym spojrzeniu. Dotknij wybranej postaci, aby otworzyć jej zadania.",
    group: "team",
    label: "Siatka 2 × 2",
  },
  {
    id: "op1",
    name: "OP‑1",
    description:
      "Twój oryginalny panel z animowanymi wskaźnikami. Dotknij panelu agenta, aby zobaczyć jego pracę.",
    group: "team",
    label: "Panel zespołu",
  },
  {
    id: "cow",
    name: "Cow Engine",
    description:
      "Neonowa krowa i puls pracy. Dotknij jednej z postaci pod grafiką, aby otworzyć jej zadania.",
    group: "ambient",
    label: "Neonowy silnik",
  },
  {
    id: "terminal",
    name: "Terminal",
    description:
      "Nazwy, statusy i kolejka w technicznym widoku. Dotknij wiersza agenta, aby zobaczyć szczegóły jego pracy.",
    group: "team",
    label: "Lista agentów",
  },
  {
    id: "orbit",
    name: "Orbita",
    description:
      "Agent w centrum. Spokojny puls, gdy pracuje. Dotknij awatara, aby otworzyć zadania.",
    group: "focus",
    label: "Duży agent",
  },
  {
    id: "split",
    name: "Dwa rytmy",
    description:
      "Dwie kolorowe karty z niezależnymi statusami. Dotknij wybranego agenta, aby zobaczyć jego zadania.",
    group: "team",
    label: "Dwóch agentów",
  },
  {
    id: "quiet",
    name: "Spokój",
    description:
      "Wyrazisty awatar i minimum informacji. Dotknij agenta, aby zajrzeć do jego zadań.",
    group: "ambient",
    label: "Widok minimalistyczny",
  },
] as const;

export type FaceId = (typeof faces)[number]["id"];
