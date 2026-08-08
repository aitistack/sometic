export type FileKind =
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "text"
    | "archive"
    | "spreadsheet"
    | "document"
    | "code"
    | "file";

const EXT_KIND: Record<string, FileKind> = {
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
    webp: "image",
    svg: "image",
    bmp: "image",
    ico: "image",
    avif: "image",
    mp4: "video",
    webm: "video",
    mov: "video",
    mkv: "video",
    avi: "video",
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    flac: "audio",
    m4a: "audio",
    aac: "audio",
    pdf: "pdf",
    txt: "text",
    md: "text",
    rtf: "text",
    csv: "spreadsheet",
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    ods: "spreadsheet",
    doc: "document",
    docx: "document",
    odt: "document",
    ppt: "document",
    pptx: "document",
    zip: "archive",
    rar: "archive",
    "7z": "archive",
    tar: "archive",
    gz: "archive",
    tgz: "archive",
    js: "code",
    mjs: "code",
    cjs: "code",
    ts: "code",
    tsx: "code",
    jsx: "code",
    json: "code",
    html: "code",
    css: "code",
    scss: "code",
    py: "code",
    go: "code",
    rs: "code",
    java: "code",
    rb: "code",
    php: "code",
    xml: "code",
    yml: "code",
    yaml: "code",
};

export function resolveFileKind(file: File | undefined | null): FileKind {
    if (!file) {
        return "file";
    }
    const type = file.type.toLowerCase();
    if (type.startsWith("image/")) {
        return "image";
    }
    if (type.startsWith("video/")) {
        return "video";
    }
    if (type.startsWith("audio/")) {
        return "audio";
    }
    if (type === "application/pdf") {
        return "pdf";
    }
    if (
        type.includes("zip") ||
        type.includes("compressed") ||
        type.includes("tar") ||
        type.includes("gzip") ||
        type.includes("x-rar") ||
        type.includes("x-7z")
    ) {
        return "archive";
    }
    if (
        type.includes("spreadsheet") ||
        type.includes("excel") ||
        type === "text/csv" ||
        type.includes("csv")
    ) {
        return "spreadsheet";
    }
    if (
        type.includes("msword") ||
        type.includes("wordprocessing") ||
        type.includes("presentation") ||
        type.includes("ms-powerpoint")
    ) {
        return "document";
    }
    if (
        type.startsWith("text/") ||
        type.includes("javascript") ||
        type.includes("json") ||
        type.includes("xml") ||
        type.includes("typescript")
    ) {
        if (
            type.includes("javascript") ||
            type.includes("json") ||
            type.includes("typescript") ||
            type.includes("xml") ||
            type === "text/css" ||
            type === "text/html"
        ) {
            return "code";
        }
        return "text";
    }
    const name = file.name;
    const dot = name.lastIndexOf(".");
    if (dot >= 0 && dot < name.length - 1) {
        const ext = name.slice(dot + 1).toLowerCase();
        return EXT_KIND[ext] ?? "file";
    }
    return "file";
}

function svg(paths: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

export function fileKindSvg(kind: FileKind): string {
    switch (kind) {
        case "image":
            return svg(
                '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
            );
        case "video":
            return svg(
                '<rect x="2" y="4" width="15" height="16" rx="2"/><path d="m17 8 5-3v14l-5-3z"/>',
            );
        case "audio":
            return svg(
                '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
            );
        case "pdf":
            return svg(
                '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 13h1v4"/><path d="M14 17h1a1.5 1.5 0 0 0 0-3h-1v4"/><path d="M8 13v4h.8a1.2 1.2 0 0 0 0-2.4H8"/>',
            );
        case "text":
            return svg(
                '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/>',
            );
        case "archive":
            return svg(
                '<path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/><path d="M3 8V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1"/><path d="M12 12v5"/><path d="M10 14h4"/>',
            );
        case "spreadsheet":
            return svg(
                '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
            );
        case "document":
            return svg(
                '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
            );
        case "code":
            return svg('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>');
        default:
            return svg(
                '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
            );
    }
}

export function formatAcceptHint(accept: string | null | undefined): string {
    if (!accept || accept.trim() === "") {
        return "Any common file type";
    }
    const parts = accept
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 8);
    if (parts.length === 0) {
        return "Any common file type";
    }
    return parts
        .map((part) => {
            if (part.endsWith("/*")) {
                return part.slice(0, -2);
            }
            if (part.startsWith(".")) {
                return part.slice(1).toUpperCase();
            }
            const slash = part.lastIndexOf("/");
            if (slash >= 0) {
                return part.slice(slash + 1).toUpperCase();
            }
            return part;
        })
        .join(" · ");
}
