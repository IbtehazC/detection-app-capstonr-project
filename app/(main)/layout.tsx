import RouteGuard from "@/components/RouteGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard>{children}</RouteGuard>;
}
