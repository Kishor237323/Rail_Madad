"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { 
  Upload, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2,
  X,
  Sparkles,
  Train,
  Phone,
  User,
  FileText
} from "lucide-react";
import { CATEGORY_LABELS, type ComplaintCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AIClassificationResult {
  category: ComplaintCategory;
  confidence: number;
  detectedIssues: string[];
}

export function ComplaintForm() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  
  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [coachNumber, setCoachNumber] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pnr, setPnr] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Simulate AI analysis
    setIsAnalyzing(true);
    setTimeout(() => {
      const categories: ComplaintCategory[] = ["cleanliness", "infrastructure", "electrical", "overcrowding"];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const confidence = 0.75 + Math.random() * 0.2;
      
      const issuesByCategory: Record<string, string[]> = {
        cleanliness: ["Unclean floor surface detected", "Visible waste materials", "Stains on seats"],
        infrastructure: ["Damaged seat cushion", "Broken window latch", "Torn curtain"],
        electrical: ["Non-functional light fixture", "Damaged charging point", "Fan not working"],
        overcrowding: ["Excessive passengers in coach", "Blocked emergency exit", "Unsafe standing conditions"],
      };
      
      setAiResult({
        category: randomCategory,
        confidence,
        detectedIssues: issuesByCategory[randomCategory] || ["Issue detected"],
      });
      setSelectedCategory(randomCategory);
      setIsAnalyzing(false);
    }, 2000);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError("");
        },
        (error) => {
          setLocationError("Unable to get location. Please enter train details manually.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newId = `RM${Date.now().toString(36).toUpperCase()}`;
    setComplaintId(newId);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setStep(1);
    setImageFile(null);
    setImagePreview(null);
    setAiResult(null);
    setSelectedCategory("");
    setDescription("");
    setLocation(null);
    setTrainNumber("");
    setCoachNumber("");
    setName("");
    setPhone("");
    setPnr("");
    setSubmitted(false);
    setComplaintId("");
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto border-success/30 bg-success/5">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Complaint Submitted Successfully</h2>
            <p className="text-muted-foreground mb-6">Your complaint has been registered and will be addressed shortly.</p>
            
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Your Complaint ID</p>
              <p className="text-2xl font-mono font-bold text-primary">{complaintId}</p>
              <p className="text-xs text-muted-foreground mt-2">Save this ID to track your complaint status</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={resetForm} variant="outline">
                Submit Another Complaint
              </Button>
              <Button asChild>
                <a href={`/track?id=${complaintId}`}>Track Complaint</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-16 sm:w-24 h-1 mx-2",
                    step > s ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-xs text-muted-foreground">Upload Image</span>
          <span className="text-xs text-muted-foreground">Details</span>
          <span className="text-xs text-muted-foreground">Contact</span>
        </div>
      </div>

      {/* Step 1: Image Upload */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Upload Complaint Image
            </CardTitle>
            <CardDescription>
              Take a photo or upload an image of the issue. Our AI will automatically analyze and categorize it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground font-medium mb-1">Drop an image here or click to upload</p>
                <p className="text-sm text-muted-foreground">Supports JPG, PNG, WEBP up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Uploaded complaint"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setAiResult(null);
                      setSelectedCategory("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isAnalyzing ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Spinner className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Analyzing image with AI...</p>
                        <p className="text-sm text-muted-foreground">Detecting issues and categorizing complaint</p>
                      </div>
                    </div>
                  </div>
                ) : aiResult && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-foreground">AI Analysis Complete</p>
                          <Badge variant="secondary">
                            {Math.round(aiResult.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Detected category: <span className="font-medium text-foreground">{CATEGORY_LABELS[aiResult.category]}</span>
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Detected Issues:</p>
                          <ul className="text-sm text-foreground space-y-1">
                            {aiResult.detectedIssues.map((issue, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" disabled>
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!imagePreview || isAnalyzing}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Complaint Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Complaint Details
            </CardTitle>
            <CardDescription>
              Provide additional details about the issue and your location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ComplaintCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {aiResult && selectedCategory === aiResult.category && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI suggested category
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getLocation}
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Get Current Location
                </Button>
              </div>
              
              {location && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <p className="text-sm text-success flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
              )}
              
              {locationError && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm text-warning-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {locationError}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="train">Train Number</Label>
                  <div className="relative">
                    <Train className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="train"
                      placeholder="e.g., 12301"
                      value={trainNumber}
                      onChange={(e) => setTrainNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coach">Coach Number</Label>
                  <Input
                    id="coach"
                    placeholder="e.g., S5"
                    value={coachNumber}
                    onChange={(e) => setCoachNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedCategory}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Contact Information */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Provide your contact details for follow-up communication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pnr">PNR Number (Optional)</Label>
              <Input
                id="pnr"
                placeholder="Enter 10-digit PNR"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Providing PNR helps us verify your journey details
              </p>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">Complaint Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Category:</div>
                <div className="text-foreground">{selectedCategory && CATEGORY_LABELS[selectedCategory]}</div>
                {trainNumber && (
                  <>
                    <div className="text-muted-foreground">Train:</div>
                    <div className="text-foreground">{trainNumber}</div>
                  </>
                )}
                {coachNumber && (
                  <>
                    <div className="text-muted-foreground">Coach:</div>
                    <div className="text-foreground">{coachNumber}</div>
                  </>
                )}
              </div>
              {aiResult && (
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">AI Confidence:</span>
                  <span className="text-foreground">{Math.round(aiResult.confidence * 100)}%</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!name || !phone || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  "Submit Complaint"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
