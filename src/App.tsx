import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  Check,
  Clock3,
  FileLock2,
  FileText,
  Filter,
  Code2,
  Globe2,
  HeartHandshake,
  ImagePlus,
  LockKeyhole,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import "./App.css";

type Role = "student" | "organizer";
type Page =
  | "welcome"
  | "onboarding"
  | "home"
  | "discover"
  | "requests"
  | "activity"
  | "events"
  | "detail"
  | "studentProfile"
  | "documents"
  | "organizerProfile";
type StatusValue = "Pending" | "Approved" | "Denied" | "Revoked";
type Hackathon = {
  name: string;
  org: string;
  location: string;
  date: string;
  tags: string[];
  summary: string;
  description: string;
  github?: string;
};
type AccessRequest = {
  id: number;
  org: string;
  scope: string;
  status: StatusValue;
  expires?: string;
};
type PrivateDocument = {
  id: number;
  name: string;
  category: "Identity" | "Certificates" | "Projects";
  updated: string;
  size: string;
  note: string;
  fileUrl?: string;
};
type StudentProfileForm = {
  fullName: string;
  college: string;
  usn: string;
  email: string;
  region: string;
  aadhaar: string;
  bio: string;
  photoData: string;
};
type OrganizerProfileForm = {
  fullName: string;
  organization: string;
  designation: string;
  type: string;
  email: string;
  region: string;
  website: string;
  principal: string;
  motto: string;
  address: string;
  about: string;
};
type EventItem = {
  id: number;
  name: string;
  date: string;
  venue: string;
  domains: string;
  description: string;
};
type ActivityEntry = {
  id: number;
  initials: string;
  org: string;
  what: string;
  when: string;
};
type AcceptedAttendee = {
  name: string;
  kind: "Student" | "Team";
  college: string;
  usn: string;
  contact: string;
  members: number;
  status: "Accepted";
  consent: string;
};

const sampleHackathons: Hackathon[] = [
  {
    name: "Build for Bharat",
    org: "Google Developer Groups",
    location: "Bengaluru, India",
    date: "Mar 2025",
    tags: ["AI / ML", "Civic tech"],
    summary:
      "Built a multilingual assistant that helps citizens find local public services.",
    description:
      "Designed and built a multilingual public-service navigator that helps citizens discover nearby government schemes. Our team shipped a voice-first prototype in Kannada and English using retrieval augmented generation.",
    github: "https://github.com/arjunrao/seva",
  },
  {
    name: "Hack the Climate",
    org: "Climate Collective",
    location: "Online",
    date: "Nov 2024",
    tags: ["Climate", "Web"],
    summary: "Created a community map for neighborhood climate action.",
    description:
      "A collaborative map bringing local climate initiatives into one place. Residents can find nearby projects, join events and track small changes over time.",
  },
];
const initialHackathons: Hackathon[] = sampleHackathons;
const initialRequests: AccessRequest[] = [];
const initialDocuments: PrivateDocument[] = [
  {
    id: 1,
    name: "CivicSpark participation certificate.pdf",
    category: "Certificates",
    updated: "Apr 28, 2026",
    size: "1.9 KB",
    note: "CivicSpark Hackathon 2026 · Team Monsoon participation",
    fileUrl: "/sample-documents/civicspark-certificate.pdf",
  },
  {
    id: 2,
    name: "GreenTech finalist certificate.pdf",
    category: "Certificates",
    updated: "Aug 18, 2025",
    size: "1.9 KB",
    note: "GreenTech Buildathon 2025 · Finalist recognition",
    fileUrl: "/sample-documents/greentech-finalist-certificate.pdf",
  },
  {
    id: 3,
    name: "Hackathon participation portfolio.pdf",
    category: "Projects",
    updated: "Apr 28, 2026",
    size: "1.9 KB",
    note: "Past participation, project outcomes and team responsibilities",
    fileUrl: "/sample-documents/hackathon-portfolio.pdf",
  },
];
const initialEvents: EventItem[] = [
  {
    id: 1,
    name: "Build for Bharat 2026",
    date: "Nov 14–16, 2026",
    venue: "Bengaluru, India",
    domains: "Civic tech · AI / ML",
    description: "A weekend to build practical tools for communities.",
  },
];
const sampleAcceptedAttendees: AcceptedAttendee[] = [
  {
    name: "Team Monsoon",
    kind: "Team",
    college: "Christ University",
    usn: "TEAM-CU-2026-14",
    contact: "team.monsoon@christ.example",
    members: 4,
    status: "Accepted",
    consent: "Approved for organizer export",
  },
  {
    name: "Circuit Crew",
    kind: "Team",
    college: "BMS College of Engineering",
    usn: "TEAM-BMS-2026-08",
    contact: "circuit.crew@bms.example",
    members: 4,
    status: "Accepted",
    consent: "Approved for organizer export",
  },
  {
    name: "Pixel Pioneers",
    kind: "Team",
    college: "MS Ramaiah Institute of Technology",
    usn: "TEAM-MSRIT-2026-21",
    contact: "pixel.pioneers@msrit.example",
    members: 4,
    status: "Accepted",
    consent: "Approved for organizer export",
  },
];
const people = [
  {
    name: "Arjun Rao",
    kind: "student",
    college: "PES University",
    region: "Bengaluru",
    tags: ["AI / ML", "Civic tech", "React"],
    headline: "Building technology for people and the places they call home.",
    hacks: ["Build for Bharat", "Hack the Climate"],
    avatar: "AR",
  },
  {
    name: "Maya Iyer",
    kind: "student",
    college: "RV College of Engineering",
    region: "Bengaluru",
    tags: ["Robotics", "IoT", "Hardware"],
    headline: "Making robotics feel a little more human.",
    hacks: ["RoboRumble", "Makeathon 2025"],
    avatar: "MI",
  },
  {
    name: "Ishaan Nair",
    kind: "student",
    college: "NITK Surathkal",
    region: "Mangaluru",
    tags: ["Climate", "Web", "Data"],
    headline: "Turning open data into tools for climate resilience.",
    hacks: ["Hack the Climate", "Open Data Jam"],
    avatar: "IN",
  },
  {
    name: "Team Monsoon",
    kind: "team",
    college: "Christ University",
    region: "Bengaluru",
    tags: ["Climate", "AI / ML"],
    headline: "Local climate insights, built together.",
    hacks: ["Build for Bharat"],
    avatar: "TM",
  },
  {
    name: "Circuit Crew",
    kind: "team",
    college: "BMS College of Engineering",
    region: "Bengaluru",
    tags: ["Robotics", "IoT", "Hardware"],
    headline:
      "Building low-cost systems that make city infrastructure smarter.",
    hacks: ["RoboRumble 2026", "Smart India Hackathon"],
    avatar: "CC",
  },
  {
    name: "Pixel Pioneers",
    kind: "team",
    college: "MS Ramaiah Institute of Technology",
    region: "Bengaluru",
    tags: ["Design", "Web", "Accessibility"],
    headline: "Designing digital public services that work for everyone.",
    hacks: ["Design4Impact", "Open Data Jam"],
    avatar: "PP",
  },
  {
    name: "TerraBytes",
    kind: "team",
    college: "NITK Surathkal",
    region: "Mangaluru",
    tags: ["Climate", "Data", "Web"],
    headline: "Using environmental data to help coastal communities prepare.",
    hacks: ["CoastHack", "Climate Collective"],
    avatar: "TB",
  },
  {
    name: "Nikhil Varma",
    kind: "student",
    college: "Dayananda Sagar College of Engineering",
    region: "Bengaluru",
    tags: ["Cybersecurity", "Web", "Cloud"],
    headline: "Learning secure systems by building them in public.",
    hacks: ["SecureStack", "HackVerse"],
    avatar: "NV",
  },
  {
    name: "Kavya Srinivas",
    kind: "student",
    college: "Bangalore Institute of Technology",
    region: "Bengaluru",
    tags: ["Design", "AI / ML", "Web"],
    headline: "Designing thoughtful AI tools for everyday users.",
    hacks: ["Design4Impact", "AI for Good"],
    avatar: "KS",
  },
  {
    name: "Aditya Pai",
    kind: "student",
    college: "NITK Surathkal",
    region: "Mangaluru",
    tags: ["Data", "Climate", "Python"],
    headline: "Working with data to make coastal resilience actionable.",
    hacks: ["CoastHack", "DataDive"],
    avatar: "AP",
  },
  {
    name: "Code Comets",
    kind: "team",
    college: "PES University",
    region: "Bengaluru",
    tags: ["Web", "AI / ML", "Design"],
    headline: "Small team, sharp prototypes and user-first product thinking.",
    hacks: ["HackVerse", "Product Jam"],
    avatar: "CC",
  },
  {
    name: "Aqua Atlas",
    kind: "team",
    college: "Bangalore Institute of Technology",
    region: "Bengaluru",
    tags: ["Climate", "IoT", "Data"],
    headline: "Building water intelligence tools for campuses and communities.",
    hacks: ["Waterthon", "GreenTech Buildathon"],
    avatar: "AA",
  },
];
const teamProfiles: Record<
  string,
  {
    college: string;
    region: string;
    summary: string;
    wins: number;
    certificates: number;
    members: { name: string; role: string; initials: string }[];
    projects: {
      name: string;
      result: string;
      summary: string;
      tags: string[];
    }[];
  }
> = {
  "Code Comets": {
    college: "PES University",
    region: "Bengaluru",
    summary:
      "A compact product team mixing AI prototypes, interface design and fast user testing.",
    wins: 1,
    certificates: 4,
    members: [
      { name: "Rhea Nair", role: "Product", initials: "RN" },
      { name: "Kabir Singh", role: "Frontend", initials: "KS" },
      { name: "Neel Shah", role: "AI engineering", initials: "NS" },
      { name: "Veda Rao", role: "Design", initials: "VR" },
    ],
    projects: [
      {
        name: "HackVerse 2026",
        result: "Winner · Product track",
        summary:
          "Created a student support planner that turns course schedules into focused weekly plans.",
        tags: ["Web", "AI / ML"],
      },
      {
        name: "Product Jam 2025",
        result: "Finalist",
        summary:
          "Built an accessible project discovery tool for first-time hackathon participants.",
        tags: ["Design", "Web"],
      },
    ],
  },
  "Aqua Atlas": {
    college: "Bangalore Institute of Technology",
    region: "Bengaluru",
    summary:
      "A climate-tech team using low-cost sensors and clear data stories to improve local water decisions.",
    wins: 1,
    certificates: 5,
    members: [
      { name: "Lakshmi Iyer", role: "Data science", initials: "LI" },
      { name: "Harsh Kumar", role: "IoT", initials: "HK" },
      { name: "Sanjana Rao", role: "Research", initials: "SR" },
      { name: "Vikram Jain", role: "Backend", initials: "VJ" },
    ],
    projects: [
      {
        name: "Waterthon 2026",
        result: "Winner · Campus resilience",
        summary:
          "Made a leak and consumption dashboard that helps campus teams prioritize repairs.",
        tags: ["IoT", "Data"],
      },
      {
        name: "GreenTech Buildathon 2025",
        result: "Top 10 team",
        summary:
          "Prototyped a rainfall capture calculator for apartment communities.",
        tags: ["Climate", "Web"],
      },
    ],
  },
  "Team Monsoon": {
    college: "Christ University",
    region: "Bengaluru",
    summary:
      "A four-person team building climate-aware civic tools through community research, accessible interfaces and practical data work.",
    wins: 1,
    certificates: 5,
    members: [
      { name: "Ananya Menon", role: "Product & research", initials: "AM" },
      { name: "Rohan Kulkarni", role: "Frontend engineering", initials: "RK" },
      { name: "Zoya Khan", role: "Data & ML", initials: "ZK" },
      { name: "Dev Malhotra", role: "Backend engineering", initials: "DM" },
    ],
    projects: [
      {
        name: "CivicSpark Hackathon 2026",
        result: "Winner · Public mobility track",
        summary:
          "NammaRoute helps commuters find reliable bus routes using accessibility filters and Kannada voice guidance.",
        tags: ["Civic tech", "AI / ML"],
      },
      {
        name: "GreenTech Buildathon 2025",
        result: "Finalist · Water resilience track",
        summary:
          "Rainwise turns local rainfall forecasts into useful water-harvesting recommendations for apartment communities.",
        tags: ["Climate", "Data"],
      },
    ],
  },
  "Circuit Crew": {
    college: "BMS College of Engineering",
    region: "Bengaluru",
    summary:
      "A hardware-focused team prototyping affordable sensing systems for safer, more responsive city infrastructure.",
    wins: 2,
    certificates: 7,
    members: [
      { name: "Naveen Shetty", role: "Embedded systems", initials: "NS" },
      { name: "Ira Thomas", role: "Industrial design", initials: "IT" },
      { name: "Karthik Iyer", role: "Robotics", initials: "KI" },
      { name: "Meera Das", role: "Mobile engineering", initials: "MD" },
    ],
    projects: [
      {
        name: "RoboRumble 2026",
        result: "Winner · Assistive robotics",
        summary:
          "Built a compact indoor navigation rover that maps inaccessible routes and reports barriers in real time.",
        tags: ["Robotics", "IoT"],
      },
      {
        name: "Smart India Hackathon 2025",
        result: "Top 20 team",
        summary:
          "Created a flood-drain monitoring kit with low-cost sensors and a municipal alert dashboard.",
        tags: ["Hardware", "Civic tech"],
      },
    ],
  },
  "Pixel Pioneers": {
    college: "MS Ramaiah Institute of Technology",
    region: "Bengaluru",
    summary:
      "A product design and web team making digital services clearer, more inclusive and easier to use.",
    wins: 1,
    certificates: 4,
    members: [
      { name: "Aditi Rao", role: "UX research", initials: "AR" },
      { name: "Faris Ali", role: "UI engineering", initials: "FA" },
      { name: "Sneha Bhat", role: "Content design", initials: "SB" },
      { name: "Varun Shah", role: "Full-stack engineering", initials: "VS" },
    ],
    projects: [
      {
        name: "Design4Impact 2026",
        result: "Winner · Inclusive services",
        summary:
          "Designed and shipped a simplified appointment flow for first-time users of public health centres.",
        tags: ["Design", "Accessibility"],
      },
      {
        name: "Open Data Jam 2025",
        result: "People’s choice",
        summary:
          "Built a plain-language dashboard that makes ward-level civic spending easier to understand.",
        tags: ["Web", "Civic tech"],
      },
    ],
  },
  TerraBytes: {
    college: "NITK Surathkal",
    region: "Mangaluru",
    summary:
      "A coastal technology team translating open environmental data into decisions communities can act on.",
    wins: 1,
    certificates: 6,
    members: [
      { name: "Ayaan Prabhu", role: "Geospatial data", initials: "AP" },
      { name: "Lisha Roy", role: "Data science", initials: "LR" },
      { name: "Manav Balan", role: "Platform engineering", initials: "MB" },
      { name: "Tara Nair", role: "Community research", initials: "TN" },
    ],
    projects: [
      {
        name: "CoastHack 2026",
        result: "Winner · Resilience track",
        summary:
          "Built a neighbourhood-level tide and rainfall alert tool for coastal fishers and residents.",
        tags: ["Climate", "Data"],
      },
      {
        name: "Climate Collective 2025",
        result: "Finalist · Open data",
        summary:
          "Created a participatory shoreline-change map using public satellite data and resident observations.",
        tags: ["Web", "Climate"],
      },
    ],
  },
};
const initialsFor = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DP";
const emptyStudentProfile: StudentProfileForm = {
  fullName: "",
  college: "",
  usn: "",
  email: "",
  region: "",
  aadhaar: "",
  bio: "",
  photoData: "",
};
const emptyOrganizerProfile: OrganizerProfileForm = {
  fullName: "",
  organization: "EWIT",
  designation: "",
  type: "Hackathon organizer",
  email: "",
  region: "",
  website: "",
  principal: "",
  motto: "",
  address: "",
  about: "",
};
function storedProfile<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}
function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function routeFor(role: Role, page: Page, personName = "arjun-rao"): string {
  if (page === "welcome") return "/";
  if (page === "onboarding") return "/onboarding";
  if (page === "detail")
    return `/organizer/student/${personName.toLowerCase().replaceAll(" ", "-")}`;
  if (page === "studentProfile") return "/student/profile";
  if (page === "documents") return "/student/documents";
  if (page === "organizerProfile") return "/organizer/profile";
  if (page === "requests") return `/${role}/requests`;
  if (page === "activity") return "/student/activity";
  if (page === "events") return `/${role}/events`;
  return role === "organizer" ? "/organizer" : "/student";
}
function initialRoute(): { role: Role; page: Page; selected: number } {
  const path = window.location.pathname;
  if (path === "/" || path === "/onboarding")
    return {
      role: "student",
      page: path === "/onboarding" ? "onboarding" : "welcome",
      selected: 0,
    };
  if (
    path.startsWith("/student") &&
    !window.localStorage.getItem("docpass-student-profile")
  )
    return { role: "student", page: "welcome", selected: 0 };
  if (
    path.startsWith("/organizer") &&
    !window.localStorage.getItem("docpass-organizer-profile")
  )
    return { role: "organizer", page: "welcome", selected: 0 };
  if (path.startsWith("/organizer/student/"))
    return { role: "organizer", page: "detail", selected: 0 };
  if (path === "/organizer/profile")
    return { role: "organizer", page: "organizerProfile", selected: 0 };
  if (path.startsWith("/organizer/requests"))
    return { role: "organizer", page: "requests", selected: 0 };
  if (path.startsWith("/organizer/events"))
    return { role: "organizer", page: "events", selected: 0 };
  if (path.startsWith("/organizer"))
    return { role: "organizer", page: "discover", selected: 0 };
  if (path === "/student/requests")
    return { role: "student", page: "requests", selected: 0 };
  if (path === "/student/activity")
    return { role: "student", page: "activity", selected: 0 };
  if (path === "/student/events")
    return { role: "student", page: "events", selected: 0 };
  if (path === "/student/profile")
    return { role: "student", page: "studentProfile", selected: 0 };
  if (path === "/student/documents")
    return { role: "student", page: "documents", selected: 0 };
  return { role: "student", page: "home", selected: 0 };
}

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [role, setRole] = useState<Role>(() => initialRoute().role),
    [page, setPage] = useState<Page>(() => initialRoute().page),
    [tab, setTab] = useState<"individual" | "team">("individual");
  const [requests, setRequests] = useState(initialRequests),
    [hackathons, setHackathons] = useState(initialHackathons),
    [documents, setDocuments] = useState(initialDocuments),
    [events, setEvents] = useState(initialEvents),
    [toast, setToast] = useState("");
  const [modal, setModal] = useState<
      "hackathon" | "request" | "invite" | "document" | "event" | null
    >(null),
    [query, setQuery] = useState(""),
    [domain, setDomain] = useState("All domains"),
    [region, setRegion] = useState("All regions"),
    [profileFilter, setProfileFilter] = useState<"All" | "Students" | "Teams">(
      "All",
    ),
    [selectedProfiles, setSelectedProfiles] = useState<number[]>([]),
    [inviteTargets, setInviteTargets] = useState<string[]>([]);
  const [selected, setSelected] = useState(0),
    [grantedScopes, setGrantedScopes] = useState<string[]>([]),
    [expiry, setExpiry] = useState("7 days"),
    [scope, setScope] = useState("Everything"),
    [invites, setInvites] = useState<string[]>([]),
    [invitedEventIds, setInvitedEventIds] = useState<number[]>([]),
    [acceptedEventIds, setAcceptedEventIds] = useState<number[]>([]);
  const [acceptedAttendees, setAcceptedAttendees] = useState<
    Record<number, AcceptedAttendee[]>
  >({ 1: sampleAcceptedAttendees });
  const [organizerActivity, setOrganizerActivity] = useState<ActivityEntry[]>(
    [],
  );
  const [form, setForm] = useState({
    name: "",
    org: "",
    location: "",
    date: "",
    tags: "",
    summary: "",
    description: "",
    github: "",
  });
  const [documentForm, setDocumentForm] = useState({
    name: "",
    category: "Certificates" as PrivateDocument["category"],
    note: "",
    fileName: "",
    file: null as File | null,
  });
  const [documentPreview, setDocumentPreview] =
    useState<PrivateDocument | null>(null);
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    venue: "",
    domains: "",
    description: "",
  });
  const [activeEventId, setActiveEventId] = useState(1),
    [privacyShield, setPrivacyShield] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [studentForm, setStudentForm] = useState<StudentProfileForm>(() =>
    storedProfile("docpass-student-profile", emptyStudentProfile),
  );
  const [organizerForm, setOrganizerForm] = useState<OrganizerProfileForm>(() =>
    storedProfile("docpass-organizer-profile", emptyOrganizerProfile),
  );
  useEffect(() => {
    if (organizerForm.organization === "Northstar Ventures")
      setOrganizerForm({ ...organizerForm, organization: "EWIT" });
  }, []);
  const studentName = studentForm.fullName || "Arjun Rao";
  const organizerName =
    organizerForm.organization === "Northstar Ventures"
      ? "EWIT"
      : organizerForm.organization || "EWIT";
  const directory = useMemo(
    () => [
      {
        ...people[0],
        name: studentName,
        college: studentForm.college || people[0].college,
        region: studentForm.region || people[0].region,
        headline: studentForm.bio || people[0].headline,
        avatar: initialsFor(studentName),
      },
      ...people.slice(1),
    ],
    [studentName, studentForm.college, studentForm.region, studentForm.bio],
  );
  useEffect(() => {
    const url = routeFor(role, page, directory[selected]?.name ?? "arjun-rao");
    if (window.location.pathname !== url) window.history.pushState({}, "", url);
  }, [role, page, selected, directory]);
  useEffect(() => {
    const onPopState = () => {
      const next = initialRoute();
      setRole(next.role);
      setPage(next.page);
      setSelected(next.selected);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 5500);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const shield = () => setPrivacyShield(true);
    const prevent = (event: Event) => event.preventDefault();
    const visibility = () => {
      if (document.hidden) shield();
    };
    const shortcut = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (
        event.key === "PrintScreen" ||
        ((event.ctrlKey || event.metaKey) && ["P", "S"].includes(key)) ||
        (event.ctrlKey && event.shiftKey && ["S", "I", "J"].includes(key))
      ) {
        event.preventDefault();
        shield();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("dragstart", prevent);
    window.addEventListener("keydown", shortcut);
    window.addEventListener("beforeprint", shield);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("dragstart", prevent);
      window.removeEventListener("keydown", shortcut);
      window.removeEventListener("beforeprint", shield);
    };
  }, []);
  useEffect(() => {
    if (
      role === "organizer" &&
      page === "detail" &&
      selected === 0 &&
      grantedScopes.includes("your full profile")
    )
      setActivity((current) =>
        current.some(
          (entry) =>
            entry.org === organizerName &&
            entry.what === "Viewed your approved full profile",
        )
          ? current
          : [
              {
                id: Date.now(),
                initials: initialsFor(organizerName),
                org: organizerName,
                what: "Viewed your approved full profile",
                when: "Just now",
              },
              ...current,
            ],
      );
  }, [role, page, selected, grantedScopes, organizerName]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };
  const beginSetup = (nextRole: Role) => {
    setRole(nextRole);
    setPage("onboarding");
  };
  const finishSetup = () => {
    if (role === "student") {
      if (
        !studentForm.fullName ||
        !studentForm.college ||
        !studentForm.usn ||
        !studentForm.email ||
        !studentForm.region ||
        !/^\d{12}$/.test(studentForm.aadhaar)
      ) {
        notify("Complete your required profile details to continue.");
        return;
      }
      window.localStorage.setItem(
        "docpass-student-profile",
        JSON.stringify(studentForm),
      );
    } else if (
      !organizerForm.fullName ||
      !organizerForm.organization ||
      !organizerForm.designation ||
      !organizerForm.email ||
      !organizerForm.region
    ) {
      notify("Complete your required profile details to continue.");
      return;
    } else
      window.localStorage.setItem(
        "docpass-organizer-profile",
        JSON.stringify(organizerForm),
      );
    setPage(role === "student" ? "home" : "discover");
    notify("Your profile is ready.");
  };
  const found = useMemo(
    () =>
      directory.filter(
        (p) =>
          (!query ||
            `${p.name} ${p.college} ${p.tags.join(" ")}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (domain === "All domains" || p.tags.includes(domain)) &&
          (region === "All regions" || p.region === region) &&
          (profileFilter === "All" ||
            p.kind === (profileFilter === "Students" ? "student" : "team")),
      ),
    [directory, query, domain, region, profileFilter],
  );
  const addHackathon = () => {
    if (
      !form.name ||
      !form.org ||
      !form.location ||
      !form.date ||
      !form.tags ||
      !form.summary
    ) {
      notify("Add the required fields to continue.");
      return;
    }
    setHackathons([
      {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      ...hackathons,
    ]);
    setForm({
      name: "",
      org: "",
      location: "",
      date: "",
      tags: "",
      summary: "",
      description: "",
      github: "",
    });
    setModal(null);
    notify("Hackathon added to your profile.");
  };
  const addDocument = () => {
    if (!documentForm.name || !documentForm.note) {
      notify("Add a document name and note to continue.");
      return;
    }
    setDocuments([
      {
        id: Date.now(),
        name: documentForm.name,
        category: documentForm.category,
        updated: "Just now",
        size: documentForm.file
          ? `${Math.max(1, Math.round(documentForm.file.size / 1024))} KB`
          : "No file attached",
        note: documentForm.note,
        fileUrl: documentForm.file
          ? URL.createObjectURL(documentForm.file)
          : undefined,
      },
      ...documents,
    ]);
    setDocumentForm({
      name: "",
      category: "Certificates",
      note: "",
      fileName: "",
      file: null,
    });
    setModal(null);
    notify("Document added to your private vault.");
  };
  const addEvent = () => {
    if (
      !eventForm.name ||
      !eventForm.date ||
      !eventForm.venue ||
      !eventForm.domains ||
      !eventForm.description
    ) {
      notify("Complete all event details to continue.");
      return;
    }
    const created = { id: Date.now(), ...eventForm };
    setEvents([created, ...events]);
    setActiveEventId(created.id);
    setEventForm({
      name: "",
      date: "",
      venue: "",
      domains: "",
      description: "",
    });
    setModal(null);
    notify("Event created. You can invite people now.");
  };
  const deleteDocument = (id: number) => {
    setDocuments(documents.filter((document) => document.id !== id));
    if (documentPreview?.id === id) setDocumentPreview(null);
    notify("Document removed from your vault.");
  };
  const exportAcceptedAttendees = (event: EventItem) => {
    const rows = acceptedAttendees[event.id] || [];
    const headers = [
      "Profile",
      "Type",
      "College",
      "USN / Team ID",
      "Contact",
      "Members",
      "Invitation status",
      "Consent",
    ];
    const csv = [
      headers,
      ...rows.map((row) => [
        row.name,
        row.kind,
        row.college,
        row.usn,
        row.contact,
        row.members,
        row.status,
        row.consent,
      ]),
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${event.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-accepted-attendees.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify(
      "Consent-approved attendee data exported for Excel or Google Sheets.",
    );
  };
  const setRequest = (id: number, status: StatusValue) => {
    const item = requests.find((r) => r.id === id);
    if (status === "Approved" && item) {
      setGrantedScopes([...grantedScopes, item.scope]);
      setActivity([
        {
          id: Date.now(),
          initials: initialsFor(item.org),
          org: item.org,
          what: `Access approved for ${item.scope}`,
          when: "Just now",
        },
        ...activity,
      ]);
    }
    setRequests(
      requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              expires:
                status === "Approved"
                  ? expiry === "24 hours"
                    ? "Oct 31, 2026"
                    : expiry === "7 days"
                      ? "Nov 06, 2026"
                      : expiry === "30 days"
                        ? "Nov 29, 2026"
                        : "Until you revoke"
                  : undefined,
            }
          : r,
      ),
    );
    notify(status === "Approved" ? "Access approved." : "Request declined.");
  };
  const revoke = (id: number) => {
    const item = requests.find((r) => r.id === id);
    if (item) setGrantedScopes(grantedScopes.filter((s) => s !== item.scope));
    setRequests(
      requests.map((r) =>
        r.id === id ? { ...r, status: "Revoked", expires: undefined } : r,
      ),
    );
    notify("Access revoked. The profile is locked again.");
  };
  const sendRequest = () => {
    setRequests([
      {
        id: Date.now(),
        org: organizerName,
        scope:
          scope === "Everything"
            ? "your full profile"
            : `your ${scope} details`,
        status: "Pending",
      },
      ...requests,
    ]);
    setModal(null);
    notify(`Request sent. You’ll see it here when ${studentName} responds.`);
  };
  const nav: { key: Page; label: string; icon: typeof BookOpen }[] =
    role === "student"
      ? [
          { key: "home", label: "Home", icon: BookOpen },
          { key: "studentProfile", label: "My profile", icon: UserRound },
          { key: "documents", label: "My documents", icon: FileText },
          { key: "requests", label: "Access requests", icon: LockKeyhole },
          { key: "activity", label: "Activity", icon: Clock3 },
          { key: "events", label: "Invitations", icon: HeartHandshake },
        ]
      : [
          { key: "discover", label: "Discover", icon: Search },
          {
            key: "organizerProfile",
            label: "Organization profile",
            icon: Building2,
          },
          { key: "requests", label: "My requests", icon: LockKeyhole },
          { key: "events", label: "Events", icon: HeartHandshake },
        ];
  if (showIntro) return <IntroHero skip={() => setShowIntro(false)} />;
  return (
    <div className="app-shell">
      {page === "welcome" || page === "onboarding" ? (
        <StartScreen
          page={page}
          role={role}
          chooseRole={beginSetup}
          studentForm={studentForm}
          setStudentForm={setStudentForm}
          organizerForm={organizerForm}
          setOrganizerForm={setOrganizerForm}
          onPhoto={async (file) => {
            try {
              setStudentForm({
                ...studentForm,
                photoData: await readImage(file),
              });
            } catch {
              notify("Could not add that image. Try another file.");
            }
          }}
          complete={finishSetup}
          back={() => setPage("welcome")}
        />
      ) : (
        <>
          <aside className="sidebar">
            <button
              className="brand"
              onClick={() => setPage(role === "student" ? "home" : "discover")}
            >
              <span className="brand-mark">
                <span />
              </span>
              <span>docpass</span>
            </button>
            <div className="workspace-label">WORKSPACE</div>
            <button
              className="workspace"
              onClick={() =>
                setPage(
                  role === "student" ? "studentProfile" : "organizerProfile",
                )
              }
            >
              <Avatar
                initials={
                  role === "student"
                    ? initialsFor(studentName)
                    : initialsFor(organizerName)
                }
                image={role === "student" ? studentForm.photoData : undefined}
                small
              />
              <span>
                {role === "student" ? studentName : organizerName}
                <small>
                  {role === "student" ? "Student account" : "Organizer account"}
                </small>
              </span>
            </button>
            <div className="nav-label">MENU</div>
            <nav className="nav-list">
              {nav.map((item) => (
                <button
                  key={item.key}
                  className={`nav-item ${page === item.key ? "selected" : ""}`}
                  onClick={() => setPage(item.key)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.key === "requests" && role === "student" && (
                    <i className="nav-count">
                      {
                        requests.filter(
                          (request) => request.status === "Pending",
                        ).length
                      }
                    </i>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-note">
                <ShieldCheck size={18} />
                <div>
                  <b>Your data, your call.</b>
                  <p>Private details stay private until you say so.</p>
                </div>
              </div>
              <button
                className="account"
                onClick={() => {
                  setRole(role === "student" ? "organizer" : "student");
                  setPage(role === "student" ? "discover" : "home");
                }}
              >
                <Avatar
                  initials={
                    role === "student"
                      ? initialsFor(studentName)
                      : initialsFor(organizerName)
                  }
                  image={role === "student" ? studentForm.photoData : undefined}
                />
                <div>
                  <b>{role === "student" ? studentName : organizerName}</b>
                  <small>Switch demo role</small>
                </div>
              </button>
            </div>
          </aside>
          <main className="main-area">
            <header className="topbar">
              <div className="breadcrumb">
                Workspace <span>/</span>{" "}
                <b>
                  {
                    {
                      home: "Home",
                      discover: "Discover",
                      requests: "Access requests",
                      activity: "Activity",
                      events: "Events",
                      detail: "Student profile",
                      studentProfile: "My profile",
                      documents: "My documents",
                      organizerProfile: "Organization profile",
                    }[page]
                  }
                </b>
              </div>
              <div className="top-actions">
                <button
                  className="icon-button"
                  aria-label="Notifications"
                  onClick={() => setPage("requests")}
                >
                  <Bell size={18} />
                  <i />
                </button>
                <button
                  className="top-avatar-button"
                  onClick={() =>
                    setPage(
                      role === "student"
                        ? "studentProfile"
                        : "organizerProfile",
                    )
                  }
                  aria-label="Open your profile"
                >
                  <Avatar
                    initials={
                      role === "student"
                        ? initialsFor(studentName)
                        : initialsFor(organizerName)
                    }
                    image={
                      role === "student" ? studentForm.photoData : undefined
                    }
                  />
                </button>
              </div>
            </header>
            {role === "student" && (
              <>
                {page === "home" && (
                  <>
                    <Hero onProfile={() => setPage("studentProfile")} />
                    <div className="page-heading">
                      <div>
                        <div className="eyebrow">YOUR PORTFOLIO</div>
                        <h2>Make your work easy to find.</h2>
                        <p>
                          Open your profile to review everything organizers can
                          request.
                        </p>
                      </div>
                      <button
                        className="button primary"
                        onClick={() => setModal("hackathon")}
                      >
                        <Plus size={17} /> Add hackathon
                      </button>
                    </div>
                    <div className="profile-row">
                      <button
                        className="profile-card card profile-open"
                        onClick={() => setPage("studentProfile")}
                      >
                        <div className="profile-cover">
                          <span className="cover-sticker">✳</span>
                          <span className="edit-pill">View my profile</span>
                        </div>
                        <div className="profile-info">
                          <Avatar
                            initials={initialsFor(studentName)}
                            image={studentForm.photoData}
                            profile
                          />
                          <div className="profile-text">
                            <h3>{studentName}</h3>
                            <p>
                              {studentForm.college || "Your college"}{" "}
                              <span>·</span>{" "}
                              {studentForm.region || "Your region"}
                            </p>
                            <div className="tag-row">
                              <Tag color="pink">AI / ML</Tag>
                              <Tag color="blue">Civic tech</Tag>
                              <Tag color="amber">React</Tag>
                            </div>
                          </div>
                          <div className="public-badge">
                            <Globe2 size={14} /> Public profile
                          </div>
                        </div>
                        <div className="profile-footer">
                          <span>
                            <MapPin size={14} /> Bengaluru, India
                          </span>
                          <span>
                            <BookOpen size={14} /> {hackathons.length}{" "}
                            hackathons
                          </span>
                          <span>
                            <Users size={14} /> 1 team
                          </span>
                        </div>
                      </button>
                      <div className="privacy-card">
                        <div className="privacy-icon">
                          <FileLock2 size={20} />
                        </div>
                        <div className="eyebrow">PRIVATE VAULT</div>
                        <h3>
                          Your documents
                          <br />
                          stay yours.
                        </h3>
                        <p>
                          View and organize all of your private documents in one
                          place.
                        </p>
                        <button
                          className="text-button"
                          onClick={() => setPage("documents")}
                        >
                          Open documents <ArrowRight size={15} />
                        </button>
                        <div className="privacy-decoration">✳</div>
                      </div>
                    </div>
                    <div className="tabs">
                      <button
                        className={tab === "individual" ? "active" : ""}
                        onClick={() => setTab("individual")}
                      >
                        Individual <span>02</span>
                      </button>
                      <button
                        className={tab === "team" ? "active" : ""}
                        onClick={() => setTab("team")}
                      >
                        Team <span>01</span>
                      </button>
                    </div>
                    {tab === "individual" ? (
                      <>
                        <div className="section-title">
                          <div>
                            <h3>Past hackathons</h3>
                            <p>Your journey, one build at a time.</p>
                          </div>
                          <button
                            className="subtle-button"
                            onClick={() => setModal("hackathon")}
                          >
                            <Plus size={16} /> Add one
                          </button>
                        </div>
                        <div className="hackathon-grid">
                          {hackathons.map((h, i) => (
                            <HackCard
                              key={h.name}
                              item={h}
                              index={i}
                              onOpen={() => setPage("studentProfile")}
                            />
                          ))}
                          <button
                            className="add-hack-card"
                            onClick={() => setModal("hackathon")}
                          >
                            <span>
                              <Plus size={21} />
                            </span>
                            <b>Add a hackathon</b>
                            <small>Let people see what you’ve built.</small>
                          </button>
                        </div>
                      </>
                    ) : (
                      <TeamPanel onInvite={() => setPage("studentProfile")} />
                    )}
                  </>
                )}
                {page === "studentProfile" && (
                  <OwnStudentProfile
                    hackathons={hackathons}
                    documents={documents}
                    profile={studentForm}
                    openDocuments={() => setPage("documents")}
                    addHackathon={() => setModal("hackathon")}
                  />
                )}
                {page === "documents" && (
                  <DocumentsPage
                    documents={documents}
                    add={() => setModal("document")}
                    remove={deleteDocument}
                    open={setDocumentPreview}
                  />
                )}
                {page === "requests" && (
                  <>
                    <Heading
                      eyebrow="YOUR INBOX"
                      title="Access requests"
                      subtitle="Choose who gets to see your details, and for how long."
                    />
                    <div className="request-layout">
                      <div className="request-list">
                        {requests.map((r) => (
                          <RequestCard
                            key={r.id}
                            item={r}
                            expiry={expiry}
                            setExpiry={setExpiry}
                            decide={setRequest}
                            revoke={revoke}
                          />
                        ))}
                      </div>
                      <aside className="aside-note">
                        <div className="privacy-icon">
                          <ShieldCheck size={20} />
                        </div>
                        <h3>You’re in control.</h3>
                        <p>
                          Approval lasts only as long as you choose. You can
                          revoke access at any time.
                        </p>
                        <button
                          className="text-button"
                          onClick={() => setPage("activity")}
                        >
                          See access activity <ArrowRight size={14} />
                        </button>
                      </aside>
                    </div>
                  </>
                )}
                {page === "activity" && (
                  <>
                    <Heading
                      eyebrow="YOUR PRIVACY"
                      title="Access activity"
                      subtitle="A live record of approvals and private-profile views."
                    />
                    <div className="activity-card card">
                      <div className="activity-title">
                        <div>
                          <h3>Recent activity</h3>
                          <p>
                            Updates appear as soon as an organizer is approved
                            or opens shared information.
                          </p>
                        </div>
                        <div className="privacy-icon">
                          <Clock3 size={19} />
                        </div>
                      </div>
                      {activity.length ? (
                        activity.map((entry) => (
                          <ActivityRow key={entry.id} {...entry} />
                        ))
                      ) : (
                        <Empty
                          title="No activity yet."
                          body="Approvals and organizer views will appear here in real time."
                        />
                      )}
                    </div>
                  </>
                )}
                {page === "events" && (
                  <>
                    <Heading
                      eyebrow="EVENT INVITATIONS"
                      title="Invitations"
                      subtitle="Find the next place to build something meaningful."
                    />
                    {events.filter(
                      (event) =>
                        invitedEventIds.includes(event.id) &&
                        !acceptedEventIds.includes(event.id),
                    ).length ? (
                      events
                        .filter(
                          (event) =>
                            invitedEventIds.includes(event.id) &&
                            !acceptedEventIds.includes(event.id),
                        )
                        .map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            student
                            onAccept={() => {
                              setAcceptedEventIds([
                                ...new Set([...acceptedEventIds, event.id]),
                              ]);
                              setAcceptedAttendees((current) => ({
                                ...current,
                                [event.id]: [
                                  ...(current[event.id] || []).filter(
                                    (attendee) => attendee.name !== studentName,
                                  ),
                                  {
                                    name: studentName,
                                    kind: "Student",
                                    college:
                                      studentForm.college || "PES University",
                                    usn: studentForm.usn || "PES1UG24CS042",
                                    contact:
                                      studentForm.email ||
                                      "student@example.com",
                                    members: 1,
                                    status: "Accepted",
                                    consent: "Approved for organizer export",
                                  },
                                ],
                              }));
                              setOrganizerActivity((current) =>
                                current.some(
                                  (entry) =>
                                    entry.what ===
                                    `${studentName} accepted ${event.name}`,
                                )
                                  ? current
                                  : [
                                      {
                                        id: Date.now(),
                                        initials: initialsFor(studentName),
                                        org: studentName,
                                        what: `${studentName} accepted ${event.name}`,
                                        when: "Just now",
                                      },
                                      ...current,
                                    ],
                              );
                              notify(`You’re registered for ${event.name}.`);
                            }}
                            onDecline={() => {
                              setInvitedEventIds(
                                invitedEventIds.filter((id) => id !== event.id),
                              );
                              notify("Invitation declined.");
                            }}
                          />
                        ))
                    ) : (
                      <Empty
                        title="No invitations yet."
                        body="Event invitations from organizers will appear here."
                      />
                    )}
                  </>
                )}
              </>
            )}
            {role === "organizer" && (
              <>
                {page === "discover" && (
                  <>
                    <div className="page-heading plain discover-heading">
                      <div>
                        <div className="eyebrow">FIND YOUR NEXT TEAMMATE</div>
                        <h2>Discover people who build.</h2>
                        <p>
                          Filter individual students or teams, then invite
                          several at once.
                        </p>
                      </div>
                      <button
                        className="button secondary"
                        onClick={() => setPage("events")}
                      >
                        <HeartHandshake size={16} /> Your events
                      </button>
                    </div>
                    <div className="profile-filter-tabs">
                      <button
                        className={profileFilter === "All" ? "active" : ""}
                        onClick={() => setProfileFilter("All")}
                      >
                        All profiles
                      </button>
                      <button
                        className={profileFilter === "Students" ? "active" : ""}
                        onClick={() => setProfileFilter("Students")}
                      >
                        Students
                      </button>
                      <button
                        className={profileFilter === "Teams" ? "active" : ""}
                        onClick={() => setProfileFilter("Teams")}
                      >
                        Teams
                      </button>
                    </div>
                    <div className="discover-toolbar">
                      <label className="search-box">
                        <Search size={17} />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search people, skills, colleges…"
                        />
                        <kbd>⌘ K</kbd>
                      </label>
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      >
                        <option>All domains</option>
                        {[
                          "AI / ML",
                          "Civic tech",
                          "Climate",
                          "Robotics",
                          "Web",
                          "Design",
                          "Data",
                        ].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        <option>All regions</option>
                        <option>Bengaluru</option>
                        <option>Mangaluru</option>
                      </select>
                      <button className="filter-button">
                        <Filter size={16} /> Filters
                      </button>
                    </div>
                    {found.length > 0 && (
                      <div className="select-all-row">
                        <label>
                          <input
                            type="checkbox"
                            checked={found.every((profile) =>
                              selectedProfiles.includes(
                                directory.findIndex(
                                  (item) => item.name === profile.name,
                                ),
                              ),
                            )}
                            onChange={() => {
                              const visible = found.map((profile) =>
                                directory.findIndex(
                                  (item) => item.name === profile.name,
                                ),
                              );
                              const allSelected = visible.every((index) =>
                                selectedProfiles.includes(index),
                              );
                              setSelectedProfiles(
                                allSelected
                                  ? selectedProfiles.filter(
                                      (index) => !visible.includes(index),
                                    )
                                  : [
                                      ...new Set([
                                        ...selectedProfiles,
                                        ...visible,
                                      ]),
                                    ],
                              );
                            }}
                          />{" "}
                          Select all visible {profileFilter.toLowerCase()}{" "}
                          profiles
                        </label>
                      </div>
                    )}
                    {selectedProfiles.length > 0 && (
                      <div className="bulk-invite">
                        <span>
                          {selectedProfiles.length} profile
                          {selectedProfiles.length === 1 ? "" : "s"} selected
                        </span>
                        <button
                          className="button primary"
                          onClick={() => {
                            setInviteTargets(
                              selectedProfiles.map(
                                (index) => directory[index].name,
                              ),
                            );
                            setModal("invite");
                          }}
                        >
                          <HeartHandshake size={15} /> Invite selected
                        </button>
                      </div>
                    )}
                    <div className="result-count">
                      {found.length} profiles <span>·</span> Recent activity
                    </div>
                    {found.length ? (
                      <div className="discover-grid">
                        {found.map((p) => (
                          <DiscoverCard
                            key={p.name}
                            person={p}
                            selected={selectedProfiles.includes(
                              directory.findIndex((x) => x.name === p.name),
                            )}
                            toggle={() => {
                              const index = directory.findIndex(
                                (x) => x.name === p.name,
                              );
                              setSelectedProfiles(
                                selectedProfiles.includes(index)
                                  ? selectedProfiles.filter(
                                      (value) => value !== index,
                                    )
                                  : [...selectedProfiles, index],
                              );
                            }}
                            onOpen={() => {
                              setSelected(
                                directory.findIndex((x) => x.name === p.name),
                              );
                              setPage("detail");
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <Empty title="No matches." body="Try fewer filters." />
                    )}
                  </>
                )}
                {page === "detail" && (
                  <>
                    <button
                      className="back-link"
                      onClick={() => setPage("discover")}
                    >
                      ← Back to discover
                    </button>
                    {teamProfiles[
                      (directory[selected] ?? directory[0]).name
                    ] ? (
                      <TeamDetail
                        teamName={(directory[selected] ?? directory[0]).name}
                        onInvite={() => setModal("invite")}
                      />
                    ) : (
                      <Detail
                        person={directory[selected] ?? directory[0]}
                        ownerProfile={selected === 0 ? studentForm : undefined}
                        hackathons={
                          selected === 0 ? hackathons : sampleHackathons
                        }
                        documents={selected === 0 ? documents : []}
                        hasAccess={(s) =>
                          grantedScopes.includes("your full profile") ||
                          grantedScopes.includes(`your ${s} details`)
                        }
                        onRequest={(s) => {
                          setScope(s);
                          setModal("request");
                        }}
                        onInvite={() => setModal("invite")}
                      />
                    )}
                  </>
                )}
                {page === "organizerProfile" && (
                  <OrganizerProfile
                    profile={organizerForm}
                    setProfile={setOrganizerForm}
                    activity={organizerActivity}
                    save={() => {
                      window.localStorage.setItem(
                        "docpass-organizer-profile",
                        JSON.stringify(organizerForm),
                      );
                      notify("Organization profile saved.");
                    }}
                    openEvents={() => setPage("events")}
                  />
                )}
                {page === "requests" && (
                  <>
                    <Heading
                      eyebrow="ACCESS CONTROL"
                      title="My requests"
                      subtitle="Track the requests you’ve sent and manage approved access."
                    />
                    <div className="request-filters">
                      <button className="filter-active">
                        All <span>{requests.length}</span>
                      </button>
                      <button>Pending</button>
                      <button>Approved</button>
                      <button>Past</button>
                    </div>
                    <div className="organizer-request-list">
                      {requests.map((r) => (
                        <div className="organizer-request card" key={r.id}>
                          <div className="request-avatar">AR</div>
                          <div className="request-body">
                            <div className="request-line">
                              <b>Arjun Rao</b>
                              <Status status={r.status} />
                            </div>
                            <p>{r.scope} · Sent just now</p>
                          </div>
                          <div className="org-request-actions">
                            {r.status === "Pending" ? (
                              <button
                                className="text-button"
                                onClick={() =>
                                  setRequests(
                                    requests.filter((x) => x.id !== r.id),
                                  )
                                }
                              >
                                Cancel request
                              </button>
                            ) : r.status === "Approved" ? (
                              <>
                                <span>Expires {r.expires}</span>
                                <button
                                  className="button secondary"
                                  onClick={() => revoke(r.id)}
                                >
                                  Revoke access
                                </button>
                              </>
                            ) : (
                              <span className="muted">No active access</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {page === "events" && (
                  <>
                    <Heading
                      eyebrow="BRING GREAT PEOPLE TOGETHER"
                      title="Your events"
                      subtitle="Invite students and teams to your next event."
                      action={
                        <button
                          className="button primary"
                          onClick={() => setModal("event")}
                        >
                          <Plus size={16} /> Create event
                        </button>
                      }
                    />
                    {events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        student={false}
                        invites={event.id === activeEventId ? invites : []}
                        accepted={
                          acceptedEventIds.includes(event.id)
                            ? [studentName]
                            : []
                        }
                        attendees={acceptedAttendees[event.id] || []}
                        onExport={() => exportAcceptedAttendees(event)}
                        onInvite={() => {
                          setActiveEventId(event.id);
                          setModal("invite");
                        }}
                      />
                    ))}
                  </>
                )}
              </>
            )}
            <footer className="footer">
              <span>© 2026 DocPass</span>
              <span>
                <CircleHelpIcon /> Your privacy matters
              </span>
              <span>Made for people who build.</span>
            </footer>
          </main>
          {modal && (
            <Modal
              kind={modal}
              close={() => setModal(null)}
              form={form}
              setForm={setForm}
              add={addHackathon}
              sendRequest={sendRequest}
              scope={scope}
              setScope={setScope}
              documentForm={documentForm}
              setDocumentForm={setDocumentForm}
              addDocument={addDocument}
              eventForm={eventForm}
              setEventForm={setEventForm}
              addEvent={addEvent}
              invite={() => {
                const targets = inviteTargets.length
                  ? inviteTargets
                  : [studentName];
                const accepted: AcceptedAttendee[] = targets.map((name) => {
                  const profile = directory.find(
                    (person) => person.name === name,
                  );
                  return {
                    name,
                    kind: (profile?.kind === "team"
                      ? "Team"
                      : "Student") as AcceptedAttendee["kind"],
                    college:
                      profile?.college ||
                      studentForm.college ||
                      "PES University",
                    usn:
                      profile?.kind === "team"
                        ? `TEAM-${initialsFor(name)}-2026`
                        : name === studentName
                          ? studentForm.usn || "PES1UG24CS042"
                          : `USN-${initialsFor(name)}-2026`,
                    contact:
                      name === studentName
                        ? studentForm.email || "student@example.com"
                        : `${name.toLowerCase().replaceAll(" ", ".")}@demo.example`,
                    members:
                      profile?.kind === "team"
                        ? teamProfiles[name]?.members.length || 4
                        : 1,
                    status: "Accepted" as const,
                    consent: "Approved for organizer export",
                  };
                });
                setInvites([...new Set([...invites, ...targets])]);
                setInvitedEventIds([
                  ...new Set([...invitedEventIds, activeEventId]),
                ]);
                setAcceptedAttendees((current) => ({
                  ...current,
                  [activeEventId]: [
                    ...(current[activeEventId] || []).filter(
                      (attendee) => !targets.includes(attendee.name),
                    ),
                    ...accepted,
                  ],
                }));
                if (targets.includes(studentName))
                  setAcceptedEventIds([
                    ...new Set([...acceptedEventIds, activeEventId]),
                  ]);
                setOrganizerActivity((current) => [
                  {
                    id: Date.now(),
                    initials: "EW",
                    org: "EWIT",
                    what: `${targets.length} invitation${targets.length === 1 ? "" : "s"} auto-accepted for demo`,
                    when: "Just now",
                  },
                  ...current,
                ]);
                setModal(null);
                setSelectedProfiles([]);
                setInviteTargets([]);
                notify(
                  `${targets.length} invitation${targets.length === 1 ? "" : "s"} auto-accepted for the demo.`,
                );
              }}
            />
          )}
          {documentPreview && (
            <DocumentPreview
              document={documentPreview}
              close={() => setDocumentPreview(null)}
            />
          )}{" "}
          {privacyShield && (
            <PrivacyShield close={() => setPrivacyShield(false)} />
          )}{" "}
          {toast && (
            <div className="toast" role="status">
              <Check size={16} />
              {toast}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function IntroHero({ skip }: { skip: () => void }) {
  return (
    <main className="intro-hero">
      <button onClick={skip}>Skip intro</button>
      <div className="intro-orbit orbit-a" />
      <div className="intro-orbit orbit-b" />
      <section>
        <div className="intro-mark">
          <span className="brand-mark">
            <span />
          </span>
          <b>docpass</b>
        </div>
        <p>YOUR VERIFIED STUDENT IDENTITY</p>
        <h1>
          Own your story.
          <br />
          <em>Share on your terms.</em>
        </h1>
        <div className="intro-line">
          <span />
        </div>
        <small>
          Profiles, teams and documents - with permission at every step.
        </small>
      </section>
      <div className="intro-bottom">
        <span>PRIVATE BY DESIGN</span>
        <span>EWIT 2026</span>
      </div>
    </main>
  );
}
function StartScreen({
  page,
  role,
  chooseRole,
  studentForm,
  setStudentForm,
  organizerForm,
  setOrganizerForm,
  onPhoto,
  complete,
  back,
}: {
  page: Page;
  role: Role;
  chooseRole: (role: Role) => void;
  studentForm: StudentProfileForm;
  setStudentForm: (value: StudentProfileForm) => void;
  organizerForm: OrganizerProfileForm;
  setOrganizerForm: (value: OrganizerProfileForm) => void;
  onPhoto: (file: File) => void;
  complete: () => void;
  back: () => void;
}) {
  const student = role === "student";
  return (
    <main className="start-shell">
      <div className="start-brand">
        <span className="brand-mark">
          <span />
        </span>
        <b>docpass</b>
      </div>
      {page === "welcome" ? (
        <section className="start-card welcome-card">
          <div className="eyebrow">BUILD YOUR PROFILE FIRST</div>
          <h1>Start with a profile that is yours.</h1>
          <p>
            Add the information you want organizers to discover. Your private
            records stay in your document vault until you approve access.
          </p>
          <div className="role-choice-grid">
            <button onClick={() => chooseRole("student")}>
              <UserRound size={22} />
              <b>I’m a student</b>
              <span>
                Create your profile, portfolio and private document vault.
              </span>
              <ArrowRight size={17} />
            </button>
            <button onClick={() => chooseRole("organizer")}>
              <Building2 size={22} />
              <b>I’m an organizer</b>
              <span>Create an organization profile and discover students.</span>
              <ArrowRight size={17} />
            </button>
          </div>
          <small>
            You can use synthetic details while exploring the local demo.
          </small>
        </section>
      ) : (
        <section className="start-card onboarding-card">
          <button className="back-link start-back" onClick={back}>
            ← Choose another role
          </button>
          <div className="eyebrow">
            {student ? "STUDENT SETUP" : "ORGANIZER SETUP"}
          </div>
          <h1>
            {student
              ? "Create your student profile."
              : "Create your organization profile."}
          </h1>
          <p>
            {student
              ? "This is your private owner view. You can change the portfolio and document sections after setup."
              : "This is what students see before they decide whether to approve your request."}
          </p>
          {student ? (
            <div className="setup-form">
              <label>
                Full name *
                <input
                  value={studentForm.fullName}
                  onChange={(event) =>
                    setStudentForm({
                      ...studentForm,
                      fullName: event.target.value,
                    })
                  }
                  placeholder="e.g. Ananya Menon"
                />
              </label>
              <label>
                College *
                <input
                  value={studentForm.college}
                  onChange={(event) =>
                    setStudentForm({
                      ...studentForm,
                      college: event.target.value,
                    })
                  }
                  placeholder="e.g. PES University"
                />
              </label>
              <label>
                USN *
                <input
                  value={studentForm.usn}
                  onChange={(event) =>
                    setStudentForm({ ...studentForm, usn: event.target.value })
                  }
                  placeholder="e.g. PES1UG24CS042"
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(event) =>
                    setStudentForm({
                      ...studentForm,
                      email: event.target.value,
                    })
                  }
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Region *
                <input
                  value={studentForm.region}
                  onChange={(event) =>
                    setStudentForm({
                      ...studentForm,
                      region: event.target.value,
                    })
                  }
                  placeholder="e.g. Bengaluru"
                />
              </label>
              <label>
                Aadhaar number *
                <input
                  inputMode="numeric"
                  value={studentForm.aadhaar}
                  onChange={(event) =>
                    setStudentForm({
                      ...studentForm,
                      aadhaar: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12),
                    })
                  }
                  placeholder="12 digits"
                />
                <small>
                  Stored encrypted in production. Organizers only see the last 4
                  after approval.
                </small>
              </label>
              <label className="wide profile-upload">
                Profile photo{" "}
                <span>
                  {studentForm.photoData ? (
                    <img src={studentForm.photoData} alt="Selected profile" />
                  ) : (
                    <ImagePlus size={17} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onPhoto(file);
                    }}
                  />
                </span>
                <small>This photo is visible on your public profile.</small>
              </label>
              <label className="wide">
                Short bio{" "}
                <textarea
                  value={studentForm.bio}
                  onChange={(event) =>
                    setStudentForm({ ...studentForm, bio: event.target.value })
                  }
                  placeholder="What are you building or learning?"
                  rows={3}
                />
              </label>
            </div>
          ) : (
            <div className="setup-form">
              <label>
                Full name *
                <input
                  value={organizerForm.fullName}
                  onChange={(event) =>
                    setOrganizerForm({
                      ...organizerForm,
                      fullName: event.target.value,
                    })
                  }
                  placeholder="e.g. Nisha Shah"
                />
              </label>
              <label>
                Organization *
                <input
                  value={organizerForm.organization}
                  onChange={(event) =>
                    setOrganizerForm({
                      ...organizerForm,
                      organization: event.target.value,
                    })
                  }
                  placeholder="e.g. Northstar Ventures"
                />
              </label>
              <label>
                Designation *
                <input
                  value={organizerForm.designation}
                  onChange={(event) =>
                    setOrganizerForm({
                      ...organizerForm,
                      designation: event.target.value,
                    })
                  }
                  placeholder="e.g. Talent Partner"
                />
              </label>
              <label>
                Organization type *
                <select
                  value={organizerForm.type}
                  onChange={(event) =>
                    setOrganizerForm({
                      ...organizerForm,
                      type: event.target.value,
                    })
                  }
                >
                  <option>Hackathon organizer</option>
                  <option>Recruiter</option>
                  <option>College</option>
                </select>
              </label>
              <label>
                Work email *
                <input
                  type="email"
                  value={organizerForm.email}
                  onChange={(event) =>
                    setOrganizerForm({
                      ...organizerForm,
                      email: event.target.value,
                    })
                  }
                  placeholder="you@organization.com"
                />
              </label>
              <label>
                Region *
                <input
                  value={organizerForm.region}
                  onChange={(event) =>
                    setOrganizerForm({
                      ...organizerForm,
                      region: event.target.value,
                    })
                  }
                  placeholder="e.g. Bengaluru"
                />
              </label>
              <label className="wide">
                Website or LinkedIn{" "}
                <input
                  value={organizerForm.website}
                  onChange={(event) =>
                    setOrganizerForm({
                      ...organizerForm,
                      website: event.target.value,
                    })
                  }
                  placeholder="https://"
                />
              </label>
            </div>
          )}
          <div className="start-actions">
            <button className="button secondary" onClick={back}>
              Back
            </button>
            <button className="button primary" onClick={complete}>
              Continue to DocPass <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
function CircleHelpIcon() {
  return <span aria-hidden="true">ⓘ</span>;
}
function Avatar({
  initials,
  small = false,
  profile = false,
  image,
}: {
  initials: string;
  small?: boolean;
  profile?: boolean;
  image?: string;
}) {
  return (
    <div
      className={`avatar ${small ? "small" : ""} ${profile ? "profile-avatar" : ""} ${image ? "avatar-image" : ""}`}
    >
      {image ? <img src={image} alt="Profile" /> : initials}
    </div>
  );
}
function Tag({
  children,
  color = "pink",
}: {
  children: ReactNode;
  color?: "pink" | "blue" | "amber";
}) {
  return <span className={`tag ${color}`}>{children}</span>;
}
function Status({ status }: { status: string }) {
  return (
    <span className={`status ${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}
function Heading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading plain">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Hero({ onProfile }: { onProfile: () => void }) {
  return (
    <section className="hero-card">
      <div className="hero-content">
        <div className="eyebrow light">
          YOUR DOC PASS <span>✦</span>
        </div>
        <h1>
          One profile.
          <br />
          Total control.
        </h1>
        <p>
          Show your work to the world. Share your documents only with people you
          trust.
        </p>
        <button className="hero-cta" onClick={onProfile}>
          <Globe2 size={16} /> View public profile <ArrowRight size={16} />
        </button>
      </div>
      <div className="hero-art">
        <div className="art-orbit orbit1" />
        <div className="art-orbit orbit2" />
        <div className="art-card">
          <div className="art-card-top">
            <Avatar initials="AR" />
            <span className="verified">
              <Check size={11} />
            </span>
          </div>
          <b>Arjun Rao</b>
          <small>PES University · Bengaluru</small>
          <div className="art-tags">
            <span>AI / ML</span>
            <span>+3</span>
          </div>
        </div>
        <div className="float-lock">
          <LockKeyhole size={17} />
        </div>
        <div className="float-spark">✦</div>
      </div>
    </section>
  );
}
function HackCard({
  item,
  index,
  onOpen,
}: {
  item: Hackathon;
  index: number;
  onOpen: () => void;
}) {
  return (
    <article className="hack-card card">
      <div className={`hack-art art-${index % 3}`}>
        <span className="hack-art-glyph">{index === 0 ? "✳" : "◌"}</span>
        <div className="hack-date">{item.date}</div>
      </div>
      <div className="hack-body">
        <div className="hack-org">{item.org}</div>
        <h4>{item.name}</h4>
        <p className="hack-summary">{item.summary}</p>
        <div className="hack-meta">
          <span>
            <MapPin size={13} />
            {item.location}
          </span>
          <div className="tag-row">
            {item.tags.slice(0, 2).map((t, i) => (
              <Tag key={t} color={i ? "blue" : "pink"}>
                {t}
              </Tag>
            ))}
          </div>
        </div>
        <button className="link-button" onClick={onOpen}>
          Open in my profile <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}
function TeamPanel({ onInvite }: { onInvite: () => void }) {
  const members = [
    ["Ananya Menon", "Product & research", "AM"],
    ["Rohan Kulkarni", "Frontend engineering", "RK"],
    ["Zoya Khan", "Data & ML", "ZK"],
    ["Dev Malhotra", "Backend engineering", "DM"],
  ];
  const hackathons = [
    [
      "CivicSpark Hackathon",
      "Apr 2026",
      "Built NammaRoute, an accessible bus-routing assistant with Kannada voice input.",
    ],
    [
      "GreenTech Buildathon",
      "Aug 2025",
      "Created Rainwise, a rainfall insight tool for apartment water planning.",
    ],
  ];
  return (
    <div className="team-panel card">
      <div className="team-top">
        <div className="team-avatar">M</div>
        <div>
          <div className="eyebrow">YOUR TEAM</div>
          <h3>Monsoon Makers</h3>
          <p>4 members · Bengaluru</p>
        </div>
        <button className="subtle-button" onClick={onInvite}>
          My profile <ArrowRight size={15} />
        </button>
      </div>
      <section className="team-section">
        <div className="team-section-heading">
          <div>
            <span className="project-label">TEAM MEMBERS</span>
            <h4>People behind the work</h4>
          </div>
          <span>4 members</span>
        </div>
        <div className="team-members">
          {members.map(([name, role, initials]) => (
            <div className="team-member" key={name}>
              <Avatar initials={initials} />
              <div>
                <b>{name}</b>
                <span>{role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="team-section">
        <div className="team-section-heading">
          <div>
            <span className="project-label">PAST HACKATHONS</span>
            <h4>What Monsoon Makers built</h4>
          </div>
          <span>2 projects</span>
        </div>
        <div className="team-hack-list">
          {hackathons.map(([name, date, description]) => (
            <article className="team-hack" key={name}>
              <div>
                <b>{name}</b>
                <span>{date}</span>
              </div>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
function RequestCard({
  item,
  expiry,
  setExpiry,
  decide,
  revoke,
}: {
  item: AccessRequest;
  expiry: string;
  setExpiry: (v: string) => void;
  decide: (id: number, s: StatusValue) => void;
  revoke: (id: number) => void;
}) {
  return (
    <article className="request-card card">
      <div className="request-avatar">
        {item.org
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")}
      </div>
      <div className="request-body">
        <div className="request-line">
          <b>{item.org}</b>
          <Status status={item.status} />
        </div>
        <p>
          wants to see <b>{item.scope}</b>.
        </p>
        {item.status === "Pending" ? (
          <>
            <label className="select-label">Keep access for</label>
            <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
              <option>24 hours</option>
              <option>7 days</option>
              <option>30 days</option>
              <option>Until I revoke</option>
            </select>
            <div className="request-actions">
              <button
                className="button primary"
                onClick={() => decide(item.id, "Approved")}
              >
                <Check size={15} /> Approve
              </button>
              <button
                className="button secondary"
                onClick={() => decide(item.id, "Denied")}
              >
                Deny
              </button>
            </div>
          </>
        ) : (
          <div className="request-expiry">
            {item.status === "Approved"
              ? `Access granted until ${item.expires}.`
              : `Request ${item.status.toLowerCase()}.`}
            {item.status === "Approved" && (
              <button onClick={() => revoke(item.id)}>Revoke access</button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
function ActivityRow({
  initials,
  org,
  what,
  when,
}: {
  initials: string;
  org: string;
  what: string;
  when: string;
}) {
  return (
    <div className="activity-row">
      <div className="request-avatar">{initials}</div>
      <div>
        <b>{org}</b>
        <p>Viewed {what}</p>
      </div>
      <time>{when}</time>
    </div>
  );
}
function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FileLock2 size={19} />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
function OwnStudentProfile({
  hackathons,
  documents,
  profile,
  openDocuments,
  addHackathon,
}: {
  hackathons: Hackathon[];
  documents: PrivateDocument[];
  profile: StudentProfileForm;
  openDocuments: () => void;
  addHackathon: () => void;
}) {
  const name = profile.fullName || "Arjun Rao";
  return (
    <>
      <Heading
        eyebrow="YOUR COMPLETE PROFILE"
        title="Everything about your work, in one place."
        subtitle="You can always see your private information and documents."
        action={
          <button className="button primary" onClick={addHackathon}>
            <Plus size={16} /> Add hackathon
          </button>
        }
      />
      <section className="owner-profile card">
        <div className="detail-cover" />
        <div className="owner-profile-head">
          <Avatar
            initials={initialsFor(name)}
            image={profile.photoData}
            profile
          />
          <div className="detail-identity">
            <div className="eyebrow">STUDENT PROFILE · OWNER VIEW</div>
            <h2>{name}</h2>
            <p>
              {profile.college || "Your college"} <span>·</span>{" "}
              {profile.region || "Your region"}
            </p>
            <div className="tag-row">
              <Tag color="pink">AI / ML</Tag>
              <Tag color="blue">Civic tech</Tag>
              <Tag color="amber">React</Tag>
            </div>
          </div>
          <div className="owner-profile-actions">
            <button className="button secondary" onClick={openDocuments}>
              <FileText size={15} /> My documents
            </button>
          </div>
        </div>
        <div className="owner-content">
          <section>
            <div className="section-title">
              <div>
                <h3>Private identity details</h3>
                <p>Visible to you at all times.</p>
              </div>
              <span className="owner-only">
                <ShieldCheck size={14} /> Owner only
              </span>
            </div>
            <div className="identity-grid">
              <div>
                <span>College</span>
                <b>{profile.college || "Not added"}</b>
              </div>
              <div>
                <span>USN</span>
                <b>{profile.usn || "Not added"}</b>
              </div>
              <div>
                <span>Email</span>
                <b>{profile.email || "Not added"}</b>
              </div>
              <div>
                <span>Aadhaar</span>
                <b>
                  {profile.aadhaar
                    ? `•••• •••• ${profile.aadhaar.slice(-4)}`
                    : "Not added"}
                </b>
              </div>
            </div>
          </section>
          <section>
            <div className="section-title">
              <div>
                <h3>Past hackathons</h3>
                <p>Full descriptions and links are visible to you.</p>
              </div>
            </div>
            <div className="owner-hack-list">
              {hackathons.map((h) => (
                <article className="owner-hack card" key={h.name}>
                  <div className="owner-hack-heading">
                    <div>
                      <div className="eyebrow">
                        {h.org} · {h.date}
                      </div>
                      <h3>{h.name}</h3>
                    </div>
                    <span>
                      <MapPin size={13} />
                      {h.location}
                    </span>
                  </div>
                  <p>{h.description}</p>
                  <div className="tag-row">
                    {h.tags.map((tag, index) => (
                      <Tag key={tag} color={index ? "blue" : "pink"}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  {h.github && (
                    <a
                      className="private-link"
                      href={h.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Code2 size={14} /> Open project repository
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
          <section>
            <div className="section-title">
              <div>
                <h3>Document vault</h3>
                <p>
                  {documents.length} private documents, organized by purpose.
                </p>
              </div>
              <button className="subtle-button" onClick={openDocuments}>
                Open vault <ArrowRight size={15} />
              </button>
            </div>
            <div className="document-summary">
              {(["Identity", "Certificates", "Projects"] as const).map(
                (category) => (
                  <div key={category}>
                    <FileText size={17} />
                    <b>
                      {
                        documents.filter(
                          (document) => document.category === category,
                        ).length
                      }
                    </b>
                    <span>{category}</span>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
function DocumentsPage({
  documents,
  add,
  remove,
  open,
}: {
  documents: PrivateDocument[];
  add: () => void;
  remove: (id: number) => void;
  open: (document: PrivateDocument) => void;
}) {
  const groups: PrivateDocument["category"][] = [
    "Identity",
    "Certificates",
    "Projects",
  ];
  return (
    <>
      <Heading
        eyebrow="YOUR PRIVATE VAULT"
        title="Documents, clearly organized."
        subtitle="Only you can view, add or remove these records."
        action={
          <button className="button primary" onClick={add}>
            <Plus size={16} /> Add document
          </button>
        }
      />
      <div className="document-notice">
        <ShieldCheck size={18} />
        <div>
          <b>Private by default</b>
          <p>
            Organizers only receive access after you approve a request. Your own
            view never needs approval.
          </p>
        </div>
      </div>
      <div className="document-groups">
        {groups.map((category) => {
          const grouped = documents.filter(
            (document) => document.category === category,
          );
          return (
            <section className="document-group card" key={category}>
              <div className="document-group-heading">
                <div>
                  <div className="eyebrow">{category.toUpperCase()}</div>
                  <h3>{category} documents</h3>
                </div>
                <span>
                  {grouped.length} file{grouped.length === 1 ? "" : "s"}
                </span>
              </div>
              {grouped.length ? (
                grouped.map((document) => (
                  <article className="document-row" key={document.id}>
                    <div className="document-icon">
                      <FileText size={18} />
                    </div>
                    <div>
                      <b>{document.name}</b>
                      <p>{document.note}</p>
                      <small>
                        Updated {document.updated} · {document.size}
                      </small>
                    </div>
                    <div className="document-row-actions">
                      <button
                        className="subtle-button"
                        onClick={() => open(document)}
                      >
                        View details
                      </button>
                      <button
                        className="delete-button"
                        aria-label={`Remove ${document.name}`}
                        onClick={() => remove(document.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <Empty
                  title="No documents here yet."
                  body="Add a document to keep this section organized."
                />
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
function OrganizerProfile({
  profile,
  setProfile,
  save,
  openEvents,
  activity,
}: {
  profile: OrganizerProfileForm;
  setProfile: (value: OrganizerProfileForm) => void;
  save: () => void;
  openEvents: () => void;
  activity: ActivityEntry[];
}) {
  const organization = profile.organization || "Your organization";
  const set = (key: keyof OrganizerProfileForm, value: string) =>
    setProfile({ ...profile, [key]: value });
  return (
    <>
      <Heading
        eyebrow="ORGANIZER PROFILE"
        title={organization}
        subtitle="Complete these details so students know exactly who is contacting them."
        action={
          <button className="button primary" onClick={openEvents}>
            <HeartHandshake size={16} /> Manage events
          </button>
        }
      />
      <section className="organizer-profile card">
        <div className="detail-cover organizer-cover" />
        <div className="owner-profile-head">
          <Avatar initials={initialsFor(organization)} profile />
          <div className="detail-identity">
            <div className="eyebrow">
              {(profile.type || "Organizer").toUpperCase()} ·{" "}
              {profile.region || "YOUR REGION"}
            </div>
            <h2>{organization}</h2>
            <p>
              {profile.motto || "Add your college or organization motto below."}
            </p>
          </div>
        </div>
        <div className="owner-content organizer-content">
          <section>
            <div className="section-title">
              <div>
                <h3>Organization information</h3>
                <p>
                  These details are visible to students on requests and
                  invitations.
                </p>
              </div>
              <button className="button primary" onClick={save}>
                Save changes
              </button>
            </div>
            <div className="org-form">
              <label>
                Organization / college
                <input
                  value={profile.organization}
                  onChange={(e) => set("organization", e.target.value)}
                />
              </label>
              <label>
                Location / region
                <input
                  value={profile.region}
                  onChange={(e) => set("region", e.target.value)}
                />
              </label>
              <label>
                Principal / head
                <input
                  value={profile.principal}
                  onChange={(e) => set("principal", e.target.value)}
                  placeholder="e.g. Dr. Kavita Rao"
                />
              </label>
              <label>
                Contact person
                <input
                  value={profile.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                />
              </label>
              <label>
                Designation
                <input
                  value={profile.designation}
                  onChange={(e) => set("designation", e.target.value)}
                />
              </label>
              <label>
                Work email
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </label>
              <label className="wide">
                Motto
                <input
                  value={profile.motto}
                  onChange={(e) => set("motto", e.target.value)}
                  placeholder="e.g. Learn, lead and serve"
                />
              </label>
              <label className="wide">
                Campus address
                <input
                  value={profile.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Street, city, state"
                />
              </label>
              <label className="wide">
                About the organization
                <textarea
                  value={profile.about}
                  rows={3}
                  onChange={(e) => set("about", e.target.value)}
                  placeholder="What should students know about your institution or event program?"
                />
              </label>
            </div>
          </section>
          <section className="organizer-message">
            <Building2 size={20} />
            <div>
              <h3>A clear organization profile builds trust.</h3>
              <p>
                Students see your saved information before approving access or
                accepting invitations.
              </p>
            </div>
          </section>
          <section className="organizer-activity">
            <div className="section-title">
              <div>
                <h3>Invitation activity</h3>
                <p>Student acceptances appear here immediately.</p>
              </div>
            </div>
            {activity.length ? (
              activity.map((entry) => <ActivityRow key={entry.id} {...entry} />)
            ) : (
              <Empty
                title="No invitation activity yet."
                body="Accepted event invitations will appear here."
              />
            )}
          </section>
        </div>
      </section>
    </>
  );
}
function DiscoverCard({
  person,
  onOpen,
  selected,
  toggle,
}: {
  person: (typeof people)[number];
  onOpen: () => void;
  selected: boolean;
  toggle: () => void;
}) {
  return (
    <article
      className={`discover-card card ${selected ? "bulk-selected" : ""}`}
    >
      <div className="discover-cover">
        <span>
          {person.kind === "team" ? "TEAM PROFILE" : "STUDENT PROFILE"}
        </span>
        <label
          className="select-profile"
          onClick={(event) => event.stopPropagation()}
        >
          <input type="checkbox" checked={selected} onChange={toggle} />
          <span>Select</span>
        </label>
      </div>
      <div className="discover-content">
        <div className="discover-person">
          <Avatar initials={person.avatar} />
          <div>
            <h3>{person.name}</h3>
            <p>{person.college}</p>
          </div>
        </div>
        <p className="discover-bio">{person.headline}</p>
        <div className="tag-row">
          {person.tags.slice(0, 3).map((t, j) => (
            <Tag key={t} color={(["pink", "blue", "amber"] as const)[j]}>
              {t}
            </Tag>
          ))}
        </div>
        <div className="discover-hacks">
          <b>PAST HACKATHONS</b>
          <span>{person.hacks.join(" · ")}</span>
        </div>
        <div className="discover-footer">
          <span>
            <MapPin size={13} />
            {person.region}
          </span>
          <button className="button primary" onClick={onOpen}>
            View profile <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
function Locked({
  approved,
  onRequest,
  children,
}: {
  approved: boolean;
  onRequest: () => void;
  children: ReactNode;
}) {
  return approved ? (
    <>{children}</>
  ) : (
    <div className="locked-wrap">
      <div className="locked-blur" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="locked-overlay">
        <div className="lock-round">
          <LockKeyhole size={16} />
        </div>
        <b>Locked by the student</b>
        <p>Ask to see the full details. They'll get a request and decide.</p>
        <button className="button primary" onClick={onRequest}>
          Request access <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
function Detail({
  person,
  ownerProfile,
  hackathons,
  documents,
  hasAccess,
  onRequest,
  onInvite,
}: {
  person: (typeof people)[number];
  ownerProfile?: StudentProfileForm;
  hackathons: Hackathon[];
  documents: PrivateDocument[];
  hasAccess: (scope: string) => boolean;
  onRequest: (scope: string) => void;
  onInvite: () => void;
}) {
  const fullAccess = hasAccess("Everything");
  return (
    <section className="detail-hero card">
      <div className="detail-cover" />
      <div className="detail-main">
        <Avatar
          initials={person.avatar}
          image={ownerProfile?.photoData}
          profile
        />
        <div className="detail-identity">
          <div className="eyebrow">STUDENT PROFILE · PUBLIC</div>
          <h2>{person.name}</h2>
          <p>
            {person.college} <span>·</span> {person.region}
          </p>
          <div className="tag-row">
            {person.tags.map((t, i) => (
              <Tag key={t} color={i ? "blue" : "pink"}>
                {t}
              </Tag>
            ))}
          </div>
        </div>
        <button className="button secondary" onClick={onInvite}>
          <HeartHandshake size={15} /> Invite
        </button>
      </div>
      {fullAccess && (
        <div className="access-granted">
          <ShieldCheck size={16} />
          <b>Full profile access approved</b>
          <span>
            The student’s private details and shared documents are visible
            below.
          </span>
        </div>
      )}
      <div className="detail-columns">
        <div>
          <h3>Past hackathons</h3>
          <p className="muted">A few things they’ve been working on.</p>
          {hackathons.map((h) => (
            <div className="detail-hack card" key={h.name}>
              <div className="detail-hack-meta">
                <span>{h.org}</span>
                <span>
                  {h.date} · {h.location}
                </span>
              </div>
              <h4>{h.name}</h4>
              <p>{h.summary}</p>
              <div className="tag-row">
                {h.tags.map((t, i) => (
                  <Tag key={t} color={i ? "blue" : "pink"}>
                    {t}
                  </Tag>
                ))}
              </div>
              <Locked
                approved={fullAccess || hasAccess(h.name)}
                onRequest={() => onRequest(h.name)}
              >
                <div className="locked-details">
                  <div className="approved-label">
                    <Check size={13} /> Approved project details
                  </div>
                  <h4>Project details</h4>
                  <p>{h.description}</p>
                  {h.github && (
                    <a href={h.github} target="_blank" rel="noreferrer">
                      <Code2 size={14} /> {h.github}
                    </a>
                  )}
                  <div className="shared-documents">
                    {documents.filter(
                      (document) => document.category !== "Identity",
                    ).length ? (
                      documents
                        .filter((document) => document.category !== "Identity")
                        .map((document) =>
                          document.fileUrl ? (
                            <a
                              key={document.id}
                              href={document.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FileText size={14} />
                              {document.name}
                            </a>
                          ) : (
                            <span key={document.id}>
                              <FileText size={14} />
                              {document.name}
                            </span>
                          ),
                        )
                    ) : (
                      <span>No project documents have been shared</span>
                    )}
                  </div>
                </div>
              </Locked>
            </div>
          ))}
        </div>
        <aside className="detail-aside">
          <div className="locked-profile card">
            <div className="eyebrow">PRIVATE DETAILS</div>
            <Locked
              approved={fullAccess}
              onRequest={() => onRequest("Everything")}
            >
              <div className="approved-label">
                <Check size={13} /> Student approved access
              </div>
              <div className="locked-line">
                <LockKeyhole size={16} />
                <span>USN · {ownerProfile?.usn || "Not provided"}</span>
              </div>
              <div className="locked-line">
                <LockKeyhole size={16} />
                <span>
                  Aadhaar ···· {ownerProfile?.aadhaar.slice(-4) || "—"}
                </span>
              </div>
              <div className="locked-line">
                <LockKeyhole size={16} />
                <span>Email · {ownerProfile?.email || "Not provided"}</span>
              </div>
              <div className="approved-profile">
                <p>Private details currently shared by the student.</p>
              </div>
            </Locked>
            <p className="aside-caption">Student approval required</p>
          </div>
          <div className="activity-mini">
            <ShieldCheck size={17} />
            <p>
              Every private view is recorded in the student's access activity.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
function TeamDetail({
  teamName,
  onInvite,
}: {
  teamName: string;
  onInvite: () => void;
}) {
  const team = teamProfiles[teamName];
  return (
    <section className="detail-hero team-detail card">
      <div className="detail-cover" />
      <div className="detail-main">
        <Avatar initials={initialsFor(teamName)} profile />
        <div className="detail-identity">
          <div className="eyebrow">TEAM PROFILE · PUBLIC</div>
          <h2>{teamName}</h2>
          <p>
            {team.college} <span>·</span> {team.region}
          </p>
          <div className="team-stats">
            <div>
              <b>{team.projects.length}</b>
              <span>Hackathons</span>
            </div>
            <div>
              <b>{team.wins}</b>
              <span>{team.wins === 1 ? "Win" : "Wins"}</span>
            </div>
            <div>
              <b>{team.certificates}</b>
              <span>Certificates</span>
            </div>
            <div>
              <b>{team.members.length}</b>
              <span>Members</span>
            </div>
          </div>
        </div>
        <button className="button secondary" onClick={onInvite}>
          <HeartHandshake size={15} /> Invite team
        </button>
      </div>
      <div className="team-summary-grid">
        <section>
          <div className="eyebrow">TEAM SUMMARY</div>
          <h3>Built for real people and places.</h3>
          <p>{team.summary}</p>
          <div className="tag-row">
            {team.projects[0].tags.map((tag, index) => (
              <Tag key={tag} color={index ? "blue" : "pink"}>
                {tag}
              </Tag>
            ))}
          </div>
        </section>
        <aside>
          <div className="eyebrow">TEAM MEMBERS</div>
          {team.members.map((member) => (
            <p key={member.name}>
              <b>{member.name}</b> · {member.role}
            </p>
          ))}
        </aside>
      </div>
      <section className="team-past">
        <div>
          <h3>Past hackathons</h3>
          <p className="muted">Project summaries shared by the team.</p>
        </div>
        {team.projects.map((project) => (
          <article className="team-project-summary" key={project.name}>
            <div>
              <span>{project.result}</span>
              <h4>{project.name}</h4>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
            <p>{project.summary}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
function EventCard({
  event,
  student,
  invites,
  accepted,
  attendees,
  onExport,
  onAccept,
  onDecline,
  onInvite,
}: {
  event: EventItem;
  student: boolean;
  invites?: string[];
  accepted?: string[];
  attendees?: AcceptedAttendee[];
  onExport?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onInvite?: () => void;
}) {
  return (
    <div className={student ? "event-card card" : "organizer-event card"}>
      <div className="event-icon">✳</div>
      <div className={student ? "" : "event-main"}>
        <div className="eyebrow">
          {student ? "INVITED EVENT" : `UPCOMING · ${event.date.toUpperCase()}`}
        </div>
        <h3>{event.name}</h3>
        <p>
          {event.date} · {event.venue}
        </p>
        <p className="event-description">{event.description}</p>
        {student ? (
          <span className="event-domain">{event.domains}</span>
        ) : (
          <div className="invitees">
            <b>INVITED</b>
            <span>
              {invites?.length
                ? invites.join(", ") + " · Pending"
                : "No invitations yet"}
            </span>
            {accepted?.length ? (
              <span className="accepted-invites">
                <Check size={13} /> {accepted.length} accepted ·{" "}
                {accepted.join(", ")}
              </span>
            ) : null}
          </div>
        )}
      </div>
      {student ? (
        <div className="event-actions">
          <button className="button secondary" onClick={onDecline}>
            Decline
          </button>
          <button className="button primary" onClick={onAccept}>
            Accept invite
          </button>
        </div>
      ) : (
        <div className="event-organizer-actions">
          <button className="button primary" onClick={onInvite}>
            <Plus size={15} /> Invite someone
          </button>
        </div>
      )}
      {!student && attendees && (
        <div className="event-analysis">
          <div className="event-analysis-head">
            <div>
              <b>Event attendance analysis</b>
              <span>
                {attendees.length} accepted ·{" "}
                {
                  attendees.filter((attendee) => attendee.kind === "Team")
                    .length
                }{" "}
                teams ·{" "}
                {
                  attendees.filter((attendee) => attendee.kind === "Student")
                    .length
                }{" "}
                students
              </span>
            </div>
            <button className="button secondary" onClick={onExport}>
              <FileText size={14} /> Export approved data
            </button>
          </div>
          <div className="accepted-list">
            {attendees.length ? (
              attendees.map((attendee) => (
                <div key={attendee.name}>
                  <Avatar initials={initialsFor(attendee.name)} small />
                  <span>
                    <b>{attendee.name}</b>
                    <small>
                      {attendee.kind} · {attendee.college} · {attendee.members}{" "}
                      {attendee.members === 1 ? "member" : "members"}
                    </small>
                  </span>
                  <i>
                    <Check size={13} /> Accepted
                  </i>
                </div>
              ))
            ) : (
              <p>No accepted invitations yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function PrivacyShield({ close }: { close: () => void }) {
  return (
    <div className="privacy-shield" role="alertdialog" aria-modal="true">
      <div>
        <ShieldAlert size={28} />
        <h2>Private view shielded</h2>
        <p>
          This screen hides private details when the app loses focus or a
          capture shortcut is detected. Resume only when you are in a private
          place.
        </p>
        <button className="button primary" onClick={close}>
          Resume private view
        </button>
      </div>
    </div>
  );
}
function DocumentPreview({
  document,
  close,
}: {
  document: PrivateDocument;
  close: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        className="modal-card document-preview"
        role="dialog"
        aria-modal="true"
        aria-label={`${document.name} details`}
      >
        <button className="modal-close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>
        <div className="modal-icon">
          <FileText size={19} />
        </div>
        <div className="eyebrow">
          {document.category.toUpperCase()} DOCUMENT
        </div>
        <h2>{document.name}</h2>
        <p className="modal-intro">{document.note}</p>
        <div className="preview-meta">
          <div>
            <span>Last updated</span>
            <b>{document.updated}</b>
          </div>
          <div>
            <span>File size</span>
            <b>{document.size}</b>
          </div>
          <div>
            <span>Access</span>
            <b>Student only</b>
          </div>
        </div>
        {document.fileUrl ? (
          <a
            className="button primary"
            href={document.fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open selected file <ArrowRight size={15} />
          </a>
        ) : (
          <div className="preview-placeholder">
            <FileLock2 size={22} />
            <p>
              This seeded demo document has no local file attached. Its private
              record is still organized here.
            </p>
          </div>
        )}
        <div className="modal-actions">
          <button className="button secondary" onClick={close}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
function FullField({ children }: { children: ReactNode }) {
  return <label className="full-field">{children}</label>;
}
function DomainPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [custom, setCustom] = useState("");
  const options = [
    "AI / ML",
    "Web development",
    "Civic tech",
    "Climate tech",
    "Robotics",
    "IoT",
    "Data science",
    "Design",
    "Cybersecurity",
  ];
  const selected = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const toggle = (domain: string) =>
    onChange(
      selected.includes(domain)
        ? selected.filter((item) => item !== domain).join(", ")
        : [...selected, domain].join(", "),
    );
  const addCustom = () => {
    const next = custom.trim();
    if (next && !selected.includes(next))
      onChange([...selected, next].join(", "));
    setCustom("");
  };
  return (
    <div className="domain-picker">
      <span>Domains *</span>
      <div className="domain-chips">
        {options.map((domain) => (
          <button
            type="button"
            key={domain}
            className={selected.includes(domain) ? "selected" : ""}
            onClick={() => toggle(domain)}
          >
            {selected.includes(domain) && <Check size={12} />} {domain}
          </button>
        ))}
      </div>
      <div className="custom-domain">
        <input
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add another domain"
        />
        <button type="button" onClick={addCustom}>
          Add
        </button>
      </div>
      {selected.length > 0 && <small>Selected: {selected.join(" · ")}</small>}
    </div>
  );
}
function Modal({
  kind,
  close,
  form,
  setForm,
  add,
  sendRequest,
  scope,
  setScope,
  documentForm,
  setDocumentForm,
  addDocument,
  eventForm,
  setEventForm,
  addEvent,
  invite,
}: {
  kind: "hackathon" | "request" | "invite" | "document" | "event";
  close: () => void;
  form: {
    name: string;
    org: string;
    location: string;
    date: string;
    tags: string;
    summary: string;
    description: string;
    github: string;
  };
  setForm: (x: typeof form) => void;
  add: () => void;
  sendRequest: () => void;
  scope: string;
  setScope: (v: string) => void;
  documentForm: {
    name: string;
    category: PrivateDocument["category"];
    note: string;
    fileName: string;
    file: File | null;
  };
  setDocumentForm: (value: typeof documentForm) => void;
  addDocument: () => void;
  eventForm: Omit<EventItem, "id">;
  setEventForm: (value: Omit<EventItem, "id">) => void;
  addEvent: () => void;
  invite: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>
        {kind === "event" ? (
          <>
            <div className="modal-icon">
              <HeartHandshake size={19} />
            </div>
            <div className="eyebrow">CREATE EVENT</div>
            <h2>Bring builders together.</h2>
            <div className="form-grid">
              <label>
                Event name *
                <input
                  value={eventForm.name}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, name: e.target.value })
                  }
                />
              </label>
              <label>
                Date *
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, date: e.target.value })
                  }
                />
              </label>
              <label>
                Venue *
                <input
                  value={eventForm.venue}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, venue: e.target.value })
                  }
                />
              </label>
              <DomainPicker
                value={eventForm.domains}
                onChange={(domains) => setEventForm({ ...eventForm, domains })}
              />
            </div>
            <FullField>
              Description *
              <textarea
                value={eventForm.description}
                rows={3}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
              />
            </FullField>
            <ModalActions
              close={close}
              action={addEvent}
              label="Create event"
            />
          </>
        ) : kind === "document" ? (
          <>
            <div className="modal-icon">
              <FileText size={19} />
            </div>
            <div className="eyebrow">ADD TO DOCUMENT VAULT</div>
            <h2>Keep a private record.</h2>
            <FullField>
              Document name *
              <input
                value={documentForm.name}
                onChange={(e) =>
                  setDocumentForm({ ...documentForm, name: e.target.value })
                }
              />
            </FullField>
            <FullField>
              Category
              <select
                value={documentForm.category}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    category: e.target.value as PrivateDocument["category"],
                  })
                }
              >
                <option>Identity</option>
                <option>Certificates</option>
                <option>Projects</option>
              </select>
            </FullField>
            <FullField>
              What is this? *
              <textarea
                value={documentForm.note}
                rows={3}
                onChange={(e) =>
                  setDocumentForm({ ...documentForm, note: e.target.value })
                }
              />
            </FullField>
            <FullField>
              Select local file (optional)
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setDocumentForm({
                    ...documentForm,
                    file,
                    fileName: file?.name ?? "",
                  });
                }}
              />
            </FullField>
            <ModalActions
              close={close}
              action={addDocument}
              label="Add document"
            />
          </>
        ) : kind === "request" ? (
          <>
            <div className="modal-icon">
              <LockKeyhole size={19} />
            </div>
            <div className="eyebrow">PRIVATE DETAILS</div>
            <h2>Ask to see the full details.</h2>
            <FullField>
              What would you like to see?
              <select value={scope} onChange={(e) => setScope(e.target.value)}>
                <option>Everything</option>
                {initialHackathons.map((h) => (
                  <option key={h.name}>{h.name}</option>
                ))}
              </select>
            </FullField>
            <ModalActions
              close={close}
              action={sendRequest}
              label="Request access"
            />
          </>
        ) : kind === "hackathon" ? (
          <>
            <div className="eyebrow">ADD TO YOUR PORTFOLIO</div>
            <h2>A build worth sharing.</h2>
            <div className="form-grid">
              {(
                ["name", "org", "location", "date", "tags", "github"] as const
              ).map((key) => (
                <label key={key}>
                  {key === "org"
                    ? "Organized by"
                    : key === "tags"
                      ? "Tags"
                      : key[0].toUpperCase() + key.slice(1)}
                  <input
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <FullField>
              One-line summary *
              <input
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </FullField>
            <FullField>
              Full description
              <textarea
                value={form.description}
                rows={3}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </FullField>
            <ModalActions close={close} action={add} label="Save hackathon" />
          </>
        ) : (
          <>
            <div className="modal-icon">
              <HeartHandshake size={19} />
            </div>
            <div className="eyebrow">BUILD SOMETHING TOGETHER</div>
            <h2>Send an invitation.</h2>
            <p className="modal-intro">
              The student can accept or decline this invitation.
            </p>
            <button className="button primary" onClick={invite}>
              Send invitation <ArrowRight size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function ModalActions({
  close,
  action,
  label,
}: {
  close: () => void;
  action: () => void;
  label: string;
}) {
  return (
    <div className="modal-actions">
      <button className="button secondary" onClick={close}>
        Cancel
      </button>
      <button className="button primary" onClick={action}>
        {label} <ArrowRight size={15} />
      </button>
    </div>
  );
}
export default App;
