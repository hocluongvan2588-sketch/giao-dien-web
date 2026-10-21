import { TemplateForm } from "../TemplateForm";

export default function NewTemplatePage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Thêm giao diện mới</h1>
      <p className="mt-1 text-sm text-brand-900/60">Dán mã HTML, xem trước ngay, điền thông tin rồi lưu. Ảnh thumbnail sẽ được chụp tự động.</p>
      <div className="mt-6"><TemplateForm /></div>
    </div>
  );
}
