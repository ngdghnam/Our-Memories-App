"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Trash2, Plus, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CreateMemoryFormValues, createMemorySchema } from "../schema";
import { createMemoryAction } from "../actions";
import { uploadFileToR2 } from "@/lib/upload";

export function CreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const form = useForm<CreateMemoryFormValues>({
    resolver: zodResolver(createMemorySchema),
    defaultValues: {
      title: "",
      subtitle: "",
      coverImageUrl: "",
      youtubeVideoId: "",
      letter: "",
      showTimeline: false,
      showLetter: false,
      timelineEvents: [],
      files: [],
    },
  });

  const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
    name: "timelineEvents",
    control: form.control,
  });

  const { fields: fileFields, append: appendFile, remove: removeFile } = useFieldArray({
    name: "files",
    control: form.control,
  });

  async function onSubmit(data: CreateMemoryFormValues) {
    setIsSubmitting(true);
    try {
      const result = await createMemoryAction(data);
      if (result.success) {
        localStorage.setItem(`memory_edit_token_${result.slug}`, result.editToken);
        router.push(`/create/success?slug=${result.slug}&token=${result.editToken}`);
      }
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra khi tạo trang kỷ niệm.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCoverUploading(true);
      const url = await uploadFileToR2(file);
      form.setValue("coverImageUrl", url);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải ảnh lên");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleTimelineImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFileToR2(file);
      form.setValue(`timelineEvents.${index}.imageUrl`, url);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải ảnh lên");
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await uploadFileToR2(file);
        appendFile({
          fileUrl: url,
          fileType: file.type.startsWith("video/") ? "video" : "image",
          message: "",
        });
      } catch (err) {
        console.error(err);
        alert(`Lỗi tải file ${file.name}`);
      }
    }
  };

  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 max-w-4xl mx-auto py-10 px-4">
      
      {/* Section 1: General Info */}
      <section className="space-y-6 bg-card p-6 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-semibold tracking-tight">Thông tin chung</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Tiêu đề trang</label>
          <Input placeholder="Ví dụ: Kỷ niệm 1 năm yêu nhau" {...form.register("title")} />
          {errors.title && <p className="text-[0.8rem] font-medium text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Lời tựa (Subtitle)</label>
          <Input placeholder="Một câu nói ngắn gọn hoặc ngày kỷ niệm..." {...form.register("subtitle")} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Ảnh bìa (Cover Image)</label>
          <div className="flex items-center gap-4">
            <Input type="file" accept="image/*" onChange={handleCoverUpload} disabled={coverUploading} />
            {coverUploading && <span className="text-sm text-muted-foreground">Đang tải...</span>}
          </div>
          {form.watch("coverImageUrl") && (
            <div className="mt-4">
              <img src={form.watch("coverImageUrl")} alt="Cover Preview" className="w-full h-48 object-cover rounded-md" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Nhạc nền (YouTube Video ID)</label>
          <Input placeholder="Ví dụ: dQw4w9WgXcQ" {...form.register("youtubeVideoId")} />
          <p className="text-[0.8rem] text-muted-foreground">ID của video YouTube sẽ được tự động phát làm nhạc nền ẩn.</p>
        </div>
      </section>

      {/* Section 2: Letter */}
      <section className="space-y-6 bg-card p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Bức thư tình</h2>
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm gap-4">
            <label className="text-sm font-medium leading-none">Hiển thị bức thư</label>
            <Switch
              checked={form.watch("showLetter")}
              onCheckedChange={(val) => form.setValue("showLetter", val)}
            />
          </div>
        </div>

        {form.watch("showLetter") && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Nội dung bức thư</label>
            <Textarea 
              placeholder="Viết những lời chân thành từ trái tim bạn..." 
              className="min-h-[200px] whitespace-pre-wrap" 
              {...form.register("letter")} 
            />
            <p className="text-[0.8rem] text-muted-foreground">Bạn có thể xuống dòng bình thường, hệ thống sẽ giữ nguyên định dạng.</p>
          </div>
        )}
      </section>

      {/* Section 3: Timeline */}
      <section className="space-y-6 bg-card p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Dòng thời gian (Timeline)</h2>
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm gap-4">
            <label className="text-sm font-medium leading-none">Hiển thị Timeline</label>
            <Switch
              checked={form.watch("showTimeline")}
              onCheckedChange={(val) => form.setValue("showTimeline", val)}
            />
          </div>
        </div>

        {form.watch("showTimeline") && (
          <div className="space-y-4">
            {timelineFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg relative space-y-4 bg-muted/30">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-destructive"
                  onClick={() => removeTimeline(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Ngày tháng</label>
                  <Input placeholder="VD: Ngày đầu gặp gỡ (14/02/2023)" {...form.register(`timelineEvents.${index}.eventDate` as const)} />
                  {errors.timelineEvents?.[index]?.eventDate && (
                    <p className="text-[0.8rem] font-medium text-destructive">{errors.timelineEvents[index].eventDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Nội dung sự kiện</label>
                  <Textarea placeholder="Hôm đó chúng mình đã..." {...form.register(`timelineEvents.${index}.message` as const)} />
                  {errors.timelineEvents?.[index]?.message && (
                    <p className="text-[0.8rem] font-medium text-destructive">{errors.timelineEvents[index].message.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Ảnh sự kiện (Tuỳ chọn)</label>
                  <div className="flex items-center gap-4">
                    <Input type="file" accept="image/*" onChange={(e) => handleTimelineImageUpload(index, e)} />
                  </div>
                  {form.watch(`timelineEvents.${index}.imageUrl`) && (
                    <div className="mt-2">
                      <img src={form.watch(`timelineEvents.${index}.imageUrl`)} alt="Event Preview" className="h-24 w-auto rounded-md object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={() => appendTimeline({ eventDate: "", message: "", imageUrl: "" })} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Thêm mốc thời gian
            </Button>
          </div>
        )}
      </section>

      {/* Section 4: Gallery */}
      <section className="space-y-6 bg-card p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Thư viện ảnh/video</h2>
          <p className="text-muted-foreground text-sm">Tải lên các khoảnh khắc đáng nhớ của bạn.</p>
        </div>

        <div className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-muted/50 transition-colors">
          <Input 
            type="file" 
            accept="image/*,video/mp4,video/webm" 
            multiple 
            className="hidden" 
            id="gallery-upload"
            onChange={handleGalleryUpload} 
          />
          <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <span className="font-medium">Nhấn vào đây để chọn nhiều file</span>
            <span className="text-xs text-muted-foreground">Hỗ trợ ảnh (.jpg, .png, .webp) và video (.mp4, .webm)</span>
          </label>
        </div>

        {fileFields.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {fileFields.map((field, index) => (
              <div key={field.id} className="relative group rounded-md overflow-hidden border">
                {field.fileType === "video" ? (
                  <video src={field.fileUrl} className="w-full h-32 object-cover" muted />
                ) : (
                  <img src={field.fileUrl} alt="Gallery item" className="w-full h-32 object-cover" />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => removeFile(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Input 
                  placeholder="Chú thích (tuỳ chọn)" 
                  className="absolute bottom-0 rounded-none border-0 border-t bg-background/90 text-xs h-8"
                  {...form.register(`files.${index}.message` as const)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Submit */}
      <div className="flex justify-end pt-4 pb-20">
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? "Đang tạo trang..." : "Tạo Kỷ Niệm"}
        </Button>
      </div>

    </form>
  );
}
