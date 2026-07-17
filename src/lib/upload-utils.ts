export async function getFilesFromDataTransferItems(
  items: DataTransferItemList
): Promise<File[]> {
  const files: File[] = [];
  const entries: FileSystemEntry[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file") {
      const entry = item.webkitGetAsEntry?.() || (item as any).getAsEntry?.();
      if (entry) {
        entries.push(entry);
      } else {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
  }

  await Promise.all(
    entries.map(async (entry) => {
      await traverseEntry(entry, files);
    })
  );

  return files;
}

async function traverseEntry(
  entry: FileSystemEntry,
  files: File[]
): Promise<void> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    return new Promise((resolve, reject) => {
      fileEntry.file(
        (file) => {
          // Add the fullPath to the file object so it can be optionally used later
          Object.defineProperty(file, "webkitRelativePath", {
            value: fileEntry.fullPath.replace(/^\//, ""),
            writable: false,
          });
          files.push(file);
          resolve();
        },
        (err) => reject(err)
      );
    });
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const reader = dirEntry.createReader();

    const readEntries = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        reader.readEntries(
          async (entries) => {
            if (entries.length === 0) {
              resolve();
            } else {
              await Promise.all(entries.map((e) => traverseEntry(e, files)));
              await readEntries();
              resolve();
            }
          },
          (err) => reject(err)
        );
      });
    };

    await readEntries();
  }
}
