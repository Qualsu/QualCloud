import { Metadata } from "next";

import { images } from "@/config/routing/image.route";
import { FilesBrowser } from "../_components/file-browser";

export const metadata: Metadata = {
    title: "Shrtl://",
    description: "Файлы Shrtl://",
    icons: {
      icon: images.ICON,
    }
  };

export default function FilesPage(){
    return (
        <div>
            <FilesBrowser title="Shrtl://" shrtl/>
        </div>
    )
}