export const extensionFormatMap: Record<string, string> = {
  pdf: "PDF",
  doc: "Word", docx: "Word", docm: "Word",
  xls: "Excel", xlsx: "Excel", xlsm: "Excel", csv: "CSV",
  ppt: "PowerPoint", pptx: "PowerPoint", pptm: "PowerPoint",
  odt: "OpenDocument", ods: "OpenDocument", odp: "OpenDocument",
  rtf: "RTF",
  txt: "TXT",
  md: "Markdown",
  json: "JSON", xml: "XML", yaml: "YAML", yml: "YAML", toml: "TOML",
  html: "HTML", htm: "HTML",
  css: "CSS", scss: "SCSS", sass: "SASS", less: "LESS",
  js: "JavaScript", ts: "TypeScript",
  jsx: "React", tsx: "React",
  py: "Python", java: "Java", c: "C", cpp: "C++", cs: "C#",
  go: "Go", rs: "Rust", rb: "Ruby", php: "PHP",
  swift: "Swift", kotlin: "Kotlin",
  sh: "Shell", bash: "Bash", bat: "Batch", ps1: "PowerShell",
  sql: "SQL",

  jpg: "JPEG", jpeg: "JPEG", png: "PNG", gif: "GIF",
  webp: "WebP", svg: "SVG", bmp: "BMP",
  tiff: "TIFF", tif: "TIFF", ico: "ICO", avif: "AVIF",

  mp3: "MP3", wav: "WAV", ogg: "OGG", flac: "FLAC",
  aac: "AAC", wma: "WMA", m4a: "M4A", opus: "Opus",

  mp4: "MP4", avi: "AVI", mkv: "MKV", mov: "MOV",
  wmv: "WMV", flv: "FLV", webm: "WebM", m4v: "M4V",

  zip: "ZIP", rar: "RAR", "7z": "7z", tar: "TAR",
  gz: "GZIP", bz2: "BZIP2", xz: "XZ", zst: "Zstd",

  exe: "EXE", msi: "MSI", dmg: "DMG",
  deb: "DEB", rpm: "RPM", apk: "APK", ipa: "IPA",

  sqlite: "SQLite", sqlite3: "SQLite", db: "DB",
  mdb: "Access", accdb: "Access",
  iso: "ISO",
};

export const FILE_SIZE_LABELS = ["Б", "КБ", "МБ", "ГБ", "ТБ"] as const;
