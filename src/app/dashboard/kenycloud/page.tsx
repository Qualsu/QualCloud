import { Metadata } from "next";

import { images } from "@/config/routing/image.route";
import { FilesBrowser } from "../_components/file-browser";

export const metadata: Metadata = {
    title: "KenyCloud",
    description: "Архив файлов KenyCloud",
    icons: {
      icon: images.ICON,
    }
  };

export default function KenyCloud(){
    return (
        <div>
            <FilesBrowser title="KenyCloud (Архив)"/>
        </div>
    )
}