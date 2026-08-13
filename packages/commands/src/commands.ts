import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";

export type CommandContext = Readonly<Record<string, unknown>>;

export type CommandDefinition<TResult = unknown> = {
    id: string;
    execute: (context?: CommandContext) => TResult | Promise<TResult>;
    canExecute?: (context?: CommandContext) => boolean;
    label?: string;
    undo?: (result: TResult, context?: CommandContext) => void | Promise<void>;
};

export type CommandRegistryEvent =
    | { type: "register"; id: string }
    | { type: "unregister"; id: string }
    | { type: "execute"; id: string; result: unknown }
    | { type: "error"; id: string; error: unknown };

export type CreateCommandRegistryOptions = {
    onEvent?: (event: CommandRegistryEvent) => void;
};

export type CommandRegistry = {
    register: <TResult = unknown>(command: CommandDefinition<TResult>) => () => void;
    unregister: (id: string) => void;
    has: (id: string) => boolean;
    list: () => string[];
    canExecute: (id: string, context?: CommandContext) => boolean;
    execute: <TResult = unknown>(id: string, context?: CommandContext) => Promise<TResult>;
    get: (id: string) => CommandDefinition | undefined;
    subscribe: (listener: (event: CommandRegistryEvent) => void) => () => void;
    readonly disposed: boolean;
    dispose: () => void;
};

export function createCommandRegistry(
    options: CreateCommandRegistryOptions = {},
): CommandRegistry {
    const commands = new Map<string, CommandDefinition>();
    const listeners = new Set<(event: CommandRegistryEvent) => void>();
    const disposable = createDisposable(() => {
        commands.clear();
        listeners.clear();
    });

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "COMMAND_REGISTRY_DISPOSED",
                message: "This command registry has been disposed",
            });
        }
    };

    const emit = (event: CommandRegistryEvent): void => {
        options.onEvent?.(event);
        for (const listener of listeners) {
            listener(event);
        }
    };

    return {
        register(command) {
            assertActive();
            if (typeof command.id !== "string" || command.id.trim() === "") {
                throw createError({
                    code: "COMMAND_INVALID_ID",
                    message: "Command id must be a non-empty string",
                });
            }
            if (commands.has(command.id)) {
                throw createError({
                    code: "COMMAND_DUPLICATE",
                    message: `Command already registered: ${command.id}`,
                });
            }
            commands.set(command.id, command as CommandDefinition);
            emit({ type: "register", id: command.id });
            return () => {
                if (!disposable.disposed) {
                    commands.delete(command.id);
                    emit({ type: "unregister", id: command.id });
                }
            };
        },
        unregister(id) {
            assertActive();
            if (!commands.delete(id)) {
                return;
            }
            emit({ type: "unregister", id });
        },
        has(id) {
            assertActive();
            return commands.has(id);
        },
        list() {
            assertActive();
            return [...commands.keys()];
        },
        canExecute(id, context) {
            assertActive();
            const command = commands.get(id);
            if (!command) {
                return false;
            }
            return command.canExecute ? command.canExecute(context) : true;
        },
        async execute(id, context) {
            assertActive();
            const command = commands.get(id);
            if (!command) {
                throw createError({
                    code: "COMMAND_NOT_FOUND",
                    message: `Unknown command: ${id}`,
                });
            }
            if (command.canExecute && !command.canExecute(context)) {
                throw createError({
                    code: "COMMAND_NOT_EXECUTABLE",
                    message: `Command cannot execute: ${id}`,
                });
            }
            try {
                const result = await command.execute(context);
                emit({ type: "execute", id, result });
                return result as never;
            } catch (error) {
                emit({ type: "error", id, error });
                throw error;
            }
        },
        get(id) {
            assertActive();
            return commands.get(id);
        },
        subscribe(listener) {
            assertActive();
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        get disposed() {
            return disposable.disposed;
        },
        dispose() {
            disposable.dispose();
        },
    };
}
