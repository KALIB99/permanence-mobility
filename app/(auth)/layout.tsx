import { BrandMark } from "@/components/BrandMark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="shell-nav">
        <div className="container-pm flex items-center justify-between py-4">
          <BrandMark compact />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
