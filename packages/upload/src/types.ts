export type UploadItemStatus = "queued" | "uploading" | "paused" | "success" | "error" | "canceled";

export type UploadTransportResult = {
    url?: string;
};

export type UploadTransportContext = {
    signal: AbortSignal;
    onProgress: (progress: number) => void;
};

export type UploadTransport = {
    upload(file: File, context: UploadTransportContext): Promise<UploadTransportResult>;
};

export type UploadItem = {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: UploadItemStatus;
    progress: number;
    loadedBytes: number;
    attempts: number;
    error: Error | null;
    url: string | null;
};

export type UploadSummary = {
    total: number;
    queued: number;
    uploading: number;
    paused: number;
    success: number;
    error: number;
    canceled: number;
    progress: number;
};

export type CreateUploadControllerOptions = {
    transport: UploadTransport;
    concurrency?: number;
    accept?: string[];
    maxBytes?: number;
    allowEmptyFiles?: boolean;
    autoStart?: boolean;
    maxAttempts?: number;
    onChange?: (items: UploadItem[]) => void;
    onItemSuccess?: (item: UploadItem) => void;
    onItemError?: (item: UploadItem) => void;
};
