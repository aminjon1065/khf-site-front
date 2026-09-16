import { routes } from "@/lib/routes";
import type { Dictionary } from "./ru";

// English. Same object shape as ru.ts; only text is translated. All hrefs come
// from routes — the locale prefix is added by LocaleLink at render time.

export const en: Dictionary = {
  common: {
    siteName:
      "Committee of Emergency Situations and Civil Defence of the Republic of Tajikistan",
    siteShort: "CoES RT",
    siteDescription:
      "Committee of Emergency Situations and Civil Defence under the Government of the Republic of Tajikistan",
    skipToContent: "Skip to content",
    backToTop: "Back to top",

    header: {
      committeeTitle: [
        "Committee of Emergency Situations",
        "and Civil Defence",
      ],
      committeeSub: "under the Government of the Republic of Tajikistan",
      stateSymbols: "State symbols",
      sitemap: "Sitemap",
      subdivisions: "Subdivisions",
      themeToggle: "Toggle theme",
      themeTitle: "Light / dark theme",
      langGroup: "Забон / Language",
      trustPhoneLabel: "Single trust line",
      trustPhone: "+992 (37) 221-59-00",
      trustPhoneHref: "tel:+992372215900",
      emergencyAria: "Emergency call 112",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      menu: "Menu",
      searchPlaceholder: "Search the portal",
      searchShort: "Search",
      searchOpen: "Open search",
      searchClose: "Close search",
      searchSubmit: "Search",
      searchHint: "At least 2 characters. Enter shows all results.",
      sosApp: "SOS app",
      aboutMenu: "About us",
      emergencyCallMobile: "112 — emergency call",
      trustLineMobile: "Trust line:",
      flagAlt: "Flag of the Republic of Tajikistan",
      emblemAlt: "Emblem of the Republic of Tajikistan",
      logoAlt: "CoES emblem of the Republic of Tajikistan",
      navAria: "Main navigation",
      mobileNavAria: "Mobile navigation",
    },

    nav: {
      home: "Home",
      news: "News",
      guides: "Safety",
      map: "Risk map",
      documents: "Documents",
      contacts: "Contacts",
      projects: "Projects",
      announcements: "Announcements",
      leadership: "Leadership",
      structure: "Structure",
    },

    footer: {
      orgTitle: "CoES and CD of the Republic of Tajikistan",
      about:
        "State authority for the prevention and response to emergencies and the protection of the population and territory of the Republic of Tajikistan.",
      address: ["26 Lohuti St., Dushanbe", "info@khf.tj"],
      trustLine: "Trust line",
      sectionsTitle: "Sections",
      sections: [
        { label: "Leadership", href: routes.leadership },
        { label: "Structure", href: routes.structure },
        { label: "SOS app", href: routes.sos },
        { label: "News & statements", href: routes.news },
        { label: "Public safety guides", href: routes.guides },
        { label: "Risk map", href: routes.map },
        { label: "Documents", href: routes.documents },
        { label: "Projects & programmes", href: routes.projects },
        { label: "Vacancies & tenders", href: routes.announcements },
        { label: "Contacts & reception", href: routes.contacts },
      ],
      emergencyTitle: "Emergency services",
      emergency: [
        { num: "112", label: "unified rescue service" },
        { num: "101", label: "fire service" },
        { num: "102", label: "police" },
        { num: "103", label: "ambulance" },
      ],
      resourcesTitle: "State resources",
      resources: [
        { label: "State symbols", href: routes.symbols, external: false },
        {
          label: "President of the Republic of Tajikistan",
          href: "https://president.tj",
          external: true,
        },
        {
          label: "MFA of the Republic of Tajikistan",
          href: "https://mfa.tj",
          external: true,
        },
        {
          label: "khf.tj — official website",
          href: "https://khf.tj",
          external: true,
        },
        { label: "Open data", href: "/documents?type=open_data", external: false },
        { label: "Sitemap", href: routes.sitemap, external: false },
      ],
      copyright:
        "© 2026 Committee of Emergency Situations and Civil Defence. All materials are official information; a link to khf.tj is required when used.",
      legal: [
        { label: "Personal data protection", href: "/pages/privacy" },
        { label: "Accessibility", href: "/pages/accessibility" },
      ],
    },

    breadcrumbHome: "Home",

    pagination: {
      aria: "Pagination",
      prev: "Previous",
      next: "Next",
      pageAriaPrefix: "Page",
    },
  },

  home: {
    critical: {
      kicker: "Critical situation",
      title: "A critical alert is in effect",
      text: "Details are being confirmed. Follow the instructions of the emergency services. In a life-threatening emergency call 112.",
    },
    warning: {
      levelLabel: "Alert",
      strong: "An alert is in effect.",
      text: " Details are on the risk map.",
      time: "",
      more: "Details",
    },
    calm: {
      strong: "No emergency alerts.",
      text: " The situation across the republic is normal.",
    },

    unavailable: {
      aria: "Situation data unavailable",
      strong: "Situation data is currently unavailable.",
      text: " Alert information may be incomplete. In a life-threatening emergency call 112.",
      call112: "Call 112",
    },
    banner: {
      criticalAria: "Critical alert",
      warningAria: "Active alert",
      calmAria: "Operational status",
      whatToDo: "What to do",
      detailsMap: "Details and map",
      call112: "Call 112",
    },

    slider: {
      readMore: "Read in full",
    },

    president: {
      href: "https://president.tj",
      aria: "President of the Republic of Tajikistan — president.tj",
      photo: "/assets/president.jpg",
      kicker: "Leader of the Nation",
      name: "Emomali Rahmon",
      role: "President of the Republic of Tajikistan · president.tj ↗",
      quote: "“Protecting human life and health is a sacred duty of the state”",
    },

    ops: {
      title: "Operational summary",
      activeLabel: "Active alerts",
      noneText: "There are no active alerts.",
      unavailableText:
        "Situation data is temporarily unavailable. Please refresh the page later.",
      watchedRegions: "Regions monitored",
      affectedRegions: "Regions affected",
      staleText: "Data may be out of date — refreshing…",
      mapLink: "Risk map →",
    },

    quickActions: {
      title: "What to do in an emergency",
      allLink: "All guides →",
      openInstruction: "Open the guide →",
      links: [
        { icon: "map", title: "Risk map", desc: "Situation across the regions of the republic", href: routes.map },
        { icon: "phone", title: "Emergency numbers", desc: "112, regional departments, public office", href: routes.contacts },
        { icon: "message", title: "Send an appeal", desc: "Electronic reception — non-urgent appeals", href: `${routes.contacts}#reception` },
      ],
    },

    regionSection: {
      title: "Situation by region",
      openFull: "Open full map",
    },

    warnings: {
      title: "Alerts",
      allLink: "All alerts →",
    },

    news: {
      title: "News & statements",
      allLink: "All news →",
      featured: {
        photoLabel: "Photo: CoES helicopter over the Pamirs",
      },
    },

    documents: {
      title: "Official documents",
      allLink: "Catalogue →",
      rows: [
        {
          tag: "Law",
          title:
            "Law of the RT “On the protection of the population and territory from natural and man-made emergencies”",
          size: "PDF · 0.4 MB",
        },
        {
          tag: "Resolution",
          title: "National Disaster Risk Reduction Strategy for 2026–2030",
          size: "PDF · 2.1 MB",
        },
        {
          tag: "Report",
          title:
            "Report on the Committee's activities for the first half of 2026",
          size: "PDF · 1.3 MB",
        },
      ],
    },

    announcements: {
      title: "Announcements",
      allLink: "All announcements →",
      rows: [
        {
          tag: "Vacancy",
          tagClass: "tag-accent",
          title: "Air-mobile unit rescuer — Dushanbe, 2 positions",
          deadline: "until 31.07.2026",
        },
        {
          tag: "Vacancy",
          tagClass: "tag-accent",
          title: "Civil defence department engineer — Sughd Regional Office",
          deadline: "until 25.07.2026",
        },
        {
          tag: "Tender",
          tagClass: "tag-outline",
          title:
            "Procurement of rescue tools for regional offices — applications open",
          deadline: "until 05.08.2026",
        },
      ],
    },

    projects: {
      title: "Projects",
      allLink: "All projects →",
    },
  },

  pages: {
    meta: {
      projects: "Projects & programmes",
      documents: "Documents",
      contacts: "Contacts",
      guides: "Public safety",
      leadership: "Leadership",
      structure: "Structure",
      symbols: "State symbols",
      sitemap: "Sitemap",
      sos: "SOS app",
      projectFallback: "Project",
      projectSuffix: "Projects",
      alertFallback: "Alert",
      newsFallback: "News",
      guideFallback: "Guide",
      pageFallback: "Page",
      alerts: "Alerts",
      announcementFallback: "Announcement",
      announcements: "Announcements",
    },
    home: {
      main: "Highlights",
      presidentPhotoAlt: "Photo of the President",
      quickActions: "Quick actions",
      alertsMap: "Alerts map",
      mapLegend: "Map legend",
      regionsList: "Situation by region — list",
      latestAlerts: "Latest alerts",
      news: "News",
      kpis: "Key indicators",
      officialInfo: "Official information",
    },
    alertsList: {
      breadcrumb: "Alerts",
      heading: "Alerts",
      situationAria: "Situation",
      listAria: "Active alerts",
      noneActive: "none active",
      activeCountSuffix: "active",
      emptyTitle: "No active alerts",
      emptyText: "The situation across the republic is normal.",
      regionsHeading: "Situation by region",
      openMap: "Open risk map",
      emergencyHelp: "Emergency help",
      emergencyNote: "Single emergency number, 24/7",
      unavailable: {
        label: "Data unavailable",
        badge: "no reliable data",
        text: "Situation information could not be retrieved. It is being clarified; if lives are at risk, call 112.",
        emptyTitle: "Situation data is currently unavailable",
        emptyText: "The list of active alerts could not be retrieved. Check your connection or refresh the page later.",
      },
      state: {
        calm: {
          label: "Situation normal",
          text: "There are no active alerts across the republic. Follow the Committee's official announcements.",
        },
        warning: {
          label: "Alerts in effect",
          text: "An elevated danger level has been declared for a number of regions. Observe precautions.",
        },
        critical: {
          label: "Critical situation",
          text: "A critical danger level is in effect in some regions. Follow the instructions of the rescue services.",
        },
      },
    },
    alertDetail: {
      breadcrumbHome: "Home",
      breadcrumbAlerts: "Alerts",
      aria: "Alert",
      whatToDo: "What to do now",
      officialDescription: "Official description",
      updateHistory: "Update history",
      officialInfo: "Official information",
      guidesLink: "Public safety guides",
      zone: "Coverage area",
      emergencyHelp: "Emergency help",
      related: "Related alerts",
      share: "Share",
      shared: "Link copied",
    },
    projectDetail: {
      aria: "About the project",
      customer: "Customer",
      partners: "Partners",
      budget: "Budget",
      term: "Timeframe",
      goalsAria: "Project goals",
      goalsTitle: "Goals and objectives",
      moreTitle: "About the project",
      timelineTitle: "Progress",
      photoAria: "Photo",
      photoLabel: "Project photo",
      direction: "Project directorate",
      otherProjects: "Other projects",
    },
    announcementDetail: {
      breadcrumbHome: "Home",
      breadcrumbAnnouncements: "Announcements",
      aria: "Announcement",
      org: "Organisation",
      deadline: "Application deadline",
      apply: "Apply",
      applyExternal: "The application is submitted on an external site",
      noApplyUrl: "Check the organisation's contacts for how to apply.",
      contacts: "Contacts",
      otherAnnouncements: "Other announcements",
    },
    guideDetail: {
      kicker: "Public guidance",
      keyPoint: "Key point",
      contents: "Sections of this guide",
      prohibited: "What not to do",
      more: "More",
      materials: "Materials",
      emergencyHelp: "Emergency help",
      emergencyNote: "Unified rescue service, 24/7",
      related: "Related guides",
      blocks: {
        before: {
          tag: "Before",
          title: "Prepare in advance",
          aria: "Before the event",
        },
        during: {
          tag: "During",
          title: "During the event",
          aria: "During the event",
        },
        after: {
          tag: "After",
          title: "After the event",
          aria: "After the event",
        },
      },
    },
    contentPage: {
      breadcrumbAria: "Breadcrumbs",
      updated: "Updated:",
      placeholder: "The page content is being prepared.",
    },
    search: {
      title: "Search",
      submit: "Search",
      promptShort: "Enter at least 2 characters to search.",
      emptyPrefix: "Nothing found for",
      resultsPrefix: "Results for",
      unavailableTitle: "Search is temporarily unavailable",
      unavailableText:
        "The search service did not respond. Check your connection and try again.",
      retry: "Retry search",
      sitemapNav: "Open the site map",
      typeLabels: {
        news: "News",
        alert: "Alert",
        instruction: "Guide",
        document: "Document",
        project: "Project",
        announcement: "Announcement",
        page: "Page",
      },
    },
    projectsList: {
      empty: "No projects have been published yet.",
      unavailable:
        "The project list is temporarily unavailable. Please refresh the page later.",
    },
    leadership: { chairmanAria: "Chairman", deputiesAria: "Deputies" },
    guidesList: {
      mainThreats: "Main threats",
      allGuides: "All guides",
      mainRisk: "Main national risk",
      priorityGuide: "Priority guide",
      topicsSuffix: "topics",
      empty: "No guides have been published yet.",
      unavailable:
        "The guide list is temporarily unavailable. Please refresh the page later.",
    },
    sosPage: { app: "SOS app", features: "Features", how: "How SOS works" },
    newsDetail: {
      pressKicker: "CoES press office",
      pressSource: "CoES press centre",
      newsCategory: "News",
      translationNotice:
        "A translation into this language has not been published yet — the available version is shown.",
      readIn: "Read in",
    },
    languageNames: {
      ru: "Russian",
      tj: "Tajik",
      en: "English",
    },
  },
};
