import { PageTransition } from "@/components/common/PageTransition";

// Next.js requires a default export for template files; it remounts per
// navigation, driving the page-entrance animation.
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
