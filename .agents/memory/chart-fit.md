---
name: Responsive chart fit
description: Constraint for keeping the Sankey fully visible across preview and export surfaces.
---

Generated chart dimensions, the live SVG viewBox, and exported SVG viewBox must stay synchronized; the default chart should fit its container, while only intentional zoom creates scrollable overflow.

Node heights must also use one shared value scale across levels; normalizing each column independently makes middle totals look misleadingly equal to the source total.

**Why:** A fixed minimum width and a mismatched viewBox can clip either the diagram or its labels, especially on mobile and in narrow editor layouts.

**How to apply:** When changing Sankey margins or dimensions, update model layout bounds, live SVG bounds, and export bounds together, and keep controls out of the plotted area.