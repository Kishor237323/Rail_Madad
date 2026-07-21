# 📸 Image Lifecycle Management System - Implementation Guide

## Overview

The Rail Madad complaint system now includes a complete **image lifecycle management system** that handles temporary storage, cleanup, and archiving of complaint images. This ensures efficient storage management while maintaining accessibility during the complaint resolution process.

---

## 🏗️ Architecture

### Image Lifecycle Flow

```
[Passenger Uploads Image]
         ↓
  [Upload to /uploads]
  (RM12345_image.jpg)
         ↓
  [Complaint Registered]
  (imagePath stored in DB)
         ↓
  [Image Available During Resolution]
  (Active for 7+ days after resolution)
         ↓
  [Cleanup Script Runs]
  (Finds resolved complaints > 7 days old)
         ↓
  [Image Moved to /archive]
  (imagePath set to null in DB)
         ↓
  [Dashboard Shows "Image no longer available"]
```

---

## 📂 Folder Structure

```
/public
├── /uploads          # Active complaint images
│   ├── RM12345_image.jpg
│   ├── RM67890_image.png
│   └── ...
└── /archive          # Archived images (after 7 days post-resolution)
    ├── RM12345_image.jpg
    ├── RM11111_image.png
    └── ...
```

---

## 🗄️ MongoDB Schema

### Complaints Collection - New Fields

```javascript
{
  complaintId: "RM12345678",
  pnr: "2418567391",
  category: "dirty_toilet",
  description: "Toilet in coach C3 is extremely dirty",
  
  // IMAGE LIFECYCLE FIELDS
  imagePath: "/uploads/RM12345678_image.jpg",      // Path to image (null after archiving)
  imageUploadedAt: "2026-03-25T10:30:00Z",          // When image was uploaded
  imageArchived: false,                              // Whether image has been archived
  imageArchivedAt: null,                             // When image was archived
  
  // STATUS TRACKING
  status: "resolved",                                // pending, in-progress, resolved
  resolvedAt: "2026-03-28T14:20:00Z",               // Timestamp when marked resolved
  
  // Other fields
  createdAt: "2026-03-25T10:30:00Z",
  updatedAt: "2026-03-28T14:20:00Z",
  ...
}
```

### Key Fields Explanation

| Field | Type | Purpose |
|-------|------|---------|
| `imagePath` | String/Null | Relative path to image file (`/uploads/...` or `/archive/...`) |
| `imageUploadedAt` | Date | Timestamp when image was uploaded |
| `imageArchived` | Boolean | Whether the image has been archived |
| `imageArchivedAt` | Date | When the image was archived |
| `resolvedAt` | Date | When the complaint was marked as resolved |

---

## 🔌 API Endpoints

### 1. Upload Image
**POST** `/api/complaints/upload`

**Request:**
```typescript
// FormData
{
  complaintId: "RM12345678",
  image: File (multipart/form-data)
}
```

**Response:**
```json
{
  "success": true,
  "imagePath": "/uploads/RM12345678_image.jpg",
  "filename": "RM12345678_image.jpg"
}
```

**Usage in complaint-form.tsx:**
```typescript
const formData = new FormData();
formData.append("complaintId", complaintId);
formData.append("image", imageFile);

const response = await fetch("/api/complaints/upload", {
  method: "POST",
  body: formData,
});

const { imagePath } = await response.json();
// Then pass imagePath to register endpoint
```

---

### 2. Register Complaint (with image)
**POST** `/api/complaints/register`

**Request:**
```json
{
  "complaintMode": "train",
  "pnr": "2418567391",
  "description": "Toilet is dirty",
  "imagePath": "/uploads/RM12345678_image.jpg",
  "trainDetails": { ... },
  "location": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "complaintId": "RM12345678",
  "assignedTo": "staff_s5"
}
```

---

### 3. Update Complaint Status
**PATCH** `/api/railway-staff/complaints/[complaintId]/status`

**Request:**
```json
{
  "status": "resolved"
}
```

**Response:**
```json
{
  "success": true
}
```

**Database Update:**
- When `status: "resolved"`, automatically sets `resolvedAt: new Date()`
- Triggers cleanup eligibility check after 7 days

---

### 4. Cleanup Images
**POST** `/api/complaints/cleanup`

**Response:**
```json
{
  "success": true,
  "message": "Archived 5 images from resolved complaints older than 7 days.",
  "archivedCount": 5
}
```

**Processing:**
1. Finds complaints where: `status = "resolved"` AND `resolvedAt < 7 days ago`
2. Moves image from `/uploads` to `/archive`
3. Updates DB: sets `imagePath: null`, `imageArchived: true`, `imageArchivedAt: now()`

---

### 5. Serve Image (Optional)
**GET** `/api/complaints/[complaintId]/image`

**Response:** Binary image file

**Features:**
- Automatically searches `/uploads` then `/archive`
- Supports: JPG, PNG, WebP, JPEG
- Includes proper `Content-Type` headers
- 1-hour cache control

---

## 🧹 Cleanup Mechanism

### How It Works

The system includes **two** cleanup options:

#### Option A: API Endpoint (Recommended for Production)
```bash
# Trigger via HTTP request
curl -X POST http://localhost:3000/api/complaints/cleanup
```

#### Option B: NPM Script (For Manual/Scheduled Runs)
```bash
# Run cleanup via Node.js script
npm run cleanup:images
```

### Script Details

**File:** `scripts/cleanup-images.mjs`

**Execution:**
```javascript
// 1. Connect to MongoDB
// 2. Find all resolved complaints older than 7 days
// 3. For each complaint:
//    - Copy image from /uploads to /archive
//    - Delete from /uploads
//    - Update DB (imagePath = null, imageArchived = true)
// 4. Log results
// 5. Disconnect

console.log("✅ Connected to MongoDB");
console.log(`📦 Found X complaints to archive`);
console.log(`📦 Archived: filename.jpg`);
console.log(`🗑️  Deleted: filename.jpg`);
console.log(`📝 Updated DB for complaint: RM12345678`);
console.log(`✅ Cleanup Complete! Archived: X complaints`);
```

### Scheduling Cleanup (Production)

#### Option 1: Cron Job
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/rail_madad && npm run cleanup:images
```

#### Option 2: Scheduled Job Service
```typescript
// app/api/complaints/scheduled-cleanup/route.ts
// (Optional: Use Vercel Crons or external service)
```

---

## 🖼️ UI Updates

### Dashboard Image Display

**Before (Old):**
```tsx
<img src={selectedComplaint.image || "/placeholder.jpg"} />
```

**After (New):**
```tsx
{selectedComplaint.image ? (
  <img src={selectedComplaint.image} alt="Complaint evidence" />
) : (
  <div className="flex h-52 w-full items-center justify-center ...">
    <ImageOff className="mx-auto mb-2 h-8 w-8 text-slate-400" />
    <p className="text-sm font-medium text-slate-600">
      Image no longer available
    </p>
    <p className="text-xs text-slate-500">
      (archived after resolution)
    </p>
  </div>
)}
```

**User Experience:**
- ✅ Active complaints: Show image
- ✅ Recently resolved (< 7 days): Show image
- ✅ Archived (> 7 days): Show "Image no longer available" placeholder

---

## 📋 Database Query Examples

### Find all active images
```javascript
db.collection("complaints").find({
  imagePath: { $exists: true, $ne: null },
  status: { $in: ["pending", "in-progress"] }
});
```

### Find eligible for cleanup
```javascript
db.collection("complaints").find({
  status: "resolved",
  resolvedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  imagePath: { $exists: true, $ne: null }
});
```

### Find archived images
```javascript
db.collection("complaints").find({
  imageArchived: true,
  imagePath: null
});
```

---

## 🔄 Two-Phase Upload Flow

### complaint-form.tsx Implementation

```typescript
const handleSubmit = async () => {
  try {
    // Generate complaint ID
    const complaintId = `RM${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    // PHASE 1: Upload image to /uploads
    let imagePath: string | undefined;
    if (imageFile && complaintMode === "train") {
      const formData = new FormData();
      formData.append("complaintId", complaintId);
      formData.append("image", imageFile);
      
      const uploadResponse = await fetch("/api/complaints/upload", {
        method: "POST",
        body: formData,
      });
      
      const uploadData = await uploadResponse.json();
      imagePath = uploadData.imagePath;
    }
    
    // PHASE 2: Register complaint with image path
    const registerResponse = await fetch("/api/complaints/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaintMode,
        pnr,
        category: complaintMode === "emergency" ? category : undefined,
        description,
        trainDetails,
        location: capturedLocation,
        imagePath, // Pass imagePath from Phase 1
      }),
    });
    
    const registerData = await registerResponse.json();
    setCrn(registerData.complaintId ?? complaintId);
    setSubmitted(true);
  } catch (error) {
    setSubmitError("Failed to register complaint");
  }
};
```

---

## 🛡️ File Validation

### Upload Validation
- ✅ File type: Must start with `image/`
- ✅ File size: Max 5 MB
- ✅ Filename: `{complaintId}_image.{ext}`
- ✅ Supported formats: JPG, PNG, WebP, JPEG

### Error Handling
```typescript
if (!file.type.startsWith("image/")) {
  throw new Error("Please upload a valid image file.");
}

if (file.size > 5 * 1024 * 1024) {
  throw new Error("File too large. Please upload an image up to 5 MB.");
}
```

---

## 📊 Storage Optimization

### Before Cleanup
```
/public/uploads/
├── RM12345678_image.jpg (2 MB) - Resolved 8 days ago
├── RM87654321_image.png (1.5 MB) - Resolved 10 days ago
├── RM11111111_image.jpg (3 MB) - Active (pending)
└── RM22222222_image.png (2.2 MB) - Active (in-progress)

Total: 8.7 MB (includes archived-eligible)
```

### After Cleanup
```
/public/uploads/
├── RM11111111_image.jpg (3 MB) - Active (pending)
└── RM22222222_image.png (2.2 MB) - Active (in-progress)

/public/archive/
├── RM12345678_image.jpg (2 MB) - Archived 8 days ago
└── RM87654321_image.png (1.5 MB) - Archived 10 days ago

Total: ~8.7 MB (same, but organized)
Active Storage: 5.2 MB (58% reduction in active directory)
```

---

## 🧪 Testing Workflow

### Test Image Upload
```bash
# 1. Submit train complaint with image
# 2. Check /public/uploads for RM{id}_image.{ext}
# 3. Verify imagePath in MongoDB

mongo rail_madad
db.complaints.findOne({ complaintId: "RM12345678" })
// Should show: imagePath: "/uploads/RM12345678_image.jpg"
```

### Test Cleanup
```bash
# 1. Register complaint with image
# 2. Mark as resolved (status = "resolved")
# 3. Manually set resolvedAt to 8 days ago
db.complaints.updateOne(
  { complaintId: "RM12345678" },
  { $set: { resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) } }
)

# 4. Run cleanup
npm run cleanup:images

# 5. Verify:
#    - Image moved from /uploads to /archive
#    - imagePath set to null
#    - imageArchived set to true
```

### Test Dashboard Display
```bash
# 1. View active complaint - Image shows
# 2. Mark as resolved
# 3. Dashboard: Image still shows (< 7 days)
# 4. Run cleanup (force > 7 days)
# 5. Dashboard: "Image no longer available" placeholder
```

---

## 🔐 Security Considerations

### Path Traversal Protection
```typescript
// ✅ Safe: Only accept RM{digits}_image.{ext}
const filename = `${complaintId}_image.${ext}`;
if (!filename.match(/^RM\d+_image\.(jpg|jpeg|png|webp)$/)) {
  throw new Error("Invalid filename");
}
```

### File Type Validation
```typescript
// ✅ Check MIME type AND file extension
if (!file.type.startsWith("image/")) {
  throw new Error("Invalid file type");
}
```

### Size Limits
```typescript
// ✅ Enforce max 5 MB
if (file.size > 5 * 1024 * 1024) {
  throw new Error("File too large");
}
```

---

## 📝 Logs & Monitoring

### Cleanup Script Logs
```
✅ Connected to MongoDB
📦 Found 5 complaints to archive
📦 Archived: RM12345678_image.jpg
🗑️  Deleted: RM12345678_image.jpg
📝 Updated DB for complaint: RM12345678
📦 Archived: RM87654321_image.png
🗑️  Deleted: RM87654321_image.png
📝 Updated DB for complaint: RM87654321
...
✅ Cleanup Complete!
   📦 Archived: 5 complaints
```

### Error Logs
```
❌ Error processing complaint RM12345678: ENOENT: no such file or directory
⚠️  Could not extract filename from: /uploads/undefined
❌ Failed to move file RM12345678_image.jpg: Permission denied
```

---

## 🚀 Deployment Checklist

- [ ] Create `/public/uploads` directory
- [ ] Create `/public/archive` directory
- [ ] Deploy API endpoints (upload, cleanup, serve)
- [ ] Update complaint-form.tsx with two-phase upload
- [ ] Update dashboard with "Image no longer available" UI
- [ ] Add `npm run cleanup:images` to deployment script
- [ ] Set up scheduled cleanup (cron/job service)
- [ ] Test image upload flow
- [ ] Test cleanup mechanism
- [ ] Monitor storage usage
- [ ] Backup archived images (optional)

---

## 🔄 Future Enhancements

1. **Configurable Retention Period**
   - Make 7 days a configurable parameter
   - Support per-category retention policies

2. **Image Compression**
   - Auto-compress on upload using `sharp` or similar
   - Store multiple sizes (thumbnail, preview, full)

3. **Image Analysis**
   - Run ML models on uploaded images
   - Extract metadata (timestamp, location)
   - Detect suspicious/duplicate uploads

4. **Backup Strategy**
   - Move archive to S3/cloud storage
   - Implement long-term retention for legal compliance

5. **Analytics**
   - Track image upload success rates
   - Monitor storage usage trends
   - Generate cleanup reports

---

## 📞 Support

**Issues?** Check:
1. `/public/uploads` and `/public/archive` exist
2. MongoDB `imagePath`, `resolvedAt` fields present
3. `MONGODB_URI` environment variable set
4. File permissions on `/public` directory
5. Disk space available (recommend 2GB+ for images)

