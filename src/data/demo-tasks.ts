import type { FaceId } from "./faces";

export type DemoTask = { current: string; detail: string; queue: string[] };
type AgentTasks = [DemoTask, DemoTask, DemoTask, DemoTask];

const tasks: AgentTasks = [
  {
    current: "Podłączam Marsa do Wi‑Fi",
    detail: "Szukam przedłużacza na 225 mln km.",
    queue: [
      "Zrobić backup internetu na pendrive",
      "Nauczyć gołębie obsługi Excela",
    ],
  },
  {
    current: "Wyłączam poniedziałki",
    detail: "Piątek zaakceptował pull request.",
    queue: ["Przyspieszyć obrót Ziemi", "Zainstalować cierpliwość"],
  },
  {
    current: "Naprawiam drukarkę telepatią",
    detail: "Drukarka nadal twierdzi, że nie ma papieru.",
    queue: [],
  },
  {
    current: "Kompiluję sens życia",
    detail: "Błąd w linii 42. Brak dokumentacji.",
    queue: ["Znaleźć kopię zapasową mamuta", "Znaleźć początek taśmy klejącej"],
  },
];

const duetTasks: AgentTasks = [
  {
    current: "Wyjaśnić kotu, kto tu płaci czynsz",
    detail: "Negocjacje trwają. Kot wskazał na miskę.",
    queue: [
      "Uzyskać zgodę kota na pracę",
      "Odzyskać fotel od właściciela ogona",
    ],
  },
  {
    current: "Przenoszę chmury do chmury",
    detail: "Deszcz przekroczył limit darmowego planu.",
    queue: ["Zabezpieczyć burzę hasłem", "Wysuszyć kopię zapasową"],
  },
  {
    current: "Rozplątuję słuchawki siłą woli",
    detail: "Kabel zgłosił sprzeciw.",
    queue: [],
  },
  {
    current: "Negocjuję z czarną dziurą",
    detail: "Wysłałem ofertę. Wszystko wciągnęła.",
    queue: ["Wyłączyć echo we Wszechświecie", "Odzyskać skarpetki z pralki"],
  },
];

export const featuredTasks: AgentTasks = [
  {
    current: "Aktualizuję grawitację",
    detail: "Proszę przez chwilę nie podskakiwać.",
    queue: ["Przetestować lądowanie kanapki", "Dokręcić pierścienie Saturna"],
  },
  {
    current: "Cofam epokę lodowcową",
    detail: "Rozmrażanie planety: 3%. Pozostało 12 tys. lat.",
    queue: ["Odpowietrzyć wulkan", "Sprawdzić termin ważności lodowca"],
  },
  {
    current: "Uczę budzik empatii",
    detail: "Rozmowę przełożono na jeszcze pięć minut.",
    queue: [],
  },
  {
    current: "Szukam końca internetu",
    detail: "Za ostatnią stroną też jest przycisk Dalej.",
    queue: [
      "Policzyć wszystkie ciasteczka",
      "Zamknąć ostatnią kartę przeglądarki",
    ],
  },
];

export const tasksByFace: Record<FaceId, AgentTasks> = {
  hero: tasks,
  equalizer: [
    { current: "Przeglądam zgłoszenia", detail: "Porządkuję nowe zadania według priorytetu.", queue: ["Przygotować krótkie podsumowanie"] },
    { current: "Analizuję zmiany w projekcie", detail: "Sprawdzam ostatnie aktualizacje plików.", queue: ["Zebrać wyniki do raportu"] },
    { current: "Aktualizuję dokumentację", detail: "Dopisuję informacje do bieżącej wersji.", queue: ["Sprawdzić odnośniki"] },
    { current: "Przygotowuję zestawienie", detail: "Zbieram dane z wybranych źródeł.", queue: ["Udostępnić gotowy wynik"] },
  ],
  cosmos: [
    { current: "Porządkuję pliki projektu", detail: "Grupuję materiały według tematu.", queue: ["Oznaczyć najnowszą wersję"] },
    { current: "Sprawdzam zadania zespołu", detail: "Aktualizuję listę bieżących prac.", queue: ["Przekazać krótkie podsumowanie"] },
    { current: "Przygotowuję odpowiedź", detail: "Zbieram najważniejsze informacje.", queue: ["Sprawdzić treść przed wysłaniem"] },
    { current: "Analizuję notatki", detail: "Wyodrębniam ustalenia i kolejne kroki.", queue: ["Uzupełnić listę zadań"] },
  ],
  radar: [
    { current: "Weryfikuję nowe dane", detail: "Sprawdzam kompletność otrzymanych informacji.", queue: ["Oznaczyć brakujące pozycje"] },
    { current: "Przygotowuję analizę", detail: "Porównuję bieżące wyniki z poprzednimi.", queue: ["Zapisać wnioski"] },
    { current: "Aktualizuję plan pracy", detail: "Dopasowuję kolejność zadań do priorytetów.", queue: ["Udostępnić nowy plan"] },
    { current: "Przeglądam dokumenty", detail: "Wyszukuję najważniejsze zmiany.", queue: ["Przekazać podsumowanie"] },
  ],
  waves: [
    { current: "Tworzę podsumowanie", detail: "Zbieram ustalenia z ostatniego etapu.", queue: ["Przygotować wersję do przeglądu"] },
    { current: "Opracowuję materiały", detail: "Porządkuję treść i uzupełniam szczegóły.", queue: ["Sprawdzić gotowy dokument"] },
    { current: "Sprawdzam poprawki", detail: "Weryfikuję zmiany przed kolejnym krokiem.", queue: ["Zamknąć ukończone zadania"] },
    { current: "Przygotowuję raport", detail: "Układam wyniki w czytelne zestawienie.", queue: ["Dodać końcowe uwagi"] },
  ],
  spectrum: [
    { current: "Porównuję wersje", detail: "Sprawdzam różnice między plikami.", queue: ["Zachować zatwierdzone zmiany"] },
    { current: "Aktualizuję listę zadań", detail: "Oznaczam bieżący postęp zespołu.", queue: ["Ustawić następny priorytet"] },
    { current: "Przeglądam wyniki", detail: "Wybieram dane potrzebne do podsumowania.", queue: ["Przygotować krótką notatkę"] },
    { current: "Uzupełniam dokumentację", detail: "Opisuję aktualny stan projektu.", queue: ["Sprawdzić kompletność"] },
  ],
  orbitals: [
    { current: "Analizuję materiały", detail: "Wyłapuję informacje przydatne do zadania.", queue: ["Uporządkować wyniki"] },
    { current: "Przygotowuję plan", detail: "Dzielę pracę na kolejne etapy.", queue: ["Przekazać plan zespołowi"] },
    { current: "Sprawdzam dokument", detail: "Weryfikuję strukturę i aktualność treści.", queue: ["Zapisać uwagi"] },
    { current: "Zbieram informacje", detail: "Uzupełniam brakujące dane do raportu.", queue: ["Przekazać gotowe zestawienie"] },
  ],
  rings: [
    { current: "Przeglądam zmiany", detail: "Sprawdzam, co zostało zaktualizowane.", queue: ["Potwierdzić zgodność"] },
    { current: "Opracowuję notatki", detail: "Porządkuję najważniejsze ustalenia.", queue: ["Udostępnić zespołowi"] },
    { current: "Tworzę zestawienie", detail: "Łączę wyniki w jeden raport.", queue: ["Sprawdzić końcowe dane"] },
    { current: "Aktualizuję materiały", detail: "Uzupełniam dokument o bieżące informacje.", queue: ["Przygotować do przeglądu"] },
  ],
  pulse: [
    { current: "Realizuję bieżące zadanie", detail: "Pracuję nad kolejnym etapem projektu.", queue: ["Zaktualizować status"] },
    { current: "Przygotowuję odpowiedź", detail: "Sprawdzam kontekst i dostępne informacje.", queue: ["Przekazać wynik"] },
    { current: "Analizuję dokumentację", detail: "Wyszukuję odpowiednie informacje.", queue: ["Uzupełnić notatki"] },
    { current: "Porządkuję wyniki", detail: "Zapisuję postęp i kolejne kroki.", queue: ["Przygotować podsumowanie"] },
  ],
  duo: duetTasks,
  grid: [
    {
      current: "Prostuję czasoprzestrzeń",
      detail: "Poziomica pokazuje wczoraj.",
      queue: ["Przesunąć jutro na dogodniejszy termin"],
    },
    {
      current: "Uczę ryby jazdy na rowerze",
      detail: "Karp pyta o boczne kółka.",
      queue: ["Znaleźć kask w rozmiarze akwarium"],
    },
    {
      current: "Liczyłem wszystkie ziarnka piasku",
      detail: "Ktoś przyszedł w klapkach. Wynik do poprawki.",
      queue: [],
    },
    {
      current: "Ustawiam Słońce na tryb nocny",
      detail: "Suwak jasności utknął na maksimum.",
      queue: ["Zamówić roletę na półkulę"],
    },
  ],
  op1: [
    {
      current: "Stroję tęczę kamertonem",
      detail: "Fiolet uparcie fałszuje.",
      queue: ["Podkręcić bas w grzmocie"],
    },
    {
      current: "Odkurzam szum kosmiczny",
      detail: "Worek pełny gwiezdnego pyłu.",
      queue: ["Wymienić filtr na mgławicę"],
    },
    {
      current: "Naprawiałem ciszę",
      detail: "Sąsiad właśnie kupił wiertarkę.",
      queue: [],
    },
    {
      current: "Nagrywam hymn dla komarów",
      detail: "Cały chór śpiewa przy moim uchu.",
      queue: ["Uciszyć sopran nad poduszką"],
    },
  ],
  cow: [
    {
      current: "Instaluję Bluetooth w krowie",
      detail: "Urządzenie rozgłasza nazwę Muu‑Fi.",
      queue: ["Sparować oborę z satelitą"],
    },
    {
      current: "Pasteryzuję Drogę Mleczną",
      detail: "Kosmos prosi o wersję bez laktozy.",
      queue: ["Sprawdzić datę przydatności Księżyca"],
    },
    {
      current: "Przekonywałem trawę do wzrostu",
      detail: "Zażądała podwyżki i więcej słońca.",
      queue: [],
    },
    {
      current: "Doję energię z próżni",
      detail: "Wiadro nadal podejrzanie lekkie.",
      queue: ["Wystawić fakturę za nic"],
    },
  ],
  terminal: [
    {
      current: "Uruchamiam Ziemię jako admin",
      detail: "Hasło do planety wygasło w kredzie.",
      queue: ["Zresetować uprawnienia dinozaurów"],
    },
    {
      current: "Debuguję pogodę",
      detail: "Zmienna lato zwraca śnieg.",
      queue: ["Dodać test na deszcz w majówkę"],
    },
    {
      current: "Zamknąłem okno w Windowsie",
      detail: "W mieszkaniu nadal przeciąg.",
      queue: [],
    },
    {
      current: "Kompresuję Ocean Spokojny",
      detail: "Archiwum przecieka przez port USB.",
      queue: ["Zapakować fale do pliku ZIP"],
    },
  ],
  orbit: [
    {
      current: "Parkuję Księżyc równolegle",
      detail: "Zostały dwa obroty i lekko w prawo.",
      queue: ["Włączyć kierunkowskaz na orbicie"],
    },
    {
      current: "Przedłużam dobę do 30 godzin",
      detail: "Szef już dopisał sześć spotkań.",
      queue: ["Zablokować kalendarz na zaćmienie"],
    },
    {
      current: "Zawracałem kometę",
      detail: "Nawigacja kazała czekać 76 lat.",
      queue: [],
    },
    {
      current: "Przeprowadzam kosmitom onboarding",
      detail: "Utknęli na pytaniu: czy jesteś robotem?",
      queue: ["Przetłumaczyć regulamin na telepatię"],
    },
  ],
  split: [
    {
      current: "Ustalam kierunek dla wiatru",
      detail: "Przeczytał instrukcję i poszedł pod prąd.",
      queue: ["Przykręcić przeciąg do podłogi"],
    },
    {
      current: "Sortuję konfetti według nastroju",
      detail: "Czerwone kawałki wzięły urlop.",
      queue: ["Przeprowadzić rozmowę z brokatem"],
    },
    {
      current: "Naprawiałem teleport",
      detail: "Przyszła tylko lewa skarpetka.",
      queue: [],
    },
    {
      current: "Zwołuję zebranie pingwinów",
      detail: "Wszyscy przyszli w tym samym garniturze.",
      queue: ["Zarezerwować salę na krze"],
    },
  ],
  quiet: [
    {
      current: "Wyciszam myśli przed snem",
      detail: "Mózg przypomniał sobie błąd z 2007 roku.",
      queue: ["Wyłączyć powiadomienia od sumienia"],
    },
    {
      current: "Uczę kamień medytacji",
      detail: "Od trzech godzin ani jednej skargi.",
      queue: ["Wręczyć dyplom za bezruch"],
    },
    {
      current: "Usypiałem owce",
      detail: "Zaczęły liczyć mnie. Teraz śpię ja.",
      queue: [],
    },
    {
      current: "Włączam tryb samolotowy w gołębiu",
      detail: "Wieża prosi o numer rezerwacji.",
      queue: ["Wydać chmurze zakaz hałasowania"],
    },
  ],
};
