import { formatRelative } from "date-fns";
import { ru, enUS } from "date-fns/locale";

export interface TimeZoneOption {
  value: string;
  label: string;
  offset: string;
}

export function getTimeZones(): TimeZoneOption[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    zones = [
      "UTC",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Moscow",
      "Europe/Kyiv",
      "Europe/Minsk",
      "Asia/Tbilisi",
      "Asia/Yerevan",
      "Asia/Baku",
      "Asia/Kolkata",
      "Asia/Shanghai",
      "Asia/Tokyo",
      "Australia/Sydney",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Pacific/Auckland"
    ];
  }

  try {
    const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (systemTz && !zones.includes(systemTz)) {
      zones.push(systemTz);
    }
  } catch {}

  const date = new Date();
  const list = zones.map((zone) => {
    let offset = "";
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: zone,
        timeZoneName: "longOffset",
      }).formatToParts(date);
      const tzPart = parts.find((p) => p.type === "timeZoneName");
      offset = tzPart ? tzPart.value : "";
    } catch {}
    return {
      value: zone,
      label: zone.replace(/_/g, " "),
      offset,
    };
  });

  const parseOffset = (offsetStr: string) => {
    if (!offsetStr || offsetStr === "GMT" || offsetStr === "UTC") return 0;
    const match = offsetStr.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!match) return 0;
    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  };

  return list.sort((a, b) => {
    const offsetA = parseOffset(a.offset);
    const offsetB = parseOffset(b.offset);
    if (offsetA !== offsetB) {
      return offsetA - offsetB;
    }
    return a.label.localeCompare(b.label);
  });
}

export function toZonedTime(date: Date | number | string, timeZone: string): Date {
  const d = new Date(date);
  if (isNaN(d.getTime())) return new Date();

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const map: Record<string, string> = {};
    for (const part of parts) {
      map[part.type] = part.value;
    }
    return new Date(
      parseInt(map.year, 10),
      parseInt(map.month, 10) - 1,
      parseInt(map.day, 10),
      parseInt(map.hour, 10),
      parseInt(map.minute, 10),
      parseInt(map.second, 10),
      d.getMilliseconds()
    );
  } catch {
    return d;
  }
}

export function formatRelativeZoned(
  date: Date | number | string,
  timeZone: string,
  language: "ru" | "en" = "ru"
): string {
  const zonedDate = toZonedTime(date, timeZone);
  const zonedBaseDate = toZonedTime(new Date(), timeZone);
  const locale = language === "ru" ? ru : enUS;
  return formatRelative(zonedDate, zonedBaseDate, { locale });
}
