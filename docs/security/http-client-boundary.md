# HTTP client boundary (draft)

Status: draft (Phase 11).

The HTTP client transports credentials the app chooses to attach. XSS that can read memory or storage can replay those credentials. Refresh queues reduce race bugs; they do not create a trust boundary. Keep tokens out of logs and error payloads.
