import { Metadata } from "next";

import { images } from "@/config/routing/image.route";
import { FilesBrowser } from "../_components/file-browser";

export const metadata: Metadata = {
  title: "Облако",
  description: "Все файлы облака",
  icons: {
    icon: images.ICON,
  },
};

export default function Cloud() {
  return (
    <div>
      <FilesBrowser title="Облако" />
    </div>
  );
}
