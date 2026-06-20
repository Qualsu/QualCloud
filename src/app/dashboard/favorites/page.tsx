import { Metadata } from "next";

import { images } from "@/config/routing/image.route";
import { FilesBrowser } from "../_components/file-browser";

export const metadata: Metadata = {
  title: "Избранное",
  description: "Избранные файлы",
  icons: {
    icon: images.ICON,
  },
};

export default function Favorites() {
  return (
    <div>
      <FilesBrowser title="Избранное" favorites />
    </div>
  );
}
