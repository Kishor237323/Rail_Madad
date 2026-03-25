# 🚀 Image Lifecycle Management - Quick Start Guide

## What Was Implemented?

A complete image lifecycle management system that:
- ✅ Saves complaint images to `/uploads` folder
- ✅ Stores image path in MongoDB (not the image itself)
- ✅ Tracks image lifecycle with `resolvedAt` timestamps
- ✅ Automatically archives images after 7 days of resolution
- ✅ Moves archived images to `/archive` folder
- ✅ Shows "Image no longer available" in dashboard for archived images
- ✅ Provides cleanup script for maintenance

---

## 📁 New Files Created

| File | Purpose |
|------|---------|
| `app/api/complaints/upload/route.ts` | Handles image uploads (FormData → /uploads) |
| `app/api/complaints/cleanup/route.ts` | API endpoint to trigger image cleanup |
| `app/api/complaints/[complaintId]/image/route.ts` | Serves images from /uploads or /archive |
| `scripts/cleanup-images.mjs` | Standalone Node.js cleanup script |
| `public/uploads/` | Stores active complaint images |
| `public/archive/` | Stores archived (7+ days post-resolved) images |
| `IMAGE_LIFECYCLE_MANAGEMENT.md` | Full documentation |

---

## 🔄 Modified Files

| File | Change |
|------|--------|
| `components/complaint-form.tsx` | Two-phase upload: image first, then register |
| `app/api/complaints/register/route.ts` | Added `imagePath`, `imageUploadedAt`, `resolvedAt` fields |
| `app/api/railway-staff/complaints/[complaintId]/status/route.ts` | Sets `resolvedAt` when status → "resolved" |
| `components/role-login/railway-staff-dashboard.tsx` | Shows placeholder when image archived |
| `package.json` | Added `npm run cleanup:images` script |

---

## 🎯 How It Works (Simple)

### Step 1: User Submits Complaint with Image
```
Passenger uploads image → API saves to /uploads/RM12345_image.jpg
                       → Returns image path to frontend
                       → Frontend registers complaint with imagePath
```

### Step 2: Complaint Lifecycle
```
Status: Pending/In Progress  → Image visible in dashboard
Status: Resolved (Day 1-7)   → Image still visible
Status: Resolved (Day 8+)    → Eligible for cleanup
```

### Step 3: Cleanup Runs (Manual or Scheduled)
```
Cleanup finds resolved complaints > 7 days old
    ↓
Moves image from /uploads to /archive
    ↓
Sets imagePath to null in database
    ↓
Dashboard shows "Image no longer available"
```

---

## ⚙️ Configuration

### Default Settings
- **Image Max Size:** 5 MB
- **Retention Period:** 7 days after resolution
- **Supported Formats:** JPG, PNG, WebP, JPEG
- **Storage Location:** `/public/uploads` and `/public/archive`

### MongoDB Fields (Auto-Created)
```javascript
{
  imagePath: "/uploads/RM12345_image.jpg",  // Path (null after archive)
  imageUploadedAt: "2026-03-25T10:30:00Z",  // Upload timestamp
  imageArchived: false,                      // Archive status
  imageArchivedAt: null,                     // Archive timestamp
  resolvedAt: null                           // Resolution timestamp
}
```

---

## 🛠️ Usage

### Manual Cleanup (Run Once)
```bash
npm run cleanup:images
```

### Automated Cleanup (Linux Cron)
```bash
# Edit crontab
crontab -e

# Add line: Run daily at 2 AM
0 2 * * * cd /path/to/rail_madad && npm run cleanup:images
```

### API Cleanup (HTTP Request)
```bash
curl -X POST http://localhost:3000/api/complaints/cleanup
```

### Check Active Images
```bash
ls -lh public/uploads/
```

### Check Archived Images
```bash
ls -lh public/archive/
```

---

## 🧪 Quick Test

### 1. Submit Complaint with Image
- Go to Rail Madad homepage
- Submit train complaint with image
- Note the Complaint ID (CRN)

### 2. Verify Upload
```bash
# Check if image exists
ls -la public/uploads/RM*.{jpg,png,webp}
```

### 3. Check Database
```bash
mongo rail_madad
db.complaints.findOne({ complaintId: "RM12345678" })
// Look for imagePath field
```

### 4. Mark as Resolved
```bash
# In railway staff dashboard:
# - Select complaint
# - Click "Mark Resolved"
```

### 5. Test Cleanup
```bash
# Force old timestamp (for testing)
db.complaints.updateOne(
  { complaintId: "RM12345678" },
  { $set: { resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) } }
)

# Run cleanup
npm run cleanup:images

# Verify
ls -la public/archive/
db.complaints.findOne({ complaintId: "RM12345678" })
// imagePath should be null now
```

---

## 📊 Database Queries

### Find All Active Images
```javascript
db.complaints.find({ imagePath: { $ne: null } }).count()
```

### Find Total Storage Used
```bash
du -sh public/uploads/
du -sh public/archive/
```

### Find Ready for Cleanup
```javascript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
db.complaints.find({
  status: "resolved",
  resolvedAt: { $lt: sevenDaysAgo },
  imagePath: { $ne: null }
}).count()
```

---

## ⚠️ Important Notes

### Don't:
- ❌ Delete images directly from filesystem (update DB instead)
- ❌ Store images in MongoDB (only store paths)
- ❌ Change the naming format `RM{id}_image.{ext}`
- ❌ Manually set `imagePath` without uploading

### Do:
- ✅ Run cleanup script regularly (daily recommended)
- ✅ Monitor disk space in `/public` folder
- ✅ Backup `/public/archive` for compliance
- ✅ Keep cleanup logs for audit trail

---

## 🐛 Troubleshooting

### Images Not Uploading
**Check:**
1. `/public/uploads` directory exists and is writable
2. File size < 5 MB
3. File is valid image format
4. Browser network tab for upload response

### Cleanup Not Working
**Check:**
1. MongoDB connection via `MONGODB_URI` environment variable
2. Complaints have `resolvedAt` timestamp set
3. Images exist in `/uploads` folder
4. Directory permissions (must be writable)

### "Image no longer available" Shows Too Soon
**Check:**
1. `resolvedAt` timestamp is correct
2. Cleanup script hasn't run yet
3. Test by manually running: `npm run cleanup:images`

### Disk Space Issues
**Solutions:**
1. Reduce retention period (from 7 days)
2. Compress images before storing
3. Move `/archive` to external storage (S3/cloud)
4. Enable automatic deletion instead of archiving

---

## 📈 Monitoring

### Storage Usage Report
```bash
#!/bin/bash
echo "=== Rail Madad Image Storage Report ==="
echo "Active Images:"
du -sh public/uploads/
echo ""
echo "Archived Images:"
du -sh public/archive/
echo ""
echo "Total:"
du -sh public/{uploads,archive}
echo ""
echo "File Count (Active):"
ls public/uploads/ | wc -l
echo ""
echo "File Count (Archive):"
ls public/archive/ | wc -l
```

---

## 🔒 Security Notes

### File Validation
- ✅ MIME type checked on upload
- ✅ File size limited to 5 MB
- ✅ Filename sanitized to `RM{id}_image.{ext}`
- ✅ Path traversal protected

### Access Control
- ✅ Images only accessible via API endpoint
- ✅ Complaint ID required to access image
- ✅ Consider adding role-based access if needed

### Data Privacy
- 📌 Consider GDPR compliance for archived images
- 📌 May need longer retention for legal holds
- 📌 Consider encryption at rest for sensitive data

---

## 📞 Support Commands

```bash
# View full documentation
cat IMAGE_LIFECYCLE_MANAGEMENT.md

# Check system status
npm run cleanup:images --dry-run  # (Optional: if implemented)

# View recent uploads
ls -lt public/uploads/ | head -10

# View recent archives
ls -lt public/archive/ | head -10

# Count images by type
file public/uploads/* | grep -o "JPEG\|PNG\|WebP" | sort | uniq -c

# Find orphaned images (DB path doesn't exist)
db.complaints.find({ imagePath: /^\/uploads/ }).forEach(doc => {
  if (!fileExists(doc.imagePath)) print(doc.complaintId + ": " + doc.imagePath);
})
```

---

## 🎓 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Passenger Submits Complaint            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Upload Image (Phase 1)        │
        │  POST /api/complaints/upload   │
        │  FormData { complaintId, image }
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Save to /public/uploads/      │
        │  Return imagePath              │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Register Complaint (Phase 2)  │
        │  POST /api/complaints/register │
        │  Body { ...complaint, imagePath}
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Store in MongoDB with:        │
        │  - imagePath                   │
        │  - imageUploadedAt             │
        │  - resolvedAt: null            │
        └────────────┬───────────────────┘
                     │
                     ▼ (Staff reviews & resolves)
        ┌────────────────────────────────┐
        │  Mark as Resolved              │
        │  PATCH .../status              │
        │  Body { status: "resolved" }   │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Auto-set resolvedAt: now()    │
        │  Image available for 7 days    │
        └────────────┬───────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼ (Days 1-7)         ▼ (Day 8+)
    ┌──────────────┐     ┌──────────────┐
    │   Active     │     │   Eligible   │
    │   Image      │     │   for        │
    │   in         │     │   Cleanup    │
    │   Dashboard  │     │              │
    └──────────────┘     └──────┬───────┘
                                │
                                ▼
                   ┌────────────────────────────────┐
                   │  Cleanup Script Runs           │
                   │  npm run cleanup:images        │
                   │  OR POST /api/complaints/cleanup
                   └────────────┬───────────────────┘
                                │
                                ▼
                   ┌────────────────────────────────┐
                   │  Move to /public/archive/      │
                   │  Set imagePath: null           │
                   │  Set imageArchived: true       │
                   └────────────┬───────────────────┘
                                │
                                ▼
                   ┌────────────────────────────────┐
                   │  Dashboard Shows:              │
                   │  "Image no longer available"   │
                   │  (archived after resolution)   │
                   └────────────────────────────────┘
```

---

## ✅ Checklist for First Deploy

- [ ] Create `/public/uploads` ✓ (Done)
- [ ] Create `/public/archive` ✓ (Done)
- [ ] Test image upload flow
- [ ] Test complaint registration with image
- [ ] Verify image stored in `/uploads`
- [ ] Check MongoDB has `imagePath` field
- [ ] Mark complaint as resolved
- [ ] Verify `resolvedAt` is set
- [ ] Run: `npm run cleanup:images`
- [ ] Verify image moved to `/archive`
- [ ] Verify dashboard shows placeholder
- [ ] Set up daily cleanup cron job
- [ ] Done! 🎉

