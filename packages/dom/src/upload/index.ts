import type { UploadItemStatus } from "@sometic/upload";
import { resolveRootStyle, type StyleableRootOptions } from "../internal/styleable.js";
import { createFileInputController, type FileInputController } from "../input-file/index.js";

export type UploadDropzoneViewModel = {
    dragging: boolean;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolveUploadDropzoneOptions = StyleableRootOptions & {
    dragging?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    accept?: string;
    label?: string;
    describedBy?: string;
};

export function resolveUploadDropzone(
    options: ResolveUploadDropzoneOptions = {},
): UploadDropzoneViewModel {
    const styled = resolveRootStyle(options);
    const dragging = options.dragging === true;
    const disabled = options.disabled === true;
    return {
        dragging,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "button",
            "data-slot": "dropzone",
            "data-dragging": dragging ? "true" : "false",
            "data-state": disabled ? "disabled" : dragging ? "dragging" : "idle",
            tabindex: disabled ? "-1" : "0",
            "aria-label": options.label ?? "Upload files",
            ...(options.multiple === undefined
                ? {}
                : { "data-multiple": options.multiple ? "true" : "false" }),
            ...(options.accept === undefined ? {} : { "data-accept": options.accept }),
            ...(options.describedBy === undefined
                ? {}
                : { "aria-describedby": options.describedBy }),
            ...(disabled ? { "aria-disabled": "true", "data-disabled": "" } : {}),
        },
    };
}

export type UploadListViewModel = {
    count: number;
    empty: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolveUploadListOptions = StyleableRootOptions & {
    count?: number;
    label?: string;
    live?: "polite" | "assertive" | "off";
};

export function resolveUploadList(options: ResolveUploadListOptions = {}): UploadListViewModel {
    const styled = resolveRootStyle(options);
    const count = Math.max(0, Math.floor(options.count ?? 0));
    const live = options.live ?? "polite";
    return {
        count,
        empty: count === 0,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "list",
            "data-slot": "list",
            "data-count": String(count),
            "data-empty": count === 0 ? "true" : "false",
            "aria-label": options.label ?? "Uploads",
            ...(live === "off" ? {} : { "aria-live": live }),
        },
    };
}

export type UploadItemViewModel = {
    id: string;
    status: UploadItemStatus;
    percent: number;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    progressAttributes: Record<string, string>;
};

export type ResolveUploadItemOptions = StyleableRootOptions & {
    id: string;
    status: UploadItemStatus;
    progress?: number;
    name?: string;
};

export function resolveUploadItem(options: ResolveUploadItemOptions): UploadItemViewModel {
    const styled = resolveRootStyle(options);
    const progress = Math.min(1, Math.max(0, options.progress ?? 0));
    const percent = Math.round(progress * 100);
    const uploading = options.status === "uploading";
    const failed = options.status === "error";
    return {
        id: options.id,
        status: options.status,
        percent,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "listitem",
            "data-slot": "item",
            "data-upload-id": options.id,
            "data-status": options.status,
            "data-progress": String(percent),
            ...(uploading ? { "aria-busy": "true" } : {}),
            ...(failed ? { "data-invalid": "" } : {}),
        },
        progressAttributes: {
            role: "progressbar",
            "data-slot": "progress",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            "aria-valuenow": String(percent),
            "aria-valuetext": `${percent}%`,
            ...(options.name === undefined ? {} : { "aria-label": options.name }),
        },
    };
}

export type UploadDropTransfer = {
    files?: ArrayLike<File> | null;
    items?: ArrayLike<{ kind: string; getAsFile: () => File | null }> | null;
};

export type UploadDropzoneEvent = {
    preventDefault?: () => void;
    stopPropagation?: () => void;
    dataTransfer?: UploadDropTransfer | null;
};

export type CreateUploadDropzoneControllerOptions = {
    onFiles: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    openFilePicker?: () => void;
};

export type UploadDropzoneController = {
    readonly input: FileInputController;
    isDragging(): boolean;
    isDisabled(): boolean;
    setDisabled(disabled: boolean): void;
    resolve(options?: ResolveUploadDropzoneOptions): UploadDropzoneViewModel;
    handleDragEnter(event: UploadDropzoneEvent): void;
    handleDragOver(event: UploadDropzoneEvent): void;
    handleDragLeave(event: UploadDropzoneEvent): void;
    handleDrop(event: UploadDropzoneEvent): File[];
    handleKeyDown(event: { key: string; preventDefault?: () => void }): boolean;
    handleFileList(list: ArrayLike<File> | null): File[];
    open(): void;
    dispose(): void;
};

function readTransferFiles(transfer: UploadDropTransfer | null | undefined): File[] {
    if (!transfer) {
        return [];
    }
    if (transfer.files && transfer.files.length > 0) {
        return Array.from(transfer.files);
    }
    if (!transfer.items) {
        return [];
    }
    const files: File[] = [];
    for (const item of Array.from(transfer.items)) {
        if (item.kind !== "file") {
            continue;
        }
        const file = item.getAsFile();
        if (file) {
            files.push(file);
        }
    }
    return files;
}

export function createUploadDropzoneController(
    options: CreateUploadDropzoneControllerOptions,
): UploadDropzoneController {
    const multiple = options.multiple !== false;
    let disabled = options.disabled === true;
    let dragDepth = 0;
    let disposed = false;

    const input = createFileInputController({
        multiple,
        ...(options.accept === undefined ? {} : { accept: options.accept }),
    });

    const emit = (files: File[]): File[] => {
        if (disabled || disposed || files.length === 0) {
            return [];
        }
        const accepted = multiple ? files : files.slice(0, 1);
        input.value.set(accepted);
        options.onFiles(accepted);
        return accepted;
    };

    return {
        input,
        isDragging: () => dragDepth > 0,
        isDisabled: () => disabled,
        setDisabled(next) {
            disabled = next;
            if (next) {
                dragDepth = 0;
            }
        },
        resolve(styleOptions = {}) {
            return resolveUploadDropzone({
                ...styleOptions,
                dragging: dragDepth > 0,
                disabled,
                multiple,
                ...(options.accept === undefined ? {} : { accept: options.accept }),
            });
        },
        handleDragEnter(event) {
            event.preventDefault?.();
            if (disabled || disposed) {
                return;
            }
            dragDepth += 1;
        },
        handleDragOver(event) {
            event.preventDefault?.();
        },
        handleDragLeave(event) {
            event.preventDefault?.();
            dragDepth = Math.max(0, dragDepth - 1);
        },
        handleDrop(event) {
            event.preventDefault?.();
            event.stopPropagation?.();
            dragDepth = 0;
            return emit(readTransferFiles(event.dataTransfer));
        },
        handleKeyDown(event) {
            if (disabled || disposed) {
                return false;
            }
            if (event.key !== "Enter" && event.key !== " ") {
                return false;
            }
            event.preventDefault?.();
            options.openFilePicker?.();
            return true;
        },
        handleFileList(list) {
            return emit(list ? Array.from(list) : []);
        },
        open() {
            if (disabled || disposed) {
                return;
            }
            options.openFilePicker?.();
        },
        dispose() {
            disposed = true;
            dragDepth = 0;
            input.clear();
        },
    };
}

export {
    createHttpUploadTransport,
    createUploadController,
    downloadFromUrl,
} from "@sometic/upload";
export type {
    CreateHttpUploadTransportOptions,
    CreateUploadControllerOptions,
    UploadController,
    UploadItem,
    UploadItemStatus,
    UploadTransport,
    UploadTransportResult,
} from "@sometic/upload";
