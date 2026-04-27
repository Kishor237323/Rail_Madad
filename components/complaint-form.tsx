"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle2,
  FileText,
  ImagePlus,
  Loader2,
  Lock,
  MapPin,
  Navigation,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Tag,
  Ticket,
  Train,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
type TrainDetails = {
  trainName: string;
  trainNumber: string;
  coach: string;
  seat: string;
  from: string;
  to: string;
};

type ComplaintMode = "train" | "emergency";

const DESCRIPTION_LIMIT = 300;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const EMERGENCY_COMPLAINT_CATEGORIES = [
  "Medical",
  "Fire",
  "Security", 
  "Crowd",
];

const MOCK_PNR_DB: Record<string, TrainDetails> = {
  "2418567391": {
    trainName: "Vande Bharat Express",
    trainNumber: "22435",
    coach: "C3",
    seat: "42",
    from: "New Delhi",
    to: "Varanasi",
  },
  "5123467890": {
    trainName: "Rajdhani Express",
    trainNumber: "12951",
    coach: "B2",
    seat: "19",
    from: "Mumbai Central",
    to: "New Delhi",
  },
  "1620701234": {
    trainName: "Mysore Express",
    trainNumber: "16207",
    coach: "S5",
    seat: "36",
    from: "Mysuru Junction",
    to: "MGR Chennai Central",
  },
  "1620705678": {
    trainName: "Mysore Express",
    trainNumber: "16207",
    coach: "B2",
    seat: "21",
    from: "Mysuru Junction",
    to: "MGR Chennai Central",
  },
  "1620799012": {
    trainName: "Mysore Express",
    trainNumber: "16207",
    coach: "C3",
    seat: "14",
    from: "Mysuru Junction",
    to: "MGR Chennai Central",
  },
  "2268794321": {
    trainName: "KSR Bengaluru - Mysuru Express",
    trainNumber: "16215",
    coach: "D2",
    seat: "33",
    from: "Yeshvantpur Junction",
    to: "Mysuru Junction",
  },
  "2268796543": {
    trainName: "Mysore Express",
    trainNumber: "16207",
    coach: "S3",
    seat: "41",
    from: "Yeshvantpur Junction",
    to: "Mysuru Junction",
  },
};

export function ComplaintForm() {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [debugOtp, setDebugOtp] = useState("");

  const [pnr, setPnr] = useState("");
  const [complaintMode, setComplaintMode] = useState<ComplaintMode>("train");
  const [isFetchingPnr, setIsFetchingPnr] = useState(false);
  const [pnrError, setPnrError] = useState("");
  const [trainDetails, setTrainDetails] = useState<TrainDetails | null>(null);
  const [category, setCategory] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState("");

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");

  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [crn, setCrn] = useState("");
  const [submitError, setSubmitError] = useState("");

  const requiresOtp = complaintMode === "train";
  const isLocked = requiresOtp && !otpVerified;

  const isContextReady = !!trainDetails;

  const canSubmit =
    (!requiresOtp || otpVerified) &&
    (complaintMode === "train" || !!category) &&
    isContextReady &&
    (complaintMode === "emergency" || !!imageFile);

  const categoryOptions = EMERGENCY_COMPLAINT_CATEGORIES;

  const getModeLabel = (mode: ComplaintMode) => {
    if (mode === "train") return "Train Complaint";
    return "Emergency";
  };

  const generateComplaintId = () => {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    return `RM${randomDigits}`;
  };

  const handleSendOtp = async () => {
    setOtpError("");

    if (!/^\d{10}$/.test(phone)) {
      setOtpError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSendingOtp(true);
    setDebugOtp("");

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = (await response.json()) as { error?: string; debugOtp?: string };

      if (!response.ok) {
        setOtpSent(false);
        setOtpVerified(false);
        setOtpError(data.error || "Unable to send OTP right now.");
        return;
      }

      setOtpSent(true);
      setOtpVerified(false);
      setOtp("");
      setOtpError("");
      setDebugOtp(data.debugOtp || "");
    } catch {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpError("Unable to send OTP right now.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setOtpVerified(false);
        setOtpError(data.error || "Invalid OTP. Please try again.");
        return;
      }

      setOtpVerified(true);
      setOtpError("");
      setDebugOtp("");
    } catch {
      setOtpVerified(false);
      setOtpError("Unable to verify OTP right now.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleFetchPnr = async () => {
    setPnrError("");
    setTrainDetails(null);

    if (!/^\d{10}$/.test(pnr)) {
      setPnrError("Invalid PNR. Please enter a 10-digit number.");
      return;
    }

    setIsFetchingPnr(true);
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const details = MOCK_PNR_DB[pnr];
    if (!details) {
      setPnrError("PNR not found. Please check and try again.");
    } else {
      setTrainDetails(details);
    }

    setIsFetchingPnr(false);
  };

  const onFileSelected = (file?: File) => {
    setImageError("");

    if (!file || !file.type.startsWith("image/")) {
      setImageError("Please upload a valid image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setImageError("File too large. Please upload an image up to 20 MB.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(objectUrl);
  };

  const captureCurrentLocation = async () => {
    setLocationError("");

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported on this device.");
      return null;
    }

    setIsCapturingLocation(true);

    const capturedLocation = await new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          resolve(coords);
        },
        () => {
          setLocation(null);
          setLocationError("Location permission denied. Please allow location access to submit.");
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

    setIsCapturingLocation(false);
    return capturedLocation;
  };

  const handleSubmit = async () => {
    setSubmitError("");

    if (requiresOtp && !otpVerified) {
      setSubmitError("Please verify OTP before submitting.");
      return;
    }

    if (complaintMode === "train" && !imageFile) {
      setSubmitError("Please upload an image as evidence.");
      return;
    }

    if (complaintMode === "emergency" && !category) {
      setSubmitError("Please select an emergency category.");
      return;
    }

    if (!trainDetails) {
      setSubmitError("Please fetch valid PNR details before submitting.");
      return;
    }

    if (!canSubmit) {
      return;
    }

    let finalLocation: { latitude: number; longitude: number } | null = null;

    if (useManualLocation) {
      const parsedLatitude = Number(manualLatitude);
      const parsedLongitude = Number(manualLongitude);

      if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
        setLocationError("Please enter valid latitude and longitude values.");
        return;
      }

      if (parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180) {
        setLocationError("Latitude must be between -90 and 90, and longitude between -180 and 180.");
        return;
      }

      finalLocation = {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      };
      setLocation(finalLocation);
      setLocationError("");
    } else {
      finalLocation = location;

      if (!finalLocation) {
        finalLocation = await captureCurrentLocation();
      }

      if (!finalLocation) {
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Step 1: Generate complaint ID and upload image if present
      let imagePath: string | undefined;
      const complaintId = `RM${Math.floor(10000000 + Math.random() * 90000000)}`;

      if (imageFile && complaintMode === "train") {
        const formData = new FormData();
        formData.append("complaintId", complaintId);
        formData.append("image", imageFile);

        const uploadResponse = await fetch("/api/complaints/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = (await uploadResponse.json()) as { error?: string; imagePath?: string };

        if (!uploadResponse.ok) {
          setSubmitError(uploadData.error ?? "Failed to upload image. Please try again.");
          return;
        }

        imagePath = uploadData.imagePath;
      }

      // Step 2: Register complaint with image path
      const response = await fetch("/api/complaints/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintId,
          complaintMode,
          pnr,
          phone,
          category: complaintMode === "emergency" ? category : undefined,
          description,
          trainDetails,
          location: finalLocation,
          imagePath,
        }),
      });

      const data = (await response.json()) as { error?: string; complaintId?: string };

      if (!response.ok) {
        setSubmitError(data.error ?? "Unable to register complaint.");
        return;
      }

      setCrn(data.complaintId ?? complaintId);
      setSubmitted(true);
    } catch {
      setSubmitError("Unable to register complaint right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const complaintModes: { value: ComplaintMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "train", label: "Train Complaint", icon: Train },
    { value: "emergency", label: "Emergency", icon: Siren },
  ];

  if (submitted) {
    return (
      <Card className="mx-auto w-full max-w-3xl rounded-2xl border border-green-200 bg-white shadow-xl shadow-green-100/40">
        <CardContent className="space-y-6 p-5 sm:p-8">
          <div className="rounded-2xl border border-green-200 bg-green-50/80 p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <BadgeCheck className="h-7 w-7 text-green-700" />
            </div>
            <h2 className="text-2xl font-semibold text-green-800">✅ Complaint submitted successfully</h2>
            <p className="mt-3 text-lg font-bold tracking-wide text-slate-900">Complaint ID: {crn}</p>
            <p className="mt-2 text-sm text-slate-700">
              Your complaint has been forwarded to the concerned railway staff.
            </p>
            <p className="text-sm text-slate-600">Updates will be shared via SMS.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-slate-900">
              <Sparkles className="h-4 w-4 text-blue-700" />
              <h3 className="font-medium">Status Simulation</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
                <p className="text-xs font-medium text-blue-700">Assigned</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Completed</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-xs font-medium text-amber-700">In Progress</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Queued</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                <p className="text-xs font-medium text-slate-500">Resolved</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <CardHeader className="space-y-2 border-b border-slate-100 pb-6">
        <CardTitle className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
          🚆 Rail Madad – Register Complaint
        </CardTitle>
        <p className="text-center text-sm text-slate-500">
          Secure grievance submission with OTP verification and PNR-linked train details.
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-700" />
            <h3 className="font-medium text-slate-900">Complaint Type</h3>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {complaintModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = complaintMode === mode.value;

              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => {
                    setComplaintMode(mode.value);
                    setSubmitError("");
                    setPnrError("");
                    setCategory("");
                    if (mode.value !== "train") {
                      setPnr("");
                      setTrainDetails(null);
                    }
                  }}
                  className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition-all ${
                    isActive
                      ? "border-blue-300 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    {mode.label}
                  </span>
                  {isActive ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </div>

          {complaintMode === "emergency" ? (
            <div className="mt-3 space-y-3">
              <p className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                Emergency complaints are prioritized and routed immediately.
              </p>

              <div className="rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs text-red-800">
                <ul className="list-disc space-y-1 pl-4">
                  <li>Train Control Office and on-board staff (TTE / Guard) are alerted immediately.</li>
                  <li>Coach attendant will reach your seat shortly.</li>
                  <li>First aid will be provided onboard.</li>
                  <li>Medical assistance will be arranged at the next major station.</li>
                </ul>
              </div>
            </div>
          ) : null}
        </section>

        {requiresOtp ? (
          <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm transition-all duration-300 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-700" />
              <h3 className="font-medium text-slate-900">Phone Number + OTP Verification</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <Label htmlFor="phone" className="mb-2 block text-slate-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="rounded-xl bg-white"
                />
              </div>
              {!otpVerified ? (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="mt-auto rounded-xl bg-blue-700 hover:bg-blue-800"
                >
                  {isSendingOtp ? <Spinner className="mr-2" /> : null}
                  Send OTP
                </Button>
              ) : null}
            </div>

            {otpSent && !otpVerified ? (
              <div className="mt-4 space-y-3 rounded-xl border border-blue-100 bg-blue-50/80 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div>
                    <Label htmlFor="otp" className="mb-2 block text-slate-700">
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="rounded-xl bg-white"
                    />
                    {debugOtp ? <p className="mt-2 text-xs font-medium text-blue-700">Debug OTP: {debugOtp}</p> : null}
                  </div>
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    className="mt-auto rounded-xl"
                  >
                    {isVerifyingOtp ? <Spinner className="mr-2" /> : null}
                    Verify OTP
                  </Button>
                </div>
              </div>
            ) : null}

            {otpVerified ? <p className="mt-3 text-sm font-medium text-green-600">✅ Verified</p> : null}
            {otpError ? <p className="mt-2 text-sm text-red-600">{otpError}</p> : null}
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm sm:p-5">
            <p className="text-sm font-medium text-amber-800">Emergency mode: phone number and OTP are not required.</p>
          </section>
        )}

        <div
          className={`space-y-6 transition-all duration-300 ${isLocked ? "pointer-events-none opacity-50" : "opacity-100"}`}
          aria-disabled={isLocked}
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-700" />
              <h3 className="font-medium text-slate-900">PNR Input</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <Label htmlFor="pnr" className="mb-2 block text-slate-700">
                  Enter PNR Number
                </Label>
                <Input
                  id="pnr"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit PNR Number"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="rounded-xl"
                />
              </div>
              <Button
                type="button"
                onClick={handleFetchPnr}
                disabled={isFetchingPnr}
                className="mt-auto rounded-xl"
              >
                {isFetchingPnr ? <Spinner className="mr-2" /> : null}
                Fetch Details
              </Button>
            </div>

            {isFetchingPnr ? (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800">
                <p className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Fetching train details...
                </p>
              </div>
            ) : null}

            {pnrError ? <p className="mt-2 text-sm text-red-600">{pnrError}</p> : null}

            {trainDetails ? (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700 shadow-sm">
                <div className="mb-3 flex items-center gap-2 font-medium text-slate-900">
                  <Train className="h-4 w-4 text-blue-700" />
                  Train Journey Details
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <p>
                    <span className="font-medium">Train Name:</span> {trainDetails.trainName}
                  </p>
                  <p>
                    <span className="font-medium">Train No:</span> {trainDetails.trainNumber}
                  </p>
                  <p>
                    <span className="font-medium">Coach:</span> {trainDetails.coach}
                  </p>
                  <p>
                    <span className="font-medium">Seat:</span> {trainDetails.seat}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="font-medium">Journey Route:</span> {trainDetails.from} → {trainDetails.to}
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          {complaintMode === "emergency" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-700" />
                <h3 className="font-medium text-slate-900">Emergency Category</h3>
              </div>

              <Label htmlFor="complaint-category" className="mb-2 block text-slate-700">
                Select Emergency Category
              </Label>
              <select
                id="complaint-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Select emergency category</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </section>
          ) : null}

          {complaintMode === "train" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-blue-700" />
                <h3 className="font-medium text-slate-900">Image Upload</h3>
              </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                onFileSelected(e.dataTransfer.files?.[0]);
              }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}`}
            >
              <UploadCloud className="mx-auto mb-2 h-8 w-8 text-blue-700" />
              <p className="text-sm text-slate-700">Drag & drop image here</p>
              <p className="text-xs text-slate-500">or use the buttons below</p>
              <p className="mt-1 text-xs text-slate-500">Max 20 MB</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => uploadInputRef.current?.click()}
                className="rounded-xl"
              >
                Select File
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="rounded-xl"
              >
                Open Camera
              </Button>
            </div>

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFileSelected(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onFileSelected(e.target.files?.[0])}
            />

            {imageFile ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <p className="mb-2 text-sm text-slate-600">
                  {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <img src={imagePreview} alt="Complaint preview" className="h-48 w-full rounded-xl object-cover" />
              </div>
            ) : null}

              {imageError ? <p className="mt-3 text-sm text-red-600">{imageError}</p> : null}
            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-700" />
              <h3 className="font-medium text-slate-900">Location Capture</h3>
            </div>

            <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={useManualLocation}
                onChange={(e) => {
                  setUseManualLocation(e.target.checked);
                  setLocationError("");
                }}
              />
              Use manual latitude/longitude (testing)
            </label>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm text-slate-700">
              <p className="font-medium">Helps in faster resolution</p>
              <p className="mt-1">
                {useManualLocation
                  ? "Manual coordinates will be used for routing during submission."
                  : complaintMode === "emergency"
                    ? "Location will be captured automatically during emergency complaint submission."
                    : "Location can be captured now or automatically during submission."}
              </p>
            </div>

            {useManualLocation ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="manual-latitude" className="mb-2 block text-slate-700">
                    Latitude
                  </Label>
                  <Input
                    id="manual-latitude"
                    placeholder="e.g. 12.971600"
                    value={manualLatitude}
                    onChange={(e) => setManualLatitude(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-longitude" className="mb-2 block text-slate-700">
                    Longitude
                  </Label>
                  <Input
                    id="manual-longitude"
                    placeholder="e.g. 77.594600"
                    value={manualLongitude}
                    onChange={(e) => setManualLongitude(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            ) : null}

            {complaintMode === "train" && !useManualLocation ? (
              <Button
                type="button"
                variant="outline"
                onClick={captureCurrentLocation}
                disabled={isCapturingLocation}
                className="mt-3 rounded-xl"
              >
                {isCapturingLocation ? <Spinner className="mr-2" /> : <Navigation className="mr-2 h-4 w-4" />}
                Get Location
              </Button>
            ) : null}

            {isCapturingLocation && !useManualLocation ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-blue-700">
                <Spinner className="h-4 w-4" />
                Capturing your current location...
              </p>
            ) : null}
            {location ? (
              <p className="mt-3 text-sm text-green-700">
                Latitude: {location.latitude.toFixed(6)} | Longitude: {location.longitude.toFixed(6)}
              </p>
            ) : null}
            {locationError ? <p className="mt-3 text-sm text-red-600">{locationError}</p> : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-700" />
              <h3 className="font-medium text-slate-900">Description (Optional)</h3>
            </div>

            <Textarea
              placeholder="Describe the issue clearly (optional)"
              maxLength={DESCRIPTION_LIMIT}
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_LIMIT))}
              className="min-h-28 rounded-xl"
            />
            <p className="mt-2 text-xs text-slate-500">Provide clear details for faster resolution.</p>
            <p className="mt-1 text-right text-xs text-slate-500">
              {description.length}/{DESCRIPTION_LIMIT}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              <h3 className="font-medium text-slate-900">Submit</h3>
            </div>

            <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-800">Selected Mode: {getModeLabel(complaintMode)}</p>
              <p className="mt-1">
                {complaintMode === "emergency"
                  ? "Required: PNR fetched and emergency category selected. Location is captured automatically."
                  : "Required: OTP verified, PNR fetched, and image uploaded. AI classifies category internally."}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting || isCapturingLocation}
              className="w-full rounded-xl bg-blue-700 py-6 text-base hover:bg-blue-800"
            >
              {isSubmitting || isCapturingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCapturingLocation ? "Capturing location..." : "Submitting..."}
                </>
              ) : (
                "Register Complaint"
              )}
            </Button>

            {!canSubmit ? (
              <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                <Lock className="mt-0.5 h-3.5 w-3.5" />
                <p>
                  {complaintMode === "emergency"
                    ? "Submit is enabled only after PNR fetch success and emergency category selection."
                    : "Submit is enabled only after OTP verification, PNR fetch success, and image upload."}
                </p>
              </div>
            ) : null}

            {submitError ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-700">
                <ShieldAlert className="h-4 w-4" />
                {submitError}
              </p>
            ) : null}
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
