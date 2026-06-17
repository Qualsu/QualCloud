import { Metadata } from "next";

import { images } from "@/config/routing/image.route";
import { FilesBrowser } from "../_components/file-browser";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Удаленные файлы",
  icons: {
    icon: images.ICON,
  },
};

export default function Trash() {
  return (
    <div>
      <FilesBrowser title="Корзина" deletedOnly />
    </div>
  );
}
