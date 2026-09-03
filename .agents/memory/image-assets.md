---
name: Local image assets
description: Rules for optional Sankey image assets, exports, and browser persistence.
---

Optional chart images remain browser-local and are validated before use; they must never require server uploads or an external image-hosting service.

**Why:** The product is intentionally local-first, and image assets can contain user-provided or sensitive content.

**How to apply:** Keep image URLs/data URLs optional to flow calculations, embed local assets in exports when possible, and explicitly tell the user when browser storage or remote-image CORS prevents persistence or PNG embedding.