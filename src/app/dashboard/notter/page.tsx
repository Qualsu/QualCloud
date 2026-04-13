import { Metadata } from "next";

import { images } from "@/config/routing/image.route";
import { FilesBrowser } from "../_components/file-browser";

export const metadata: Metadata = {
    title: "Notter",
    description: "Файлы Notter",
    icons: {
      icon: images.ICON,
    }
  };

export default function Notter(){
    return (
        <div>
            <FilesBrowser title="Notter" notter/>
        </div>
    )
}