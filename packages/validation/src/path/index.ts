export type PathSegment = string | number;

const SEGMENT = /([^[.\]]+)|\[(\d+)\]/g;

export function parsePath(path: string): PathSegment[] {
    if (path === "") {
        return [];
    }
    const segments: PathSegment[] = [];
    let match: RegExpExecArray | null;
    SEGMENT.lastIndex = 0;
    while ((match = SEGMENT.exec(path)) !== null) {
        if (match[1] !== undefined) {
            segments.push(match[1]);
        } else if (match[2] !== undefined) {
            segments.push(Number(match[2]));
        }
    }
    return segments;
}

export function joinPath(segments: PathSegment[]): string {
    let result = "";
    for (const segment of segments) {
        if (typeof segment === "number") {
            result += `[${segment}]`;
        } else if (result === "") {
            result = segment;
        } else {
            result += `.${segment}`;
        }
    }
    return result;
}

export function getAt(source: unknown, path: string): unknown {
    const segments = parsePath(path);
    let current: unknown = source;
    for (const segment of segments) {
        if (current === null || current === undefined) {
            return undefined;
        }
        if (typeof segment === "number") {
            if (!Array.isArray(current)) {
                return undefined;
            }
            current = current[segment];
            continue;
        }
        if (typeof current !== "object") {
            return undefined;
        }
        current = (current as Record<string, unknown>)[segment];
    }
    return current;
}

export function setAt<T>(source: T, path: string, value: unknown): T {
    const segments = parsePath(path);
    if (segments.length === 0) {
        return value as T;
    }
    const root = cloneContainer(source);
    let cursor: unknown = root;
    for (let index = 0; index < segments.length - 1; index += 1) {
        const segment = segments[index];
        const nextSegment = segments[index + 1];
        if (segment === undefined || nextSegment === undefined) {
            break;
        }
        const existing = readSegment(cursor, segment);
        const next =
            existing === undefined || existing === null
                ? typeof nextSegment === "number"
                    ? []
                    : {}
                : cloneContainer(existing);
        writeSegment(cursor, segment, next);
        cursor = next;
    }
    const last = segments[segments.length - 1];
    if (last !== undefined) {
        writeSegment(cursor, last, value);
    }
    return root as T;
}

export function deleteAt<T>(source: T, path: string): T {
    const segments = parsePath(path);
    if (segments.length === 0) {
        return source;
    }
    const root = cloneContainer(source);
    let cursor: unknown = root;
    for (let index = 0; index < segments.length - 1; index += 1) {
        const segment = segments[index];
        if (segment === undefined) {
            return root as T;
        }
        const next = readSegment(cursor, segment);
        if (next === undefined || next === null) {
            return root as T;
        }
        const cloned = cloneContainer(next);
        writeSegment(cursor, segment, cloned);
        cursor = cloned;
    }
    const last = segments[segments.length - 1];
    if (last === undefined) {
        return root as T;
    }
    if (typeof last === "number" && Array.isArray(cursor)) {
        cursor.splice(last, 1);
    } else if (typeof last === "string" && cursor !== null && typeof cursor === "object") {
        delete (cursor as Record<string, unknown>)[last];
    }
    return root as T;
}

function cloneContainer(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.slice();
    }
    if (value !== null && typeof value === "object") {
        return { ...(value as Record<string, unknown>) };
    }
    return value;
}

function readSegment(source: unknown, segment: PathSegment): unknown {
    if (typeof segment === "number") {
        return Array.isArray(source) ? source[segment] : undefined;
    }
    if (source !== null && typeof source === "object") {
        return (source as Record<string, unknown>)[segment];
    }
    return undefined;
}

function writeSegment(target: unknown, segment: PathSegment, value: unknown): void {
    if (typeof segment === "number" && Array.isArray(target)) {
        target[segment] = value;
        return;
    }
    if (typeof segment === "string" && target !== null && typeof target === "object") {
        (target as Record<string, unknown>)[segment] = value;
    }
}
