export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="sanity-studio" style={{ height: '100vh', width: '100vw' }}>
      {children}
    </div>
  );
}
