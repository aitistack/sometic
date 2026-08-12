import {
    createUploadController,
    resolveUploadDropzone,
    resolveUploadItem,
    resolveUploadList,
    type UploadTransport,
} from "@sometic/dom/upload";

export function mountUploadSection(root: HTMLElement): () => void {
    const dropHost = root.querySelector("[data-upload-dropzone]");
    const listHost = root.querySelector("[data-upload-list]");
    if (!(dropHost instanceof HTMLElement) || !(listHost instanceof HTMLElement)) {
        return () => {};
    }

    const transport: UploadTransport = {
        async upload(file, { onProgress, signal }) {
            for (let step = 1; step <= 5; step += 1) {
                if (signal.aborted) {
                    throw Object.assign(new Error("aborted"), { name: "AbortError" });
                }
                await new Promise((resolve) => setTimeout(resolve, 120));
                onProgress(step / 5);
            }
            return { url: `mock://${file.name}` };
        },
    };

    const controller = createUploadController({
        transport,
        concurrency: 2,
        onChange: () => render(),
    });

    const dropzone = resolveUploadDropzone();
    for (const [key, value] of Object.entries(dropzone.attributes)) {
        dropHost.setAttribute(key, value);
    }
    dropHost.textContent = "Drop files here or click to choose";
    dropHost.addEventListener("dragover", (event) => event.preventDefault());
    dropHost.addEventListener("drop", (event) => {
        event.preventDefault();
        const files = [...(event.dataTransfer?.files ?? [])];
        controller.addFiles(files);
    });
    dropHost.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.addEventListener("change", () => {
            controller.addFiles([...(input.files ?? [])]);
        });
        input.click();
    });

    const render = (): void => {
        const list = resolveUploadList();
        listHost.replaceChildren();
        for (const [key, value] of Object.entries(list.attributes)) {
            listHost.setAttribute(key, value);
        }
        for (const item of controller.getItems()) {
            const li = document.createElement("li");
            const view = resolveUploadItem({
                id: item.id,
                status: item.status,
                progress: item.progress,
                name: item.file.name,
            });
            for (const [key, value] of Object.entries(view.attributes)) {
                li.setAttribute(key, value);
            }
            li.textContent = `${item.file.name} · ${item.status} · ${Math.round(item.progress * 100)}%`;
            const cancel = document.createElement("button");
            cancel.type = "button";
            cancel.className = "pg-btn";
            cancel.textContent = "Cancel";
            cancel.addEventListener("click", () => controller.cancel(item.id));
            li.append(cancel);
            listHost.append(li);
        }
    };

    render();
    return () => controller.dispose();
}
