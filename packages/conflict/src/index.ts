export {
    clientWinsStrategy,
    createConflictController,
    lastWriteWinsStrategy,
    serverWinsStrategy,
} from "./conflict.js";
export type {
    ConflictController,
    ConflictRecord,
    ConflictSide,
    ConflictStrategy,
    CreateConflictControllerOptions,
} from "./conflict.js";
