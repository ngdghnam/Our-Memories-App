import { CreateForm } from "@/features/memory/components/CreateForm";

export default function CreateMemoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Tạo Trang Kỷ Niệm
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Lưu giữ những khoảnh khắc đẹp nhất của hai bạn
        </p>
      </div>
      <CreateForm />
    </main>
  );
}
