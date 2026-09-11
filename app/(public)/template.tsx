// Templates remount on every navigation, so this CSS entrance replays per
// page. CSS rather than Framer so the first paint doesn't wait on hydration.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
