"use client";

import { useSearchParams } from "next/navigation";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CreateSuccessPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const token = searchParams.get("token");
  const [copied, setCopied] = useState(false);
  const [adminUrl, setAdminUrl] = useState("");
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && slug) {
      const baseUrl = window.location.origin;
      setPublicUrl(`${baseUrl}/m/${slug}`);
      if (token) {
        setAdminUrl(`${baseUrl}/m/${slug}/edit?token=${token}`);
      }
    }
  }, [slug, token]);

  const copyAdminUrl = () => {
    if (!adminUrl) return;
    navigator.clipboard.writeText(adminUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!slug) {
    return <div className="p-10 text-center text-destructive">Lỗi: Không tìm thấy thông tin trang.</div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card p-8 rounded-2xl shadow-lg border text-center space-y-8">
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Tạo trang kỷ niệm thành công!</h1>
          <p className="text-muted-foreground">
            Trang của bạn đã sẵn sàng để chia sẻ với người ấy.
          </p>
        </div>

        <div className="space-y-6 text-left">
          {/* Public Link */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Link công khai (Dành để chia sẻ):</label>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={publicUrl} 
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none cursor-text"
              />
              <Button variant="outline">
                <Link href={`/m/${slug}`} target="_blank" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" /> Xem
                </Link>
              </Button>
            </div>
          </div>

          {/* Admin Link */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-3">
            <h3 className="font-bold text-primary flex items-center gap-2">
              ⚠️ QUAN TRỌNG: Link Quản Trị
            </h3>
            <p className="text-sm text-muted-foreground">
              Đây là link duy nhất để bạn có thể chỉnh sửa lại trang kỷ niệm này trong tương lai. Hãy sao chép và cất giữ thật cẩn thận!
            </p>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={adminUrl} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none cursor-text"
              />
              <Button onClick={copyAdminUrl} variant="default" className="shrink-0">
                {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Đã copy" : "Copy Link"}
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button variant="ghost">
            <Link href="/" className="flex items-center">Quay về trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
