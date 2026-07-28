/**
 * Generated from khf-site-cms/openapi/openapi.json.
 * Schema SHA-256: 52ed3decb27748ba
 * Do not edit by hand; run `npm run api:types`.
 */

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface PaginationLinks {
  prev?: string | null;
  next?: string | null;
}

export interface CmsImageSource {
  url: string;
  width: number;
  height: number | null;
  bytes: number;
}

export interface CmsImageDto {
  version: 2;
  id: number;
  uuid: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  aspect_ratio: number | null;
  bytes: number;
  mime_type: string;
  checksum: string | null;
  focal_point: {
    x: number;
    y: number;
  };
  status: string;
  placeholder: {
    data_url: string;
    color: string;
  } | null;
  sources: {
    avif: Array<CmsImageSource>;
    webp: Array<CmsImageSource>;
    fallback: Array<CmsImageSource>;
  };
}

export interface ApiNewsItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  date: string | null;
  datetime: string | null;
  image: string | null;
  image_srcset: string | null;
  image_data: CmsImageDto | null;
  featured: boolean;
  body?: string;
  views?: number;
  seo?: {
    title: string;
    description: string;
  };
}

export interface ApiInstruction {
  slug: string;
  title: string;
  summary: string;
  hazard: string | null;
  hazard_label: string | null;
  hazard_icon: string | null;
  priority: boolean;
  image: string | null;
  image_srcset: string | null;
  image_data: CmsImageDto | null;
  sections?: {
    before: Array<string>;
    during: Array<string>;
    after: Array<string>;
    prohibited: Array<string>;
  };
  body?: string;
}

export interface ApiDocumentFile {
  lang: string;
  label: string;
  url: string;
  ext: string;
  size: string;
  size_bytes: number;
}

export interface ApiDocument {
  id: number;
  type: string;
  type_value: string;
  title: string;
  number: string | null;
  section: string | null;
  date: string | null;
  date_iso: string | null;
  lang: string;
  size: string | null;
  href: string | null;
  files: Array<ApiDocumentFile>;
}

export interface ApiProjectTimeline {
  date: string;
  text: string;
  tone: string;
}

export interface ApiProject {
  slug: string;
  title: string;
  status: string;
  status_code: string;
  status_tone: string;
  years: string | null;
  partner: string | null;
  budget: string | null;
  desc: string;
  image: string | null;
  image_srcset: string | null;
  image_data: CmsImageDto | null;
  code?: string | null;
  customer?: string | null;
  body?: string;
  goals?: Array<string>;
  timeline?: Array<ApiProjectTimeline>;
  direction?: {
    address: string;
    phone: string;
    email: string;
  };
}

export interface ApiAnnouncement {
  slug: string;
  kind: "vacancy" | "tender";
  kind_label: string;
  title: string;
  org: string | null;
  desc: string;
  deadline: string;
  deadline_at: string | null;
  deadline_state: "unlimited" | "open" | "closed";
  open: boolean;
  application_url: string | null;
}

export interface ApiAlertMeta {
  label: string;
  value: string;
}

export interface ApiAlertRegion {
  code: string;
  name: string;
}

export interface ApiAlert {
  slug: string;
  level: "none" | "info" | "warning" | "danger" | "critical";
  level_label: string;
  severity: string;
  status: string;
  status_code: "active" | "completed";
  is_active: boolean;
  hazard: string;
  hazard_label: string;
  title: string;
  summary: string;
  region: string;
  region_codes: Array<string>;
  datetime: string | null;
  starts_at: string | null;
  ends_at: string | null;
  published_at: string | null;
  starts_at_iso: string | null;
  ends_at_iso: string | null;
  body?: string;
  instructions?: Array<string>;
  contacts?: string;
  source?: string | null;
  territory_type?: string;
  regions?: Array<ApiAlertRegion>;
  meta?: Array<ApiAlertMeta>;
}

export interface ApiRegionStatus {
  key: string;
  name: string;
  level: "none" | "info" | "warning" | "danger" | "critical";
  count: number;
  statusText: string;
}

export interface ApiAlertsActive {
  state: "calm" | "warning" | "critical";
  count: number;
  regions: Array<ApiRegionStatus>;
}

export interface ApiHomeBlock {
  type: string;
  title: string;
  config: Record<string, unknown>;
}

export interface ApiHome {
  blocks: Array<ApiHomeBlock>;
  alerts: {
    state: "calm" | "warning" | "critical";
    count: number;
    regions: Array<ApiRegionStatus>;
    items: Array<ApiAlert>;
  };
  news: Array<ApiNewsItem>;
  instructions: Array<ApiInstruction>;
  documents: Array<ApiDocument>;
  announcements: Array<ApiAnnouncement>;
  projects: Array<ApiProject>;
  emergency_contacts: Record<string, unknown>;
}

export interface ApiSettings {
  org: {
    name: string;
    short_name: string;
    about: string;
    address: string;
    email: string;
    emergency_number: string;
    trust_phone: string;
  };
  contacts: {
    press_email: string;
    press_phone: string;
    duty_phone: string;
  };
  social: Record<string, string>;
  emergency_services: Array<{
    num: string;
    label: string;
  }>;
  copyright: string;
  seo: {
    meta_title: string;
    meta_description: string;
  };
}

export interface ApiMenuItem {
  label: string;
  url: string | null;
  children: Array<{
    label: string;
    url: string | null;
  }>;
}

export interface ApiMenu {
  main: Array<ApiMenuItem>;
  footer: Array<ApiMenuItem>;
}

export interface ApiRegionOffice {
  code: string;
  name: string;
  type: string;
  type_code: string;
  head: string;
  regional_center: string | null;
  address: string;
  phone: string | null;
  phone_href: string | null;
  duty_phone: string | null;
  email: string | null;
  districts_count: number;
  districts: Array<string>;
}

export interface ApiPage {
  slug: string;
  title: string;
}

export interface ApiPageDetail {
  slug: string;
  title: string;
  body: string;
  updated: string | null;
  updated_at: string | null;
  seo: {
    title: string;
    description: string;
  };
}

export interface ApiSearchResult {
  type: "news" | "alert" | "instruction" | "document" | "project" | "announcement" | "page";
  title: string;
  excerpt: string;
  path: string;
  published_at: string | null;
}

export interface ApiCategory {
  slug: string;
  name: string;
  type: string;
}

export interface HealthResponse {
  status: "ok" | "unavailable";
  service: string;
  version: string;
  checks: {
    database: boolean;
  };
  timestamp: string;
}

export interface ReadinessResponse {
  status: "ready" | "not_ready";
  checks: Record<string, unknown>;
  scheduler_last_run: string | null;
  queue_last_run: string | null;
  timestamp: string;
}

export interface SubmissionRequest {
  name: string;
  email: string;
  phone?: string | null;
  topic?: string | null;
  message: string;
  region_id?: number | null;
  consent: boolean;
}

export interface SubmissionResponse {
  tracking_number: string;
}

export interface WebVitalRequest {
  name: "LCP" | "INP" | "CLS";
  value: number;
  id: string;
  path: string;
  locale: "ru" | "tj" | "en";
  device: "mobile" | "tablet" | "desktop";
  navigation_type: "navigate" | "reload" | "prerender" | "back-forward" | "back-forward-cache" | "restore";
}

export interface WebVitalResponse {
  accepted: boolean;
}

export interface ValidationError {
  message: string;
  errors: Record<string, Array<string>>;
}

export interface NewsListResponse {
  data: Array<ApiNewsItem>;
  meta: PaginationMeta;
}

export interface NewsResponse {
  data: ApiNewsItem;
}

export interface AlertListResponse {
  data: Array<ApiAlert>;
}

export interface AlertResponse {
  data: ApiAlert;
}

export interface AlertsActiveResponse {
  data: ApiAlertsActive;
}

export interface InstructionListResponse {
  data: Array<ApiInstruction>;
  meta: PaginationMeta;
}

export interface InstructionResponse {
  data: ApiInstruction;
}

export interface DocumentListResponse {
  data: Array<ApiDocument>;
  meta: PaginationMeta;
}

export interface ProjectListResponse {
  data: Array<ApiProject>;
  meta: PaginationMeta;
}

export interface ProjectResponse {
  data: ApiProject;
}

export interface AnnouncementListResponse {
  data: Array<ApiAnnouncement>;
  meta: PaginationMeta;
}

export interface AnnouncementResponse {
  data: ApiAnnouncement;
}

export interface PageListResponse {
  data: Array<ApiPage>;
  meta: PaginationMeta;
}

export interface PageResponse {
  data: ApiPageDetail;
}

export interface CategoryListResponse {
  data: Array<ApiCategory>;
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface RegionStatusListResponse {
  data: Array<ApiRegionStatus>;
}

export interface RegionOfficeListResponse {
  data: Array<ApiRegionOffice>;
  meta: PaginationMeta;
  links: Record<string, unknown>;
}

export interface MenuResponse {
  data: ApiMenu;
}

export interface SettingsResponse {
  data: ApiSettings;
  meta: Record<string, unknown>;
}

export interface SearchResponse {
  data: Array<ApiSearchResult>;
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface HomeResponse {
  data: ApiHome;
}
