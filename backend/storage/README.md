# Storage Directories

This directory structure is created automatically when the server starts.

## Contents

- `uploads/` - Stores uploaded X-ray images
- `heatmaps/` - Stores generated heatmap visualizations  
- `reports/` - Stores generated PDF diagnostic reports

## Note

Do not commit actual medical images or reports to version control.
Add appropriate entries to `.gitignore` to exclude sensitive files.
